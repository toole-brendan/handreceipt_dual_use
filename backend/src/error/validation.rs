use thiserror::Error;

#[derive(Error, Debug)]
pub enum ValidationError {
    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Missing field: {0}")]
    MissingField(String),

    #[error("Invalid format: {0}")]
    InvalidFormat(String),

    #[error("Invalid hash: {0}")]
    InvalidHash(String),

    #[error("Invalid signature: {0}")]
    InvalidSignature(String),

    #[error("Invalid timestamp: {0}")]
    InvalidTimestamp(String),
} 