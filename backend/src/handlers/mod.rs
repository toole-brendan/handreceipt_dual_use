// Re-export handlers from api/routes
pub use crate::api::routes::{
    asset::*,
    health::*,
    qr::*,
    transfer::*,
    websocket::*,
    user::*,
};

use serde::{Deserialize, Serialize};
use actix_web::{Error, HttpResponse};
use uuid::Uuid;

use crate::{
    types::{
        security::SecurityContext,
        permissions::{ResourceType, Action},
    },
    api::types::ApiResponse,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct QRFormat {
    pub format: Option<String>, // "svg" or "png", defaults to "png"
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

pub fn not_found_response(message: &str) -> HttpResponse {
    HttpResponse::NotFound().json(serde_json::json!({
        "error": message
    }))
}

pub fn forbidden_response(message: &str) -> HttpResponse {
    HttpResponse::Forbidden().json(serde_json::json!({
        "error": message
    }))
}
