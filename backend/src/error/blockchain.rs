use thiserror::Error;
use sawtooth_sdk::processor::handler::ApplyError;

#[derive(Error, Debug)]
pub enum BlockchainError {
    #[error("Network error: {0}")]
    NetworkError(String),
    #[error("Validation error: {0}")]
    ValidationError(String),
    #[error("State error: {0}")]
    StateError(String),
    #[error("Transaction error: {0}")]
    TransactionError(String),
    #[error("Service error: {0}")]
    ServiceError(String),
    #[error("Serialization error: {0}")]
    SerializationError(String),
    #[error("Unknown error: {0}")]
    Unknown(String),
}

impl From<reqwest::Error> for BlockchainError {
    fn from(err: reqwest::Error) -> Self {
        BlockchainError::NetworkError(err.to_string())
    }
}

impl From<serde_json::Error> for BlockchainError {
    fn from(err: serde_json::Error) -> Self {
        BlockchainError::SerializationError(err.to_string())
    }
}

impl From<ApplyError> for BlockchainError {
    fn from(err: ApplyError) -> Self {
        BlockchainError::StateError(err.to_string())
    }
}

impl From<String> for BlockchainError {
    fn from(err: String) -> Self {
        BlockchainError::ValidationError(err)
    }
}

impl From<sawtooth_sdk::signing::Error> for BlockchainError {
    fn from(err: sawtooth_sdk::signing::Error) -> Self {
        BlockchainError::TransactionError(err.to_string())
    }
} 