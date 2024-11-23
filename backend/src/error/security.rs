use thiserror::Error;

#[derive(Error, Debug)]
pub enum SecurityError {
    #[error("Authentication failed: {0}")]
    AuthenticationFailed(String),

    #[error("Authorization failed: {0}")]
    AuthorizationFailed(String),

    #[error("Encryption failed: {0}")]
    EncryptionFailed(String),

    #[error("Invalid token: {0}")]
    InvalidToken(String),

    #[error("Access denied: {0}")]
    AccessDenied(String),

    #[error("MFA required: {0}")]
    MfaRequired(String),

    #[error("HSM error: {0}")]
    HsmError(String),
} 