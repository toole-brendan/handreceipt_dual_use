use actix_web::{web, HttpResponse, Error};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use std::sync::Arc;
use chrono::{DateTime, Utc};
use base64::encode;

use crate::{
    domain::models::{
        qr::{QRData, QRCodeService, VerifyQRRequest, QRFormat},
        transfer::TransferStatus,
    },
    types::app::PropertyService,
    application::transfer::commands::TransferCommandService,
    types::security::SecurityContext,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanRequest {
    pub qr_data: String,
    pub device_id: String,
    pub location: Option<String>,
    pub offline_id: Option<String>,
    pub scanned_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PropertyDetails {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub nsn: Option<String>,
    pub serial_number: Option<String>,
    pub is_sensitive: bool,
    pub current_custodian: Option<String>,
    pub last_verified: Option<DateTime<Utc>>,
    pub requires_officer_approval: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanResponse {
    pub scan_id: Uuid,
    pub property: PropertyDetails,
    pub status: TransferStatus,
    pub requires_approval: bool,
    pub offline_sync_id: Option<String>,
}

/// Handles mobile QR code scanning
pub async fn process_scan(
    transfer_service: web::Data<Arc<TransferCommandService>>,
    property_service: web::Data<Arc<dyn PropertyService>>,
    qr_service: web::Data<Arc<dyn QRCodeService>>,
    user_id: web::ReqData<String>,
    request: web::Json<ScanRequest>,
) -> Result<HttpResponse, Error> {
    let user_uuid = Uuid::parse_str(&user_id.into_inner())
        .map_err(actix_web::error::ErrorBadRequest)?;
    let context = SecurityContext::new(user_uuid);

    // Verify QR code
    let verify_request = VerifyQRRequest {
        qr_data: request.qr_data.clone(),
        scanner_id: request.device_id.clone(),
        location: request.location.clone(),
        timestamp: request.scanned_at,
        signature: None,
    };

    let qr_data = qr_service
        .validate_qr(verify_request, &context)
        .await
        .map_err(actix_web::error::ErrorBadRequest)?;

    // Get property details
    let property = property_service
        .get_property(qr_data.property_id, &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?
        .ok_or_else(|| actix_web::error::ErrorNotFound("Property not found"))?;

    // Create transfer if valid
    let transfer_result = transfer_service
        .initiate_transfer_with_qr(
            crate::application::transfer::commands::ScanQRTransferCommand {
                qr_data: request.qr_data.clone(),
                scanner_id: request.device_id.clone(),
                location: request.location.clone(),
                timestamp: request.scanned_at,
            },
            &context,
        )
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(ScanResponse {
        scan_id: transfer_result.transfer.id,
        property: PropertyDetails {
            id: property.id(),
            name: property.name().to_string(),
            description: property.description().to_string(),
            nsn: property.nsn().cloned(),
            serial_number: property.serial_number().cloned(),
            is_sensitive: property.is_sensitive(),
            current_custodian: property.custodian().cloned(),
            last_verified: property.verifications().last().map(|v| v.timestamp),
            requires_officer_approval: property.is_sensitive(),
        },
        status: transfer_result.status,
        requires_approval: transfer_result.requires_approval,
        offline_sync_id: request.offline_id.clone(),
    }))
}

#[derive(Debug, Serialize)]
pub struct PropertySummary {
    pub id: Uuid,
    pub name: String,
    pub is_sensitive: bool,
    pub status: String,
    pub qr_code: Option<String>,
}

/// Gets property summary for mobile view
pub async fn get_property_summary(
    property_service: web::Data<Arc<dyn PropertyService>>,
    qr_service: web::Data<Arc<dyn QRCodeService>>,
    id: web::Path<Uuid>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    let user_uuid = Uuid::parse_str(&user_id.into_inner())
        .map_err(actix_web::error::ErrorBadRequest)?;
    let context = SecurityContext::new(user_uuid);

    // Get property
    let property = property_service
        .get_property(id.into_inner(), &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?
        .ok_or_else(|| actix_web::error::ErrorNotFound("Property not found"))?;

    // Generate QR code if needed
    let qr_code = if property.is_sensitive() {
        let qr_data = qr_service
            .generate_qr(&QRData {
                id: Uuid::new_v4(),
                property_id: property.id(),
                metadata: serde_json::json!({
                    "qr_code": format!("QR_{}", Uuid::new_v4())
                }),
                timestamp: Utc::now(),
            }, QRFormat::PNG, &context)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;
            
        Some(encode(&qr_data.data))  // Encode the Vec<u8> to base64
    } else {
        None
    };

    Ok(HttpResponse::Ok().json(PropertySummary {
        id: property.id(),
        name: property.name().to_string(),
        is_sensitive: property.is_sensitive(),
        status: format!("{:?}", property.status()),
        qr_code,
    }))
}

#[derive(Debug, Serialize)]
pub struct SyncStatus {
    pub offline_id: String,
    pub status: String,
    pub error: Option<String>,
    pub completed_at: Option<DateTime<Utc>>,
}

/// Gets sync status for offline operations
pub async fn get_sync_status(
    offline_id: web::Path<String>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    // In a real implementation, this would check a sync status store
    Ok(HttpResponse::Ok().json(SyncStatus {
        offline_id: offline_id.into_inner(),
        status: "completed".to_string(),
        error: None,
        completed_at: Some(Utc::now()),
    }))
}

/// Configures mobile routes
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/mobile")
            .route("/scan", web::post().to(process_scan))
            .route("/property/{id}", web::get().to(get_property_summary))
            .route("/sync/{id}", web::get().to(get_sync_status)),
    );
}
