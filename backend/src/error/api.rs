use actix_web::{HttpResponse, ResponseError};
use thiserror::Error;
use serde_json::json;

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("Authentication error: {0}")]
    AuthenticationError(String),

    #[error("Authorization error: {0}")]
    AuthorizationError(String),

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Internal server error: {0}")]
    InternalError(String),

    #[error("Validation error: {0}")]
    ValidationError(String),
}

impl ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        match self {
            ApiError::AuthenticationError(msg) => HttpResponse::Unauthorized().json(json!({
                "error": "Authentication error",
                "message": msg
            })),
            ApiError::AuthorizationError(msg) => HttpResponse::Forbidden().json(json!({
                "error": "Authorization error",
                "message": msg
            })),
            ApiError::BadRequest(msg) => HttpResponse::BadRequest().json(json!({
                "error": "Bad request",
                "message": msg
            })),
            ApiError::NotFound(msg) => HttpResponse::NotFound().json(json!({
                "error": "Not found",
                "message": msg
            })),
            ApiError::InternalError(msg) => HttpResponse::InternalServerError().json(json!({
                "error": "Internal server error",
                "message": msg
            })),
            ApiError::ValidationError(msg) => HttpResponse::BadRequest().json(json!({
                "error": "Validation error",
                "message": msg
            })),
        }
    }
} 