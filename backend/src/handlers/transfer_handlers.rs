// backend/src/handlers/transfer_handlers.rs

use actix_web::{web, HttpResponse, Error};
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use chrono::Utc;

use crate::types::{
    app::AppState,
    security::SecurityContext,
    audit::{AuditEvent, AuditEventType, AuditStatus, AuditContext, AuditSeverity},
    sync::{SyncStatus, SyncType, SyncPriority},
    permissions::{ResourceType, Action},
    error::CoreError,
};

#[derive(Debug, Deserialize)]
pub struct InitiateTransferRequest {
    pub asset_id: Uuid,
    pub to_user_id: Uuid,
    pub classification_level: String,
    pub verification_method: String,
    pub transfer_reason: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct TransferResponse {
    pub transfer_id: Uuid,
    pub status: SyncStatus,
    pub timestamp: chrono::DateTime<Utc>,
    pub message: String,
}

pub async fn initiate_transfer(
    state: web::Data<AppState>,
    request: web::Json<InitiateTransferRequest>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Validate permissions
    if !security_context.has_permission(&ResourceType::Asset, &Action::Transfer) {
        return Ok(HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Insufficient permissions",
            "message": "User does not have permission to initiate transfers"
        })));
    }

    // Create audit event
    let event = AuditEvent {
        id: Uuid::new_v4(),
        timestamp: Utc::now(),
        event_type: AuditEventType::AssetTransferred,
        status: AuditStatus::Success,
        details: serde_json::json!({
            "asset_id": request.asset_id,
            "to_user_id": request.to_user_id,
            "classification": request.classification_level,
        }),
        context: AuditContext {
            user_id: Some(security_context.user_id.to_string()),
            resource_id: Some(request.asset_id.to_string()),
            action: "INITIATE_TRANSFER".to_string(),
            severity: AuditSeverity::High,
            metadata: None,
        },
    };

    // Log the event
    state.audit_logger.log_event(event, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    // Get asset
    let asset = state.db
        .get_asset(request.asset_id, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?
        .ok_or_else(|| actix_web::error::ErrorNotFound("Asset not found"))?;

    // Verify transfer
    let verification_result = state.asset_verification
        .verify_transfer(&request.asset_id.to_string())
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    if !verification_result {
        return Ok(HttpResponse::BadRequest().json(TransferResponse {
            transfer_id: Uuid::new_v4(),
            status: SyncStatus::Failed,
            timestamp: Utc::now(),
            message: "Transfer verification failed".to_string(),
        }));
    }

    // Start sync
    state.sync_manager
        .start_sync(SyncType::Full)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    Ok(HttpResponse::Ok().json(TransferResponse {
        transfer_id: Uuid::new_v4(),
        status: SyncStatus::InProgress,
        timestamp: Utc::now(),
        message: "Transfer initiated successfully".to_string(),
    }))
}

pub async fn confirm_transfer(
    state: web::Data<AppState>,
    transfer_id: web::Path<Uuid>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Validate permissions
    if !security_context.has_permission(&ResourceType::Asset, &Action::Transfer) {
        return Ok(HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Insufficient permissions",
            "message": "User does not have permission to confirm transfers"
        })));
    }

    // Create audit event
    let event = AuditEvent {
        id: Uuid::new_v4(),
        timestamp: Utc::now(),
        event_type: AuditEventType::AssetTransferred,
        status: AuditStatus::Success,
        details: serde_json::json!({
            "transfer_id": *transfer_id,
            "confirmation_time": Utc::now(),
        }),
        context: AuditContext {
            user_id: Some(security_context.user_id.to_string()),
            resource_id: Some(transfer_id.to_string()),
            action: "CONFIRM_TRANSFER".to_string(),
            severity: AuditSeverity::High,
            metadata: None,
        },
    };

    // Log the event
    state.audit_logger.log_event(event, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    // Get sync status
    let sync_status = state.sync_manager
        .get_status()
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    let sync_status_clone = sync_status.clone();

    Ok(HttpResponse::Ok().json(TransferResponse {
        transfer_id: *transfer_id,
        status: sync_status_clone,
        timestamp: Utc::now(),
        message: format!("Transfer confirmed successfully. Status: {:?}", sync_status),
    }))
}

pub async fn get_transfer_status(
    state: web::Data<AppState>,
    transfer_id: web::Path<Uuid>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, actix_web::Error> {
    // Get sync status
    let sync_status = state.sync_manager
        .get_status()
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    let sync_status_clone = sync_status.clone();

    Ok(HttpResponse::Ok().json(TransferResponse {
        transfer_id: *transfer_id,
        status: sync_status_clone,
        timestamp: Utc::now(),
        message: format!("Transfer status: {:?}", sync_status),
    }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::test;

    #[actix_rt::test]
    async fn test_initiate_transfer() {
        // TODO: Add tests
    }

    #[actix_rt::test]
    async fn test_confirm_transfer() {
        // TODO: Add tests
    }
}