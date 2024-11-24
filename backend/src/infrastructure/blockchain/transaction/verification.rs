use crate::domain::property::entity::Property;
use async_trait::async_trait;
use crate::error::BlockchainError;

#[async_trait]
pub trait TransactionVerification {
    async fn verify_transaction(&self, transaction_id: String) -> Result<bool, BlockchainError>;
    async fn verify_block(&self, block_hash: String) -> Result<bool, BlockchainError>;
    async fn verify_chain(&self) -> Result<bool, BlockchainError>;
}
