use thiserror::Error;

#[derive(Error, Debug)]
pub enum AuditError {
    #[error("Chain verification error: {0}")]
    ChainVerification(String),

    #[error("Logging failed: {0}")]
    LoggingFailed(String),

    #[error("Invalid event: {0}")]
    InvalidEvent(String),

    #[error("Storage error: {0}")]
    Storage(String),
} 