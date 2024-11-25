use actix_web::{web, HttpResponse, Error};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use std::sync::Arc;
use chrono::{DateTime, Utc};

use crate::{
    application::transfer::{
        commands::{TransferCommandService, ScanQRTransferCommand, ApproveTransferCommand},
        validation::TransferValidationService,
    },
    domain::models::transfer::{PropertyTransferRecord, TransferStatus},
    infrastructure::blockchain::verification::TransferVerification,
    types::security::SecurityContext,
};

#[derive(Debug, Deserialize)]
pub struct ScanQRRequest {
    pub qr_data: String,
    pub scanner_id: String,
    pub location: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApproveTransferRequest {
    pub notes: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct TransferResponse {
    pub id: Uuid,
    pub property_id: Uuid,
    pub from_custodian: Option<String>,
    pub to_custodian: String,
    pub status: TransferStatus,
    pub timestamp: DateTime<Utc>,
    pub blockchain_hash: Option<String>,
    pub requires_approval: bool,
}

impl From<PropertyTransferRecord> for TransferResponse {
    fn from(transfer: PropertyTransferRecord) -> Self {
        let status = transfer.status.clone();
        Self {
            id: transfer.id,
            property_id: transfer.property_id,
            from_custodian: Some(transfer.from_node.to_string()),
            to_custodian: transfer.to_node.to_string(),
            status: transfer.status,
            timestamp: transfer.timestamp,
            blockchain_hash: None,
            requires_approval: status == TransferStatus::Pending,
        }
    }
}

/// Initiates a transfer via QR code scan
pub async fn scan_qr_transfer(
    command_service: web::Data<Arc<TransferCommandService>>,
    validation_service: web::Data<Arc<TransferValidationService>>,
    user_id: web::ReqData<String>,
    request: web::Json<ScanQRRequest>,
) -> Result<HttpResponse, Error> {
    let user_uuid = Uuid::parse_str(&user_id.into_inner())
        .map_err(actix_web::error::ErrorBadRequest)?;
    let context = SecurityContext::new(user_uuid);

    // Create scan command
    let command = ScanQRTransferCommand {
        qr_data: request.qr_data.clone(),
        scanner_id: request.scanner_id.clone(),
        location: request.location.clone(),
        timestamp: Utc::now(),
    };

    // Initiate transfer
    let result = command_service
        .initiate_transfer_with_qr(command, &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(TransferResponse {
        id: result.transfer.id,
        property_id: result.transfer.property_id,
        from_custodian: Some(result.transfer.from_node.to_string()),
        to_custodian: result.transfer.to_node.to_string(),
        status: result.status,
        timestamp: result.transfer.timestamp,
        blockchain_hash: None,
        requires_approval: result.requires_approval,
    }))
}

/// Approves a pending transfer (Officers only)
pub async fn approve_transfer(
    command_service: web::Data<Arc<TransferCommandService>>,
    blockchain_service: web::Data<Arc<dyn TransferVerification>>,
    id: web::Path<Uuid>,
    user_id: web::ReqData<String>,
    request: web::Json<ApproveTransferRequest>,
) -> Result<HttpResponse, Error> {
    let user_uuid = Uuid::parse_str(&user_id.into_inner())
        .map_err(actix_web::error::ErrorBadRequest)?;
    let context = SecurityContext::new(user_uuid);

    // Approve transfer
    let command = ApproveTransferCommand {
        transfer_id: id.into_inner(),
        notes: request.notes.clone(),
    };

    let result = command_service
        .approve_transfer(command, &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    // Record on blockchain
    let verification = blockchain_service
        .verify_transfer(&result.transfer, &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(TransferResponse {
        id: result.transfer.id,
        property_id: result.transfer.property_id,
        from_custodian: Some(result.transfer.from_node.to_string()),
        to_custodian: result.transfer.to_node.to_string(),
        status: result.status,
        timestamp: result.transfer.timestamp,
        blockchain_hash: verification.blockchain_hash,
        requires_approval: false,
    }))
}

/// Gets pending transfers for approval
pub async fn get_pending_transfers(
    command_service: web::Data<Arc<TransferCommandService>>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    let user_uuid = Uuid::parse_str(&user_id.into_inner())
        .map_err(actix_web::error::ErrorBadRequest)?;
    let context = SecurityContext::new(user_uuid);

    let transfers = command_service
        .get_pending_transfers(&context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let responses: Vec<TransferResponse> = transfers
        .into_iter()
        .map(|t| t.into())
        .collect();

    Ok(HttpResponse::Ok().json(responses))
}

/// Gets transfer history for a property
pub async fn get_property_transfers(
    command_service: web::Data<Arc<TransferCommandService>>,
    property_id: web::Path<Uuid>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    let user_uuid = Uuid::parse_str(&user_id.into_inner())
        .map_err(actix_web::error::ErrorBadRequest)?;
    let context = SecurityContext::new(user_uuid);

    let transfers = command_service
        .get_property_transfers(property_id.into_inner(), &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let responses: Vec<TransferResponse> = transfers
        .into_iter()
        .map(|t| t.into())
        .collect();

    Ok(HttpResponse::Ok().json(responses))
}

/// Gets transfer status from blockchain
pub async fn get_transfer_status(
    blockchain_service: web::Data<Arc<dyn TransferVerification>>,
    id: web::Path<Uuid>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    let user_uuid = Uuid::parse_str(&user_id.into_inner())
        .map_err(actix_web::error::ErrorBadRequest)?;
    let context = SecurityContext::new(user_uuid);

    let status = blockchain_service
        .get_transfer_status(id.into_inner(), &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(status))
}

/// Configures transfer routes
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/transfer")
            .route("/scan", web::post().to(scan_qr_transfer))
            .route("/pending", web::get().to(get_pending_transfers))
            .route("/{id}/approve", web::post().to(approve_transfer))
            .route("/{id}/status", web::get().to(get_transfer_status))
            .route("/property/{id}", web::get().to(get_property_transfers)),
    );
}
