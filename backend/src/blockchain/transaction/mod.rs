// backend/src/blockchain/transaction/mod.rs

use crate::{
    error::{CoreError, BlockchainError},
    types::security::SecurityContext,
};

pub mod processing;
pub mod verification;

// Re-export public types
pub use processing::TransactionProcessor;

// Define enums here instead of re-exporting private ones
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TransactionType {
    Asset,
    Transfer,
    Validation,
    System,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TransactionStatus {
    Pending,
    Validated,
    Confirmed,
    Failed,
}

pub use verification::{
    TransactionVerifier,
    PropertyVerifier,
    TransactionError,
};

#[derive(Debug, Clone)]
pub struct Transaction {
    pub id: uuid::Uuid,
    pub transaction_type: TransactionType,
    pub data: serde_json::Value,
    pub status: TransactionStatus,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}
