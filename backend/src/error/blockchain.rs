use thiserror::Error;

#[derive(Debug, Error)]
pub enum BlockchainError {
    #[error("Block validation failed: {0}")]
    ValidationFailed(String),

    #[error("Block creation failed: {0}")]
    CreationFailed(String),

    #[error("Transaction failed: {0}")]
    TransactionFailed(String),

    #[error("Consensus error: {0}")]
    ConsensusError(String),

    #[error("Network error: {0}")]
    NetworkError(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

impl From<String> for BlockchainError {
    fn from(s: String) -> Self {
        BlockchainError::Internal(s)
    }
}

impl From<&str> for BlockchainError {
    fn from(s: &str) -> Self {
        BlockchainError::Internal(s.to_string())
    }
} 