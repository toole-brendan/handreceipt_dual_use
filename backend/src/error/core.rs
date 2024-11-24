use std::fmt;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CoreError {
    #[error("System error: {0}")]
    System(String),

    #[error("Database error: {0}")]
    Database(String),

    #[error("Repository error: {0}")]
    Repository(String),

    #[error("Blockchain error: {0}")]
    Blockchain(#[from] crate::error::blockchain::BlockchainError),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Security error: {0}")]
    SecurityError(String),

    #[error("Authentication error: {0}")]
    Authentication(String),

    #[error("Authorization error: {0}")]
    Authorization(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Configuration error: {0}")]
    Configuration(String),

    #[error("Audit error: {0}")]
    Audit(#[from] crate::error::audit::AuditError),

    #[error("Internal error: {0}")]
    InternalError(String),

    #[error("Transfer error: {0}")]
    Transfer(String),

    #[error("QR code error: {0}")]
    QRCode(String),

    #[error("Image processing error: {0}")]
    Image(String),
}

impl From<String> for CoreError {
    fn from(err: String) -> Self {
        CoreError::System(err)
    }
}

impl From<&str> for CoreError {
    fn from(err: &str) -> Self {
        CoreError::System(err.to_string())
    }
}

impl From<std::io::Error> for CoreError {
    fn from(err: std::io::Error) -> Self {
        CoreError::System(err.to_string())
    }
}

impl From<serde_json::Error> for CoreError {
    fn from(err: serde_json::Error) -> Self {
        CoreError::System(err.to_string())
    }
}

impl From<sqlx::Error> for CoreError {
    fn from(err: sqlx::Error) -> Self {
        CoreError::Database(err.to_string())
    }
}

impl From<crate::error::security::SecurityError> for CoreError {
    fn from(err: crate::error::security::SecurityError) -> Self {
        CoreError::SecurityError(err.to_string())
    }
}

impl From<image::ImageError> for CoreError {
    fn from(err: image::ImageError) -> Self {
        CoreError::Image(err.to_string())
    }
}

impl From<qrcode::types::QrError> for CoreError {
    fn from(err: qrcode::types::QrError) -> Self {
        CoreError::QRCode(err.to_string())
    }
}
