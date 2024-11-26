use async_trait::async_trait;
use crate::{
    domain::property::entity::Property,
    types::security::SecurityContext,
    error::repository::RepositoryError,
};

#[derive(Debug, Clone, serde::Serialize)]
pub struct SyncStatus {
    pub is_synced: bool,
    pub last_sync: Option<chrono::DateTime<chrono::Utc>>,
    pub blockchain_hash: Option<String>,
}

#[async_trait]
pub trait PropertyService: Send + Sync {
    async fn create_property(&self, property: &Property, context: &SecurityContext) -> Result<Property, RepositoryError>;
    async fn get_property(&self, id: i32, context: &SecurityContext) -> Result<Option<Property>, RepositoryError>;
    async fn update_property(&self, property: &Property, context: &SecurityContext) -> Result<Property, RepositoryError>;
    async fn delete_property(&self, id: i32, context: &SecurityContext) -> Result<(), RepositoryError>;
    async fn list_properties(&self, context: &SecurityContext) -> Result<Vec<Property>, RepositoryError>;
    
    // QR code generation
    async fn generate_qr(&self, id: i32, context: &SecurityContext) -> Result<String, RepositoryError>;
    
    // Blockchain sync status
    async fn get_sync_status(&self, id: i32, context: &SecurityContext) -> Result<SyncStatus, RepositoryError>;
}
