use std::fmt;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CoreError {
    #[error("Database error: {0}")]
    Database(String),

    #[error("Security violation: {0}")]
    SecurityViolation(String),

    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Authentication error: {0}")]
    AuthenticationError(String),

    #[error("Authorization error: {0}")]
    AuthorizationError(String),

    #[error("Network error: {0}")]
    NetworkError(String),

    #[error("Blockchain error: {0}")]
    BlockchainError(String),

    #[error("Sync error: {0}")]
    SyncError(String),

    #[error("Encryption error: {0}")]
    EncryptionError(String),

    #[error("Signature error: {0}")]
    SignatureError(String),

    // ... rest of the variants with their error attributes
} 