pub mod property;
pub mod transfer;
pub mod mobile;
pub mod user;

// Re-export common types
pub use property::*;
pub use transfer::*;
pub use mobile::*;
pub use user::*;

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

pub type HandlerResult = Result<HttpResponse, Error>;

pub fn validate_uuid(id: &str) -> Result<Uuid, Error> {
    Uuid::parse_str(id).map_err(|e| actix_web::error::ErrorBadRequest(e.to_string()))
}

pub fn check_permission(
    security_context: &SecurityContext,
    resource_type: ResourceType,
    action: Action,
) -> Result<(), Error> {
    if !security_context.has_permission(resource_type, action) {
        return Err(actix_web::error::ErrorForbidden("Insufficient permissions"));
    }
    Ok(())
}

pub fn ok_response<T: Serialize>(data: T) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::<T>::success(data))
}

pub fn created_response<T: Serialize>(data: T) -> HttpResponse {
    HttpResponse::Created().json(ApiResponse::<T>::success(data))
}

pub fn no_content_response() -> HttpResponse {
    HttpResponse::NoContent().finish()
}

pub fn not_found_response(message: &str) -> HttpResponse {
    HttpResponse::NotFound().json(ApiResponse::<()>::error(message.to_string()))
}

pub fn forbidden_response(message: &str) -> HttpResponse {
    HttpResponse::Forbidden().json(ApiResponse::<()>::error(message.to_string()))
}
