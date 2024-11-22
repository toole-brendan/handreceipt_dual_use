use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use async_trait::async_trait;
use crate::types::{
    error::CoreError,
    security::SecurityContext,
};
use std::sync::Arc;

/// Represents the status of a sync operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum SyncStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
    Cancelled,
}

/// Represents different types of sync operations
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum SyncType {
    Full,
    Incremental,
    AssetOnly,
    MetadataOnly,
    SecurityOnly,
}

/// Common sync error types
#[derive(Debug, Clone)]
pub enum SyncError {
    ConnectionFailed(String),
    AuthenticationFailed(String),
    ValidationFailed(String),
    TransferFailed(String),
    Timeout(String),
}

/// Sync metrics for monitoring
#[derive(Debug, Clone)]
pub struct SyncMetrics {
    pub total_transfers: usize,
    pub successful_transfers: usize,
    pub failed_transfers: usize,
    pub last_sync: Option<DateTime<Utc>>,
    pub average_sync_time: std::time::Duration,
}

/// Represents a set of changes to be synced
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChangeSet {
    pub timestamp: DateTime<Utc>,
    pub changes: Vec<Change>,
    pub source: String,
}

/// Represents a single change
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Change {
    pub id: Uuid,
    pub resource_id: String,
    pub operation: ChangeOperation,
    pub data: serde_json::Value,
    pub version: u64,
    pub timestamp: DateTime<Utc>,
    pub metadata: Option<HashMap<String, String>>,
}

/// Represents different types of change operations
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ChangeOperation {
    Create,
    Update,
    Delete,
    Merge,
}

/// Represents different conflict resolution strategies
#[derive(Clone)]
pub enum ResolutionStrategy {
    LastWriteWins,
    MergeChanges,
    RequireManual,
    Custom(Arc<dyn Fn(&Change, &Change) -> Resolution + Send + Sync>),
}

impl std::fmt::Debug for ResolutionStrategy {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::LastWriteWins => write!(f, "LastWriteWins"),
            Self::MergeChanges => write!(f, "MergeChanges"),
            Self::RequireManual => write!(f, "RequireManual"),
            Self::Custom(_) => write!(f, "Custom(...)"),
        }
    }
}

/// Represents the resolution of a sync conflict
#[derive(Debug, Clone)]
pub enum Resolution {
    Accept(Change),
    Reject,
    Merge(Change),
}

/// Represents offline data that needs to be synced
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OfflineData {
    pub id: Uuid,
    pub data_type: String,
    pub data: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub sync_priority: SyncPriority,
    pub attempts: u32,
}

/// Represents the priority of a sync operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum SyncPriority {
    Critical,
    High,
    Normal,
    Low,
    Background,
}

/// Represents a sync request between nodes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncRequest {
    pub id: Uuid,
    pub peer_id: String,
    pub sync_type: SyncType,
    pub timestamp: DateTime<Utc>,
    pub priority: SyncPriority,
    pub metadata: Option<HashMap<String, String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BroadcastMessage {
    pub id: Uuid,
    pub message: String,
    pub timestamp: DateTime<Utc>,
    pub priority: SyncPriority,
}

/// Metadata about a sync operation
#[derive(Debug, Clone)]
pub struct SyncMetadata {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub priority: SyncPriority,
    pub status: SyncStatus,
}

/// Trait for handling sync operations
#[async_trait]
pub trait SyncHandler: Send + Sync {
    async fn handle_sync(&self, sync_type: SyncType, context: &SecurityContext) -> Result<(), CoreError>;
    async fn get_status(&self) -> Result<SyncStatus, CoreError>;
    async fn cancel_sync(&self) -> Result<(), CoreError>;
}

/// Trait for blockchain service operations
#[async_trait]
pub trait BlockchainService: Send + Sync {
    async fn broadcast_message(&self, message: &BroadcastMessage) -> Result<(), CoreError>;
}

// Implementation helpers
impl Change {
    pub fn new(
        resource_id: String,
        operation: ChangeOperation,
        data: serde_json::Value,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            resource_id,
            operation,
            data,
            version: 1,
            timestamp: Utc::now(),
            metadata: None,
        }
    }

    pub fn with_metadata(mut self, metadata: HashMap<String, String>) -> Self {
        self.metadata = Some(metadata);
        self
    }

    pub fn with_version(mut self, version: u64) -> Self {
        self.version = version;
        self
    }
}

impl Default for ResolutionStrategy {
    fn default() -> Self {
        Self::LastWriteWins
    }
}

impl BroadcastMessage {
    pub fn new(message: String, priority: SyncPriority) -> Self {
        Self {
            id: Uuid::new_v4(),
            message,
            timestamp: Utc::now(),
            priority,
        }
    }
}
