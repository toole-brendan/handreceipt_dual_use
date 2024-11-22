use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MeshNode {
    pub id: Uuid,
    pub node_type: NodeType,
    pub status: NodeStatus,
    pub last_seen: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NodeType {
    Primary,
    Secondary,
    Edge,
    Mobile,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NodeStatus {
    Active,
    Inactive,
    Syncing,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SyncOperation {
    Full,
    Incremental,
    Metadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SyncType {
    Push,
    Pull,
    Bidirectional,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Priority {
    High,
    Medium,
    Low,
} 