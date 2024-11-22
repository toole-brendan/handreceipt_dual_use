use std::sync::Arc;
use deadpool_postgres::Pool;
use actix_web::web;
use serde::{Deserialize, Serialize};

/// Represents the shared application state
pub struct AppState {
    pub db: Pool,
    pub security: Arc<dyn SecurityService>,
    pub blockchain: Arc<dyn BlockchainService>,
    pub sync_manager: Arc<dyn SyncManager>,
    pub asset_verification: Arc<dyn AssetVerification>,
    pub audit_logger: Arc<dyn AuditLogger>,
}

/// Configuration for the application
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub server: ServerConfig,
    pub database: DatabaseConfig,
    pub security: SecurityConfig,
    pub mesh: MeshConfig,
    pub blockchain: BlockchainConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub workers: usize,
    pub cors_origins: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub host: String,
    pub port: u16,
    pub name: String,
    pub user: String,
    pub password: String,
    pub max_connections: u32,
    pub ssl_mode: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    pub jwt_secret: String,
    pub token_expiration: i64,
    pub refresh_token_expiration: i64,
    pub password_iterations: u32,
    pub hsm_enabled: bool,
    pub mfa_required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MeshConfig {
    pub discovery_port: u16,
    pub sync_interval: u64,
    pub max_peers: usize,
    pub offline_storage_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockchainConfig {
    pub network_id: String,
    pub node_url: String,
    pub contract_address: String,
    pub private_key: Option<String>,
}

// Type aliases for commonly used types
pub type Data<T> = web::Data<T>;
pub type JsonConfig = web::JsonConfig;
pub type ServiceResult<T> = Result<T, Box<dyn std::error::Error>>;

// Trait definitions for core services
use async_trait::async_trait;

#[async_trait]
pub trait SecurityService: Send + Sync {
    async fn validate_token(&self, token: &str) -> ServiceResult<bool>;
    async fn generate_token(&self, claims: serde_json::Value) -> ServiceResult<String>;
}

#[async_trait]
pub trait BlockchainService: Send + Sync {
    async fn submit_transaction(&self, data: Vec<u8>) -> ServiceResult<String>;
    async fn verify_transaction(&self, tx_hash: &str) -> ServiceResult<bool>;
    async fn get_pending_transactions(&self) -> ServiceResult<Vec<Transaction>>;
    async fn mine_block(&self) -> ServiceResult<Block>;
    async fn verify_block(&self, block: &Block) -> ServiceResult<bool>;
    async fn add_peer(&self, address: String) -> ServiceResult<()>;
    async fn get_network_metrics(&self) -> ServiceResult<NetworkMetrics>;
    async fn broadcast_message(&self, message: &str) -> ServiceResult<()>;
}

#[async_trait]
pub trait SyncManager: Send + Sync {
    async fn start_sync(&self, peer_id: &str) -> ServiceResult<()>;
    async fn stop_sync(&self, peer_id: &str) -> ServiceResult<()>;
}

#[async_trait]
pub trait AssetVerification: Send + Sync {
    async fn verify_asset(&self, asset_id: &str) -> ServiceResult<bool>;
    async fn verify_transfer(&self, transfer_id: &str) -> ServiceResult<bool>;
}

#[async_trait]
pub trait AuditLogger: Send + Sync {
    async fn log_action(
        &self,
        action: &str,
        description: &str,
        context: &SecurityContext,
        resource_type: &str,
        resource_id: Option<Uuid>,
        status: AuditStatus,
        details: serde_json::Value,
    ) -> ServiceResult<()>;
}
