use async_trait::async_trait;
use thiserror::Error;
use uuid::Uuid;

use super::entity::Transfer;

/// Transfer errors
#[derive(Debug, Error)]
pub enum TransferError {
    #[error("Repository error: {0}")]
    Repository(String),

    #[error("Invalid QR code: {0}")]
    InvalidQRCode(String),

    #[error("Authorization error: {0}")]
    Authorization(String),

    #[error("Business rule violation: {0}")]
    BusinessRule(String),

    #[error("Blockchain error: {0}")]
    Blockchain(String),
}

/// Repository interface for transfers
#[async_trait]
pub trait TransferRepository: Send + Sync {
    /// Creates a new transfer
    async fn create(&self, transfer: Transfer) -> Result<Transfer, TransferError>;

    /// Gets a transfer by ID
    async fn get_by_id(&self, id: Uuid) -> Result<Transfer, TransferError>;

    /// Updates a transfer
    async fn update(&self, transfer: Transfer) -> Result<Transfer, TransferError>;

    /// Gets transfers for a custodian
    async fn get_by_custodian(
        &self,
        custodian: &str,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<Transfer>, TransferError>;

    /// Gets pending approvals for a commander
    async fn get_pending_approvals(
        &self,
        commander_id: &str,
    ) -> Result<Vec<Transfer>, TransferError>;

    /// Gets transfers for a property
    async fn get_by_property(
        &self,
        property_id: Uuid,
    ) -> Result<Vec<Transfer>, TransferError>;

    /// Begins a new transaction
    async fn begin_transaction(&self) -> Result<Box<dyn TransferTransaction>, TransferError>;
}

/// Transaction interface for transfers
#[async_trait]
pub trait TransferTransaction: Send + Sync {
    /// Commits the transaction
    async fn commit(self: Box<Self>) -> Result<(), TransferError>;

    /// Rolls back the transaction
    async fn rollback(self: Box<Self>) -> Result<(), TransferError>;

    /// Creates a transfer within the transaction
    async fn create(&mut self, transfer: Transfer) -> Result<Transfer, TransferError>;

    /// Updates a transfer within the transaction
    async fn update(&mut self, transfer: Transfer) -> Result<Transfer, TransferError>;
}
