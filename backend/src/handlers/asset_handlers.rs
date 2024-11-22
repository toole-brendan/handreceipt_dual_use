// backend/src/handlers/asset_handlers.rs

use actix_web::{web, HttpResponse, Error, Responder};
use serde::{Deserialize};
use serde_json::json;
use uuid::Uuid;
use chrono::Utc;

use crate::core::{AppState, Asset, SecurityContext, AssetStatus, SecurityClassification};
use crate::models::UuidWrapper;
use crate::services::database::JsonWrapper;
use crate::models::QRFormat;
use crate::services::rfid::RFIDScanner;
use crate::services::AuditStatus;

#[derive(Debug, Deserialize)]
pub struct TransferRequest {
    to_custodian: String,
    hand_receipt: String,
    notes: Option<String>,
}

pub async fn create_asset(
    state: web::Data<AppState>,
    asset_data: web::Json<Asset>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Validate input
    if asset_data.name.is_empty() {
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Validation failed",
            "message": "Asset name cannot be empty"
        })));
    }

    // Create new asset with NFT support
    let mut asset = Asset {
        id: Uuid::new_v4(),
        name: asset_data.name.clone(),
        description: asset_data.description.clone(),
        status: AssetStatus::Active,
        classification: security_context.classification.clone(),
        metadata: asset_data.metadata.clone(),
        signatures: vec![],
        created_at: Utc::now(),
        updated_at: Utc::now(),
        qr_code: None,
        last_verified: None,
        verification_count: 0,
        rfid_tag_id: None,
        rfid_last_scanned: None,
        token_id: None,
        current_custodian: None,
        hand_receipt_hash: None,
        last_known_location: None,
        location_history: Vec::new(),
        geofence_restrictions: Vec::new(),
        location_classification: SecurityClassification::Unclassified,
    };

    // Generate QR code
    let qr_code = state.qr_service.generate_asset_qr(asset.id)
        .map_err(actix_web::error::ErrorInternalServerError)?;
    asset.qr_code = Some(qr_code.clone());

    // Mint property token
    let token = state.blockchain
        .mint_property_token(
            asset.id,
            security_context.user_id.to_string(),
            asset.to_property_metadata(),
            qr_code,
            &security_context,
        )
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    // Update asset with token info
    asset.token_id = Some(token.token_id);
    asset.current_custodian = Some(token.owner);

    // Store in database
    let query = "INSERT INTO assets (id, name, description, status, classification, metadata, created_at, updated_at, token_id, current_custodian) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
    
    let metadata_json = serde_json::to_value(&asset.metadata)
        .map_err(actix_web::error::ErrorInternalServerError)?;
    
    state.database
        .execute_query(
            query,
            &[
                &asset.id,  // Changed from UuidWrapper
                &asset.name,
                &asset.description,
                &asset.status,  // Let the database handle enum conversion
                &asset.classification,
                &JsonWrapper(metadata_json),
                &asset.created_at,
                &asset.updated_at,
                &asset.token_id.unwrap(),  // Changed from UuidWrapper
                &asset.current_custodian,
            ],
            &security_context,
        )
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    // Log the creation of the asset
    state.audit_logger
        .log_action(
            "CREATE_ASSET",
            &format!("Asset created successfully: {}", asset.id),
            &security_context,
            "Asset",
            Some(asset.id),
            AuditStatus::Info,
            json!({
                "asset_id": asset.id,
                "asset_name": asset.name,
            }),
        )
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Created().json(asset))
}

