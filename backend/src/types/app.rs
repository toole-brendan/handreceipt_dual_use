use async_trait::async_trait;
use std::sync::Arc;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::{
    error::CoreError,
    types::{
        security::{SecurityContext, SecurityClassification},
        asset::Asset,
        sync::{SyncRequest, SyncStatus, SyncType},
        audit::AuditEvent,
    },
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppStatus {
    pub healthy: bool,
    pub uptime: u64,
    pub version: String,
    pub environment: String,
}

// Service traits
#[async_trait]
pub trait CoreService: Send + Sync {
    async fn initialize(&self) -> Result<(), CoreError>;
    async fn shutdown(&self) -> Result<(), CoreError>;
    async fn health_check(&self) -> Result<bool, CoreError>;
    async fn get_status(&self) -> Result<AppStatus, CoreError>;
}

#[async_trait]
pub trait DatabaseService: Send + Sync {
    async fn execute_query(&self, query: &str) -> Result<(), CoreError>;
    async fn get_asset(&self, id: Uuid) -> Result<Option<Asset>, CoreError>;
    async fn update_asset(&self, asset: &Asset, context: &SecurityContext) -> Result<(), CoreError>;
    async fn list_assets(&self, context: &SecurityContext) -> Result<Vec<Asset>, CoreError>;
    async fn delete_asset(&self, id: Uuid, context: &SecurityContext) -> Result<(), CoreError>;
    async fn initialize(&self) -> Result<(), CoreError>;
    async fn shutdown(&self) -> Result<(), CoreError>;
    async fn health_check(&self) -> Result<bool, CoreError>;
    async fn get_start_time(&self) -> Result<DateTime<Utc>, CoreError>;
}

#[async_trait]
pub trait SecurityService: Send + Sync {
    async fn validate_context(&self, context: &SecurityContext) -> Result<bool, CoreError>;
    async fn check_permissions(&self, context: &SecurityContext, resource: &str, action: &str) -> Result<bool, CoreError>;
    async fn encrypt_data(&self, data: &[u8]) -> Result<Vec<u8>, CoreError>;
    async fn decrypt_data(&self, data: &[u8]) -> Result<Vec<u8>, CoreError>;
    async fn initialize(&self) -> Result<(), CoreError>;
    async fn shutdown(&self) -> Result<(), CoreError>;
    async fn health_check(&self) -> Result<bool, CoreError>;
}

#[async_trait]
pub trait AssetVerification: Send + Sync {
    async fn verify_asset(&self, id: &str, context: &SecurityContext) -> Result<bool, CoreError>;
}

#[async_trait]
pub trait AuditLogger: Send + Sync {
    async fn log_event(&self, event: AuditEvent, context: &SecurityContext) -> Result<(), CoreError>;
    async fn initialize(&self) -> Result<(), CoreError>;
    async fn shutdown(&self) -> Result<(), CoreError>;
    async fn health_check(&self) -> Result<bool, CoreError>;
}

#[async_trait]
pub trait MeshService: Send + Sync {
    async fn connect(&self, peer_id: &str) -> Result<(), CoreError>;
    async fn disconnect(&self, peer_id: &str) -> Result<(), CoreError>;
    async fn connect_peers(&self, context: &SecurityContext) -> Result<(), CoreError>;
    async fn broadcast_message(&self, message: Vec<u8>, context: &SecurityContext) -> Result<(), CoreError>;
    async fn start(&self, context: &SecurityContext) -> Result<(), CoreError>;
    async fn stop(&self, context: &SecurityContext) -> Result<(), CoreError>;
}

#[async_trait]
pub trait P2PService: Send + Sync {
    async fn broadcast(&self, data: Vec<u8>) -> Result<(), CoreError>;
    async fn send_to_peer(&self, peer_id: &str, data: Vec<u8>) -> Result<(), CoreError>;
}

#[async_trait]
pub trait SyncManager: Send + Sync {
    async fn start_sync(&self, sync_type: SyncType, context: &SecurityContext) -> Result<(), CoreError>;
    async fn get_status(&self) -> Result<SyncStatus, CoreError>;
}

// App state with generic type parameters for object safety
#[derive(Clone)]
pub struct AppState<DB, SEC, AV, AL, SM, MS, PS> 
where
    DB: DatabaseService,
    SEC: SecurityService,
    AV: AssetVerification,
    AL: AuditLogger,
    SM: SyncManager,
    MS: MeshService,
    PS: P2PService,
{
    pub config: AppConfig,
    pub database: Arc<DB>,
    pub security: Arc<SEC>,
    pub verification: Arc<AV>,
    pub audit: Arc<AL>,
    pub sync_manager: Arc<SM>,
    pub mesh_service: Arc<MS>,
    pub p2p_service: Arc<PS>,
}

// Configuration types
#[derive(Clone, Debug, Default)]
pub struct AppConfig {
    pub environment: Environment,
    pub database: DatabaseConfig,
    pub security: SecurityConfig,
    pub features: FeatureFlags,
}

#[derive(Clone, Debug)]
pub enum Environment {
    Development,
    Staging,
    Production,
}

impl Default for Environment {
    fn default() -> Self {
        Environment::Development
    }
}

#[derive(Clone, Debug, Default)]
pub struct DatabaseConfig {
    pub url: String,
    pub max_connections: u32,
}

#[derive(Clone, Debug, Default)]
pub struct SecurityConfig {
    pub encryption_key: String,
    pub token_secret: String,
}

#[derive(Clone, Debug, Default)]
pub struct FeatureFlags {
    pub enable_mesh: bool,
    pub enable_p2p: bool,
    pub enable_audit: bool,
}
