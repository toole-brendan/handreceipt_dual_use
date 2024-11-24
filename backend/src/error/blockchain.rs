use thiserror::Error;

#[derive(Debug, Error)]
pub enum BlockchainError {
    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Serialization error: {0}")]
    SerializationError(String),

    #[error("Consensus error: {0}")]
    ConsensusError(String),

    #[error("Authority error: {0}")]
    AuthorityError(String),

    #[error("Transaction error: {0}")]
    TransactionError(String),

    #[error("Verification error: {0}")]
    VerificationError(String),

    #[error("Service error: {0}")]
    ServiceError(String),
}

impl From<String> for BlockchainError {
    fn from(err: String) -> Self {
        BlockchainError::ValidationError(err)
    }
} 