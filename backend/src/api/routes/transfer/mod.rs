use actix_web::{web, HttpResponse, Error};
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use chrono::Utc;
use std::collections::HashMap;

use crate::{
    types::{
        app::{AppState, DatabaseService, SecurityService, AssetVerification, AuditLogger, SyncManager, MeshService, P2PService},
        security::{SecurityContext, SecurityClassification},
        audit::{AuditEvent, AuditEventType, AuditContext, AuditSeverity},
        sync::{SyncStatus, SyncType},
        permissions::{ResourceType, Action},
    },
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

pub async fn initiate_transfer<DB, SEC, AV, AL, SM, MS, PS>(
    state: web::Data<AppState<DB, SEC, AV, AL, SM, MS, PS>>,
    request: web::Json<InitiateTransferRequest>,
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
    // Validate permissions
    if !security_context.has_permission(&ResourceType::Asset, &Action::Transfer) {
        return Ok(HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Insufficient permissions",
            "message": "User does not have permission to initiate transfers"
        })));
    }

    // Create audit context
    let context = AuditContext::new(
        "INITIATE_TRANSFER".to_string(),
        AuditSeverity::High,
        SecurityClassification::Confidential,
        security_context.user_id,
    );

    // Create audit event
    let event = AuditEvent::new(
        AuditEventType::AssetTransferred,
        serde_json::json!({
            "asset_id": request.asset_id,
            "to_user_id": request.to_user_id,
            "classification": request.classification_level,
        }),
        context,
    );

    // Log the event
    state.audit.log_event(event, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    // Start sync
    state.sync_manager
        .start_sync(SyncType::Transfer, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    // Get sync status
    let sync_status = state.sync_manager
        .get_status()
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    Ok(HttpResponse::Ok().json(TransferResponse {
        transfer_id: Uuid::new_v4(),
        status: sync_status,
        timestamp: Utc::now(),
        message: "Transfer initiated successfully".to_string(),
    }))
}

pub async fn confirm_transfer<DB, SEC, AV, AL, SM, MS, PS>(
    state: web::Data<AppState<DB, SEC, AV, AL, SM, MS, PS>>,
    transfer_id: web::Path<Uuid>,
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
    // Create audit context
    let context = AuditContext::new(
        "CONFIRM_TRANSFER".to_string(),
        AuditSeverity::High,
        SecurityClassification::Confidential,
        security_context.user_id,
    );

    // Create audit event
    let event = AuditEvent::new(
        AuditEventType::AssetTransferred,
        serde_json::json!({
            "transfer_id": *transfer_id,
            "confirmation_time": Utc::now(),
        }),
        context,
    );

    // Log the event
    state.audit.log_event(event, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    // Get sync status
    let sync_status = state.sync_manager
        .get_status()
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    Ok(HttpResponse::Ok().json(TransferResponse {
        transfer_id: *transfer_id,
        status: sync_status,
        timestamp: Utc::now(),
        message: "Transfer confirmed successfully".to_string(),
    }))
}

pub async fn get_transfer_status<DB, SEC, AV, AL, SM, MS, PS>(
    state: web::Data<AppState<DB, SEC, AV, AL, SM, MS, PS>>,
    transfer_id: web::Path<Uuid>,
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
    // Get sync status
    let sync_status = state.sync_manager
        .get_status()
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    Ok(HttpResponse::Ok().json(TransferResponse {
        transfer_id: *transfer_id,
        status: sync_status,
        timestamp: Utc::now(),
        message: format!("Transfer status: {:?}", sync_status),
    }))
}
