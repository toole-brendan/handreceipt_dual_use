use async_trait::async_trait;
use crate::{
    domain::transfer::entity::Transfer,
    types::security::SecurityContext,
    error::repository::RepositoryError,
    domain::models::location::Location,
};

#[async_trait]
pub trait TransferService: Send + Sync {
    async fn create_transfer(&self, transfer: Transfer, context: &SecurityContext) -> Result<Transfer, RepositoryError>;
    async fn get_transfer(&self, id: i32, context: &SecurityContext) -> Result<Option<Transfer>, RepositoryError>;
    async fn approve_transfer(&self, id: i32, context: &SecurityContext) -> Result<Transfer, RepositoryError>;
    async fn get_pending_transfers(&self, context: &SecurityContext) -> Result<Vec<Transfer>, RepositoryError>;
    async fn get_property_transfers(&self, property_id: i32, context: &SecurityContext) -> Result<Vec<Transfer>, RepositoryError>;
    
    // QR code scanning
    async fn scan_qr_transfer(&self, qr_data: &str, location: &Location, context: &SecurityContext) -> Result<Transfer, RepositoryError>;
}
