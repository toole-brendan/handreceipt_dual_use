// backend/src/services/network/mesh/sync/mod.rs

pub mod manager;   // Sync orchestration
pub mod resolver;  // Conflict resolution

pub use manager::{SyncManager, OfflineStorage, KeyManagement, DebugOfflineStorage, DebugKeyManagement};
pub use resolver::ConflictResolver;

// Import types from crate root
use crate::types::{
    sync::{SyncType, SyncStatus, SyncPriority},
    error::MeshError,
    security::SecurityContext,
};

// Re-export common types
pub use crate::types::sync::{
    Change,
    ChangeOperation,
    Resolution,
    BroadcastMessage,
    OfflineData,
};

#[async_trait::async_trait]
pub trait SyncHandler: Send + Sync {
    async fn handle_sync(&self, sync_type: SyncType, context: &SecurityContext) -> Result<(), MeshError>;
    async fn get_status(&self) -> Result<SyncStatus, MeshError>;
    async fn cancel_sync(&self) -> Result<(), MeshError>;
}

#[derive(Debug, Clone)]
pub struct SyncMetadata {
    pub id: uuid::Uuid,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub priority: SyncPriority,
    pub status: SyncStatus,
}
