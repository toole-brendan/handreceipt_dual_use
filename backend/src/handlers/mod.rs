pub mod asset_handlers;
pub mod health_handlers;
pub mod qr_handlers;
pub mod transfer_handlers;
pub mod websocket_handlers;
pub mod user_handlers;

use serde::{Deserialize, Serialize};
use actix_web::{Error, HttpResponse};
use uuid::Uuid;

use crate::types::{
    security::SecurityContext,
    permissions::{ResourceType, Action},
};

#[derive(Debug, Serialize, Deserialize)]
pub struct QRFormat {
    pub format: Option<String>, // "svg" or "png", defaults to "png"
}

// Re-export handlers
pub use asset_handlers::*;
pub use health_handlers::*;
pub use qr_handlers::*;
pub use transfer_handlers::*;
pub use websocket_handlers::*;
pub use user_handlers::*;

pub type HandlerResult = Result<HttpResponse, Error>;

pub fn map_db_error(e: impl std::error::Error) -> Error {
    actix_web::error::ErrorInternalServerError(e.to_string())
}

pub fn map_validation_error(e: impl std::fmt::Display) -> Error {
    actix_web::error::ErrorBadRequest(e.to_string())
}

pub fn ok_response<T: serde::Serialize>(data: T) -> HandlerResult {
    Ok(HttpResponse::Ok().json(data))
}

pub fn created_response<T: serde::Serialize>(data: T) -> HandlerResult {
    Ok(HttpResponse::Created().json(data))
}

pub fn no_content_response() -> HandlerResult {
    Ok(HttpResponse::NoContent().finish())
}

pub fn not_found_response(message: &str) -> HandlerResult {
    Ok(HttpResponse::NotFound().json(serde_json::json!({
        "error": message
    })))
}

pub fn forbidden_response(message: &str) -> HandlerResult {
    Ok(HttpResponse::Forbidden().json(serde_json::json!({
        "error": message
    })))
}

pub fn validate_uuid(id: &str) -> Result<Uuid, Error> {
    Uuid::parse_str(id).map_err(|e| actix_web::error::ErrorBadRequest(e.to_string()))
}

pub fn check_permission(
    security_context: &SecurityContext,
    resource: &ResourceType,
    action: &Action,
) -> Result<(), Error> {
    if !security_context.has_permission(resource, action) {
        return Err(actix_web::error::ErrorForbidden("Insufficient permissions"));
    }
    Ok(())
}
