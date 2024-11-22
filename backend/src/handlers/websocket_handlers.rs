// src/handlers/websocket_handlers.rs

use actix_web::{web, Error, HttpRequest, HttpResponse};
use actix_web_actors::ws;
use crate::actors::websocket_actor::WebSocketActor;
use crate::core::{SecurityContext, ResourceType, Action};
use crate::services::blockchain::PropertyToken;
use uuid::Uuid;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct WebSocketMessage {
    message_type: WebSocketMessageType,
    data: serde_json::Value,
    token_id: Option<Uuid>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WebSocketMessageType {
    TokenMinted,
    TransferInitiated,
    TransferCompleted,
    VerificationRequired,
    PropertyUpdated,
    Error,
}

pub async fn websocket_handler(
    req: HttpRequest,
    stream: web::Payload,
    state: web::Data<crate::core::AppState>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Validate security context and permissions
    if !security_context.has_permission(&ResourceType::Asset, &Action::Read) {
        return Ok(HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Insufficient permissions for websocket connection"
        })));
    }

    // Create websocket actor with security context and state
    let actor = WebSocketActor::new(
        security_context.into_inner(),
        state.blockchain.clone(),
    );

    // Start websocket connection
    ws::start(actor, &req, stream)
}

pub async fn broadcast_transfer(
    state: web::Data<crate::core::AppState>,
    token: web::Json<PropertyToken>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Validate security context and permissions
    if !security_context.has_permission(&ResourceType::Asset, &Action::Update) {
        return Ok(HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Insufficient permissions for broadcasting transfer"
        })));
    }

    // Create transfer message
    let message = WebSocketMessage {
        message_type: WebSocketMessageType::TransferInitiated,
        data: serde_json::to_value(&token.0)?,
        token_id: Some(token.0.token_id),
    };

    // Broadcast to all connected clients
    state.blockchain
        .broadcast_message(
            &serde_json::to_string(&message)?,
            &security_context,
        )
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Transfer broadcast successful",
        "token_id": token.0.token_id
    })))
}

pub async fn notify_verification(
    state: web::Data<crate::core::AppState>,
    token_id: web::Path<Uuid>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Validate security context and permissions
    if !security_context.has_permission(&ResourceType::Asset, &Action::Verify) {
        return Ok(HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Insufficient permissions for verification notification"
        })));
    }

    // Extract the UUID value from Path
    let token_uuid = token_id.into_inner();

    // Create verification message
    let message = WebSocketMessage {
        message_type: WebSocketMessageType::VerificationRequired,
        data: serde_json::json!({
            "token_id": token_uuid.to_string(),
            "timestamp": chrono::Utc::now(),
            "requester": security_context.user_id
        }),
        token_id: Some(token_uuid),
    };

    // Broadcast to relevant clients
    state.blockchain
        .broadcast_message(
            &serde_json::to_string(&message)?,
            &security_context,
        )
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Verification notification sent",
        "token_id": token_uuid
    })))
} 