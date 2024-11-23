use thiserror::Error;
use crate::error::CoreError;

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("Bad Request: {0}")]
    BadRequest(String),
    
    #[error("Unauthorized: {0}")]
    Unauthorized(String),
    
    #[error("Forbidden: {0}")]
    Forbidden(String),
    
    #[error("Not Found: {0}")]
    NotFound(String),
    
    #[error("Internal Server Error: {0}")]
    InternalServer(String),
    
    #[error("Service Unavailable: {0}")]
    ServiceUnavailable(String),
}

impl From<CoreError> for ApiError {
    fn from(err: CoreError) -> Self {
        match err {
            CoreError::Validation(_) => ApiError::BadRequest(err.to_string()),
            CoreError::Authentication(_) => ApiError::Unauthorized(err.to_string()),
            CoreError::Authorization(_) => ApiError::Forbidden(err.to_string()),
            CoreError::NotFound(_) => ApiError::NotFound(err.to_string()),
            _ => ApiError::InternalServer(err.to_string()),
        }
    }
} 