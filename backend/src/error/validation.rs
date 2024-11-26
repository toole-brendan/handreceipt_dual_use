use thiserror::Error;

#[derive(Debug, Error)]
pub enum ValidationError {
    #[error("Invalid field: {0}")]
    InvalidField(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Authorization error: {0}")]
    Authorization(String),

    #[error("Repository error: {0}")]
    Repository(String),

    #[error("Invalid state: {0}")]
    InvalidState(String),

    #[error("Insufficient permissions")]
    InsufficientPermissions,
} 