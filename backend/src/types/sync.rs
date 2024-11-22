use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

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

/// Represents the priority of a sync operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum SyncPriority {
    Critical,
    High,
    Normal,
    Low,
    Background,
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
#[derive(Debug, Clone)]
pub enum ResolutionStrategy {
    LastWriteWins,
    MergeChanges,
    RequireManual,
    Custom(Box<dyn Fn(&Change, &Change) -> Resolution + Send + Sync>),
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
