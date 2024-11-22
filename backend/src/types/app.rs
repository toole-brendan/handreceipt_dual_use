use std::sync::Arc;
use async_trait::async_trait;
use tokio_postgres::Row;
use uuid::Uuid;

use super::{
    asset::Asset,
    error::CoreError,
    security::SecurityContext,
};

pub struct AppState {
    pub core: Arc<dyn CoreService>,
    pub infrastructure: Arc<dyn DatabaseService>,
    pub security: Arc<dyn SecurityService>,
    pub verification: Arc<dyn AssetVerification>,
    pub audit: Arc<dyn AuditLogger>,
    pub mesh: Arc<dyn MeshService>,
    pub p2p: Arc<dyn P2PService>,
    pub sync: Arc<dyn SyncManager>,
}

#[async_trait]
pub trait DatabaseService: Send + Sync {
    async fn execute_query(
        &self,
        query: &str,
        params: &[&(dyn tokio_postgres::types::ToSql + Sync)],
        security_context: &SecurityContext,
    ) -> Result<Vec<Row>, CoreError>;

    async fn get_asset(
        &self,
        id: Uuid,
        security_context: &SecurityContext,
    ) -> Result<Option<Asset>, CoreError>;

    async fn update_asset(
        &self,
        asset: &Asset,
        security_context: &SecurityContext,
    ) -> Result<(), CoreError>;

    async fn list_assets(
        &self,
        security_context: &SecurityContext,
    ) -> Result<Vec<Asset>, CoreError>;
}

#[async_trait]
pub trait SecurityService: Send + Sync {
    async fn validate_access(
        &self,
        context: &SecurityContext,
        resource: &str,
        action: &str,
    ) -> Result<bool, CoreError>;

    async fn encrypt_data(&self, data: &[u8]) -> Result<Vec<u8>, CoreError>;
    async fn decrypt_data(&self, data: &[u8]) -> Result<Vec<u8>, CoreError>;
}

#[async_trait]
pub trait AssetVerification: Send + Sync {
    async fn verify_asset(
        &self,
        asset: &Asset,
        context: &SecurityContext,
    ) -> Result<bool, CoreError>;
}

#[async_trait]
pub trait AuditLogger: Send + Sync {
    async fn log_event(
        &self,
        event: &str,
        context: &SecurityContext,
        metadata: Option<serde_json::Value>,
    ) -> Result<(), CoreError>;
}

#[async_trait]
pub trait CoreService: Send + Sync {
    async fn initialize(&self) -> Result<(), CoreError>;
    async fn shutdown(&self) -> Result<(), CoreError>;
}

#[async_trait]
pub trait MeshService: Send + Sync {
    async fn start(&self) -> Result<(), CoreError>;
    async fn stop(&self) -> Result<(), CoreError>;
}

#[async_trait]
pub trait P2PService: Send + Sync {
    async fn connect(&self, peer: &str) -> Result<(), CoreError>;
    async fn disconnect(&self, peer: &str) -> Result<(), CoreError>;
}

#[async_trait]
pub trait SyncManager: Send + Sync {
    async fn sync_with_peer(&self, peer: &str) -> Result<(), CoreError>;
    async fn get_sync_status(&self) -> Result<String, CoreError>;
}
