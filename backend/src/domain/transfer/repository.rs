use async_trait::async_trait;
use crate::error::RepositoryError;
use super::entity::Transfer;

#[async_trait]
pub trait TransferRepository: Send + Sync {
    async fn create_transfer(&self, transfer: Transfer) -> Result<Transfer, RepositoryError>;
    async fn update_transfer(&self, transfer: &Transfer) -> Result<(), RepositoryError>;
    async fn delete_transfer(&self, id: i32) -> Result<(), RepositoryError>;
    async fn get_transfer(&self, id: i32) -> Result<Option<Transfer>, RepositoryError>;
    async fn list_transfers(&self) -> Result<Vec<Transfer>, RepositoryError>;
    async fn list_by_property(&self, property_id: i32) -> Result<Vec<Transfer>, RepositoryError>;
} 