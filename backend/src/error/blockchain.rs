use thiserror::Error;

#[derive(Error, Debug)]
pub enum BlockchainError {
    #[error("Invalid block: {0}")]
    InvalidBlock(String),

    #[error("Invalid transaction: {0}")]
    InvalidTransaction(String),

    #[error("Consensus error: {0}")]
    ConsensusError(String),

    #[error("Chain error: {0}")]
    ChainError(String),

    #[error("Network error: {0}")]
    NetworkError(String),

    #[error("Database error: {0}")]
    DatabaseError(String),

    #[error("Transaction timeout: {0}")]
    TransactionTimeout(String),
} 