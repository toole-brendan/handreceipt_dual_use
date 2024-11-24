use actix_web::{web, HttpResponse, Error};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use std::sync::Arc;
use chrono::{DateTime, Utc};

use crate::{
    application::{
        property::queries::PropertyQueryService,
        transfer::commands::TransferCommandService,
    },
    domain::models::{
        qr::{QRCodeService, QRFormat},
        transfer::TransferStatus,
    },
    types::security::SecurityContext,
};

#[derive(Debug, Deserialize)]
pub struct ScanRequest {
    pub qr_data: String,
    pub device_id: String,
    pub location: Option<String>,
    pub offline_id: Option<String>,
    pub scanned_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
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

#[derive(Debug, Serialize)]
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
    property_service: web::Data<Arc<PropertyQueryService>>,
    qr_service: web::Data<Arc<dyn QRCodeService>>,
    user_id: web::ReqData<String>,
    request: web::Json<ScanRequest>,
) -> Result<HttpResponse, Error> {
    let context = SecurityContext::new(user_id.into_inner());

    // Verify QR code
    let verify_request = crate::domain::models::qr::VerifyQRRequest {
        qr_data: request.qr_data.clone(),
        scanned_at: request.scanned_at,
        scanner_id: request.device_id.clone(),
        location: request.location.clone().map(|l| l.parse().unwrap()),
    };

    let qr_data = qr_service
        .validate_qr(verify_request, &context)
        .await
        .map_err(actix_web::error::ErrorBadRequest)?;

    // Get property details
    let property = property_service
        .get_property_details(qr_data.property_id, &context)
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
            id: property.id,
            name: property.name,
            description: property.description,
            nsn: property.nsn,
            serial_number: property.serial_number,
            is_sensitive: property.is_sensitive,
            current_custodian: property.custodian,
            last_verified: property.last_verified,
            requires_officer_approval: property.is_sensitive,
        },
        status: transfer_result.status,
        requires_approval: transfer_result.requires_approval,
        offline_sync_id: request.offline_id,
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
    property_service: web::Data<Arc<PropertyQueryService>>,
    qr_service: web::Data<Arc<dyn QRCodeService>>,
    id: web::Path<Uuid>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    let context = SecurityContext::new(user_id.into_inner());

    // Get property
    let property = property_service
        .get_property_details(id.into_inner(), &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?
        .ok_or_else(|| actix_web::error::ErrorNotFound("Property not found"))?;

    // Generate QR code if needed
    let qr_code = if property.requires_qr {
        Some(
            qr_service
                .generate_qr(property.id, QRFormat::PNG, &context)
                .await
                .map_err(actix_web::error::ErrorInternalServerError)?
                .qr_code,
        )
    } else {
        None
    };

    Ok(HttpResponse::Ok().json(PropertySummary {
        id: property.id,
        name: property.name,
        is_sensitive: property.is_sensitive,
        status: format!("{:?}", property.status),
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