pub async fn get_asset(
    state: web::Data<AppState>,
    id: web::Path<Uuid>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<impl Responder, Error> {
    let asset = state
        .database
        .get_asset(id.into_inner(), &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

    match asset {
        Some(asset) => Ok(HttpResponse::Ok().json(asset).map_into_boxed_body()),
        None => Ok(HttpResponse::NotFound().json(json!({
            "error": "Not found",
            "message": "Asset not found"
        })).map_into_boxed_body()),
    }
}

pub async fn update_asset(
    state: web::Data<AppState>,
    id: web::Path<Uuid>,
    asset_data: web::Json<Asset>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<impl Responder, Error> {
    // Check if asset exists and user has access
    let existing_asset = state
        .database
        .get_asset(id.into_inner(), &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

    let asset = match existing_asset {
        Some(mut asset) => {
            // Update fields
            asset.name = asset_data.name.clone();
            asset.description = asset_data.description.clone();
            asset.metadata = asset_data.metadata.clone();
            asset.updated_at = chrono::Utc::now();

            // Update in database
            let query = "UPDATE assets 
                        SET name = $1, description = $2, metadata = $3, updated_at = $4 
                        WHERE id = $5 AND classification <= $6";
            
            state.database
                .execute_query(
                    query,
                    &[
                        &asset.name,
                        &asset.description,
                        &JsonWrapper(serde_json::to_value(&asset.metadata).unwrap()),
                        &asset.updated_at,
                        &asset.id,  // Changed from UuidWrapper
                        &security_context.classification,
                    ],
                    &security_context,
                )
                .await
                .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

            asset
        }
        None => {
            return Ok(HttpResponse::NotFound().json(json!({
                "error": "Not found",
                "message": "Asset not found"
            })).map_into_boxed_body());
        }
    };

    Ok(HttpResponse::Ok().json(asset).map_into_boxed_body())
}

pub async fn delete_asset(
    state: web::Data<AppState>,
    id: web::Path<Uuid>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<impl Responder, Error> {
    // Soft delete by updating status
    let query = "UPDATE assets 
                 SET status = $1, updated_at = $2 
                 WHERE id = $3 AND classification <= $4";
    
    let result = state
        .database
        .execute_query(
            query,
            &[
                &AssetStatus::Deleted,  // Let database handle enum conversion
                &Utc::now(),
                &id.into_inner(),  // Changed from UuidWrapper
                &security_context.classification,
            ],
            &security_context,
        )
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

    if result.is_empty() {
        Ok(HttpResponse::NotFound().json(json!({
            "error": "Not found",
            "message": "Asset not found"
        })).map_into_boxed_body())
    } else {
        Ok(HttpResponse::NoContent().finish().map_into_boxed_body())
    }
}

pub async fn list_assets(
    state: web::Data<AppState>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<impl Responder, Error> {
    let query = "SELECT * FROM assets WHERE classification <= $1 AND status != $2";
    
    let rows = state
        .database
        .execute_query(
            query,
            &[
                &security_context.classification.clone(),
                &AssetStatus::Deleted.to_string(),
            ],
            &security_context,
        )
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

    let assets: Vec<Asset> = rows
        .iter()
        .map(|row| {
            let metadata_wrapper: JsonWrapper = row.get("metadata");
            let metadata = metadata_wrapper.0.as_object()
                .map(|obj| obj.iter()
                    .filter_map(|(k, v)| {
                        v.as_str().map(|s| (k.clone(), s.to_string()))
                    })
                    .collect())
                .unwrap_or_default();

            Asset {
                id: row.get::<_, UuidWrapper>("id").into(),
                name: row.get("name"),
                description: row.get("description"),
                status: row.get::<_, String>("status").parse().unwrap(),
                classification: row.get("classification"),
                metadata,
                signatures: vec![],
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
                qr_code: row.get("qr_code"),
                last_verified: row.get("last_verified"),
                verification_count: row.get("verification_count"),
                rfid_tag_id: row.get("rfid_tag_id"),
                rfid_last_scanned: row.get("rfid_last_scanned"),
                token_id: row.get("token_id"),
                current_custodian: row.get("current_custodian"),
                hand_receipt_hash: row.get("hand_receipt_hash"),
                last_known_location: row.get("last_known_location"),
                location_history: row.get("location_history"),
                geofence_restrictions: row.get("geofence_restrictions"),
                location_classification: row.get("location_classification"),
            }
        })
        .collect();

    Ok(HttpResponse::Ok().json(assets).map_into_boxed_body())
}

pub async fn get_asset_qr(
    state: web::Data<AppState>,
    asset_id: web::Path<Uuid>,
    format: web::Query<QRFormat>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    let asset = match state
        .database
        .get_asset(asset_id.into_inner(), &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))? {
            Some(asset) => asset,
            None => return Ok(HttpResponse::NotFound().json(json!({
                "error": "Not found",
                "message": "Asset not found"
            }))),
    };

    // Generate QR code in requested format
    let response = match format.format.as_deref() {
        Some("svg") => {
            let svg = state
                .qr_service
                .generate_svg(asset.id)
                .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;
            
            HttpResponse::Ok()
                .content_type("image/svg+xml")
                .body(svg)
        }
        _ => {
            let png = state
                .qr_service
                .generate_asset_qr(asset.id)
                .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;
            
            HttpResponse::Ok().json(json!({
                "qr_code": png,
                "asset_id": asset.id,
                "last_verified": asset.last_verified,
                "verification_count": asset.verification_count
            }))
        }
    };

    // Log QR code generation
    state.audit_logger
        .log_action(
            "GENERATE_QR",
            &format!("Generated QR code for asset: {}", asset.id),
            &security_context,
            "Asset",
            Some(asset.id),
            AuditStatus::Info,
            json!({
                "asset_name": asset.name,
                "classification": asset.classification,
                "format": format.format,
            }),
        )
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

    Ok(response)
}

pub async fn verify_asset_scan(
    state: web::Data<AppState>,
    asset_id: web::Path<Uuid>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    let mut asset = match state
        .database
        .get_asset(asset_id.into_inner(), &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))? {
            Some(asset) => asset,
            None => return Ok(HttpResponse::NotFound().json(json!({
                "error": "Not found",
                "message": "Asset not found"
            }))),
    };

    // Update verification info
    asset.verify_scan();

    // Update in database
    state.database
        .update_asset(&asset, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

    // Log the verification
    state.audit_logger
        .log_action(
            "VERIFY_ASSET",
            &format!("Asset {} verified via QR scan", asset.id),
            &security_context,
            "Asset",
            Some(asset.id),
            AuditStatus::Info,
            json!({
                "verification_count": asset.verification_count,
                "last_verified": asset.last_verified,
            }),
        )
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

    Ok(HttpResponse::Ok().json(json!({
        "message": "Asset verification recorded",
        "verification_count": asset.verification_count,
        "last_verified": asset.last_verified
    })))
}

pub async fn scan_rfid_tag(
    state: web::Data<AppState>,
) -> Result<HttpResponse, Error> {
    let tag_id = state.rfid_service.scan_tag().await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;
    
    Ok(HttpResponse::Ok().json(json!({ 
        "success": true,
        "data": {
            "tag_id": tag_id,
            "timestamp": chrono::Utc::now()
        }
    })))
}

pub async fn associate_rfid_tag(
    state: web::Data<AppState>,
    asset_id: web::Path<String>,
    body: web::Json<serde_json::Value>,
) -> Result<HttpResponse, Error> {
    let tag_id = body.get("tag_id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| actix_web::error::ErrorBadRequest("Missing tag_id"))?;

    state.rfid_service.write_tag(&asset_id).await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;
    
    Ok(HttpResponse::Ok().json(json!({ 
        "success": true,
        "message": "RFID tag associated successfully",
        "data": {
            "asset_id": asset_id.as_str(),
            "tag_id": tag_id
        }
    })))
}

pub async fn transfer_property(
    state: web::Data<AppState>,
    asset_id: web::Path<Uuid>,
    transfer_data: web::Json<TransferRequest>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<impl Responder, Error> {
    let mut asset = match state
        .database
        .get_asset(asset_id.into_inner(), &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))? {
            Some(asset) => asset,
            None => return Ok(HttpResponse::NotFound().json(json!({
                "error": "Not found",
                "message": "Asset not found"
            }))),
    };

    // Verify current custodian
    if asset.current_custodian.as_ref() != Some(&security_context.user_id.to_string()) {
        return Ok(HttpResponse::Forbidden().json(json!({
            "error": "Forbidden",
            "message": "Only current custodian can transfer property"
        })));
    }

    // Create digital hand receipt
    let hand_receipt_hash = state.security
        .hash_document(&transfer_data.hand_receipt)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

    // Transfer property token
    let transfer = state.blockchain
        .transfer_property_token(
            asset.token_id.ok_or_else(|| actix_web::error::ErrorInternalServerError("Asset has no token"))?,
            security_context.user_id.to_string(),
            transfer_data.to_custodian.clone(),
            hand_receipt_hash.clone(),
            &security_context,
        )
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

    // Update asset status and custodian
    asset.status = AssetStatus::InTransit;
    asset.current_custodian = Some(transfer_data.to_custodian.clone());
    asset.hand_receipt_hash = Some(hand_receipt_hash);
    asset.updated_at = Utc::now();

    // Update in database
    state.database
        .update_asset(&asset, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

    Ok(HttpResponse::Ok().json(json!({
        "message": "Property transfer initiated",
        "transfer_id": transfer.digital_signature,
        "status": "pending_acceptance"
    })))
}