use actix_web::{web, HttpResponse, Error};
use uuid::Uuid;
use serde::{Serialize, Deserialize};
use serde_json::json;
use std::collections::HashMap;

use crate::{
    types::{
        app::{AppState, DatabaseService, SecurityService, AssetVerification, AuditLogger, SyncManager, MeshService, P2PService},
        security::{SecurityContext, SecurityClassification},
        audit::{AuditEvent, AuditEventType, AuditStatus, AuditContext, AuditSeverity},
        signature::{SignatureMetadata, SignatureType, SignatureAlgorithm},
    },
    error::CoreError,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct QRFormat {
    pub format: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QRResponse {
    pub qr_code: String,
    pub asset_id: String,
    pub last_verified: Option<String>,
    pub verification_count: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct VerifyQRRequest {
    pub qr_data: String,
}

pub async fn generate_asset_qr<DB, SEC, AV, AL, SM, MS, PS>(
    state: web::Data<AppState<DB, SEC, AV, AL, SM, MS, PS>>,
    asset_id: web::Path<Uuid>,
    format: web::Query<QRFormat>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> 
where
    DB: DatabaseService,
    SEC: SecurityService,
    AV: AssetVerification,
    AL: AuditLogger,
    SM: SyncManager,
    MS: MeshService,
    PS: P2PService,
{
    // Get asset
    let asset = match state.database
        .get_asset(asset_id.into_inner(), &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))? {
            Some(asset) => asset,
            None => return Ok(HttpResponse::NotFound().json(json!({
                "error": "Not found",
                "message": "Asset not found"
            }))),
    };

    // Verify asset using asset verification service
    let verification_result = state.verification
        .verify_asset(&asset.id.to_string(), &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    // Create audit context
    let context = AuditContext::new(
        "GENERATE_QR".to_string(),
        AuditSeverity::Low,
        SecurityClassification::Confidential,
        security_context.user_id,
    );

    // Create audit event
    let event = AuditEvent::new(
        AuditEventType::AssetCreated,
        json!({
            "asset_id": asset.id,
            "qr_format": format.format,
            "verification_result": format!("{:?}", verification_result),
        }),
        context,
    );

    // Log the event
    state.audit.log_event(event, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    // Return QR code
    Ok(HttpResponse::Ok().json(QRResponse {
        qr_code: format!("{:?}", verification_result),
        asset_id: asset.id.to_string(),
        last_verified: asset.last_verified.map(|dt| dt.to_rfc3339()),
        verification_count: Some(asset.verification_count),
    }))
}

pub async fn verify_qr_code<DB, SEC, AV, AL, SM, MS, PS>(
    state: web::Data<AppState<DB, SEC, AV, AL, SM, MS, PS>>,
    request: web::Json<VerifyQRRequest>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> 
where
    DB: DatabaseService,
    SEC: SecurityService,
    AV: AssetVerification,
    AL: AuditLogger,
    SM: SyncManager,
    MS: MeshService,
    PS: P2PService,
{
    // Verify QR code using asset verification service
    let verification_result = state.verification
        .verify_asset(&request.qr_data, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    // Create audit context
    let context = AuditContext::new(
        "VERIFY_QR".to_string(),
        AuditSeverity::Low,
        SecurityClassification::Confidential,
        security_context.user_id,
    );

    // Create audit event
    let event = AuditEvent::new(
        AuditEventType::AssetVerified,
        json!({
            "qr_data": request.qr_data,
            "verification_result": format!("{:?}", verification_result),
        }),
        context,
    );

    // Log the event
    state.audit.log_event(event, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    Ok(HttpResponse::Ok().json(json!({
        "verification_result": format!("{:?}", verification_result),
    })))
}
