// src/handlers/websocket_handlers.rs

use actix_web::{web, HttpRequest, HttpResponse, Error};
use actix_web_actors::ws;
use uuid::Uuid;
use serde::{Serialize, Deserialize};
use chrono::Utc;

use crate::types::{
    app::AppState,
    security::SecurityContext,
    audit::{AuditEvent, AuditEventType, AuditStatus, AuditContext, AuditSeverity},
    blockchain::Transaction,
    sync::{BroadcastMessage, SyncPriority},
    permissions::{ResourceType, Action},
};

use crate::actors::WebSocketActor;

#[derive(Debug, Serialize, Deserialize)]
pub struct WebSocketMessage {
    message_type: WebSocketMessageType,
    data: serde_json::Value,
    transaction_id: Option<Uuid>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WebSocketMessageType {
    TransactionCreated,
    TransferInitiated,
    TransferCompleted,
    VerificationRequired,
    PropertyUpdated,
    Error,
}

pub async fn websocket_handler(
    req: HttpRequest,
    stream: web::Payload,
    state: web::Data<AppState>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Validate permissions
    if !security_context.has_permission(&ResourceType::WebSocket, &Action::Connect) {
        return Ok(HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Insufficient permissions",
            "message": "User does not have permission to establish WebSocket connections"
        })));
    }

    // Create audit event
    let event = AuditEvent {
        id: Uuid::new_v4(),
        timestamp: Utc::now(),
        event_type: AuditEventType::SystemEvent,
        status: AuditStatus::Success,
        details: serde_json::json!({
            "connection_type": "websocket",
            "remote_addr": req.connection_info().remote_addr(),
        }),
        context: AuditContext {
            user_id: Some(security_context.user_id.to_string()),
            resource_id: None,
            action: "WEBSOCKET_CONNECT".to_string(),
            severity: AuditSeverity::Low,
            metadata: None,
        },
    };

    // Log the event
    state.audit_logger.log_event(event, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    // Create WebSocket actor
    let actor = WebSocketActor::new(
        security_context.into_inner(),
        state.blockchain.clone(),
    );

    // Start WebSocket connection
    ws::start(actor, &req, stream)
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))
}

pub async fn notify_verification(
    state: web::Data<AppState>,
    token_id: web::Path<Uuid>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Validate permissions
    if !security_context.has_permission(&ResourceType::Asset, &Action::Verify) {
        return Ok(HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Insufficient permissions",
            "message": "User does not have permission to request verifications"
        })));
    }

    // Create audit event
    let event = AuditEvent {
        id: Uuid::new_v4(),
        timestamp: Utc::now(),
        event_type: AuditEventType::AssetCreated,
        status: AuditStatus::Success,
        details: serde_json::json!({
            "token_id": *token_id,
            "timestamp": Utc::now(),
            "requester": security_context.user_id,
        }),
        context: AuditContext {
            user_id: Some(security_context.user_id.to_string()),
            resource_id: Some(token_id.to_string()),
            action: "NOTIFY_VERIFICATION".to_string(),
            severity: AuditSeverity::Medium,
            metadata: None,
        },
    };

    // Log the event
    state.audit_logger.log_event(event, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    // Create broadcast message
    let broadcast_msg = BroadcastMessage::new(
        serde_json::to_string(&WebSocketMessage {
            message_type: WebSocketMessageType::VerificationRequired,
            data: serde_json::json!({
                "token_id": *token_id,
                "timestamp": Utc::now(),
                "requester": security_context.user_id,
            }),
            transaction_id: Some(*token_id),
        })?,
        SyncPriority::High,
    );

    // Broadcast to relevant clients
    state.blockchain
        .broadcast_message(&broadcast_msg)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Verification notification sent",
        "token_id": *token_id
    })))
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::test;

    #[actix_rt::test]
    async fn test_websocket_handler() {
        // TODO: Add WebSocket handler tests
    }

    #[actix_rt::test]
    async fn test_notify_verification() {
        // TODO: Add notification handler tests
    }
} 