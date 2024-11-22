use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use std::time::Duration;

use super::sync::{SyncStatus, SyncType, SyncPriority};
use super::asset::{AssetStatus, PointWrapper as GeoPoint};

/// Configuration for peer discovery
#[derive(Clone)]
pub struct DiscoveryConfig {
    pub broadcast_interval: Duration,
    pub peer_timeout: Duration,
    pub max_peers: usize,
}

impl Default for DiscoveryConfig {
    fn default() -> Self {
        Self {
            broadcast_interval: Duration::from_secs(30),
            peer_timeout: Duration::from_secs(180),
            max_peers: 100,
        }
    }
}

/// Represents a peer in the mesh network
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PeerInfo {
    pub node_id: String,
    pub address: String,
    pub capabilities: Vec<PeerCapability>,
    pub last_seen: DateTime<Utc>,
    pub metadata: HashMap<String, String>,
}

/// Represents capabilities of a peer
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum PeerCapability {
    Sync,
    Storage,
    Relay,
    Gateway,
    Scanner,
    Validator,
}

/// Represents the authentication status of a peer
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum AuthStatus {
    Verified,
    Pending,
    Failed,
    Revoked,
}

/// Represents a queue item for sync operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueItem {
    pub id: String,
    pub peer_id: String,
    pub sync_type: SyncType,
    pub priority: SyncPriority,
    pub attempts: u32,
    pub last_attempt: Option<DateTime<Utc>>,
    pub status: SyncStatus,
}

/// Represents different types of mesh network messages
#[derive(Debug, Serialize, Deserialize)]
pub enum Message {
    Discovery(DiscoveryMessage),
    Asset(AssetMessage),
    Location(LocationMessage),
    Transfer(TransferMessage),
    Sync(SyncMessage),
}

#[derive(Debug, Serialize, Deserialize)]
pub enum DiscoveryMessage {
    Ping,
    Pong,
    Announce(PeerInfo),
    Leave(String), // peer_id
}

#[derive(Debug, Serialize, Deserialize)]
pub enum AssetMessage {
    LocationUpdate {
        asset_id: String,
        location: GeoPoint,
        timestamp: DateTime<Utc>,
    },
    StatusUpdate {
        asset_id: String,
        status: AssetStatus,
        metadata: serde_json::Value,
    },
    Query {
        asset_id: String,
        query_type: AssetQueryType,
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub enum LocationMessage {
    Update(GeoPoint),
    Request(String), // asset_id
    Response {
        asset_id: String,
        location: Option<GeoPoint>,
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub enum TransferMessage {
    Request {
        transfer_id: String,
        asset_id: String,
        destination: String,
    },
    Validation {
        transfer_id: String,
        is_valid: bool,
        reason: Option<String>,
    },
    Complete {
        transfer_id: String,
        success: bool,
        metadata: Option<serde_json::Value>,
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub enum SyncMessage {
    StateRequest {
        from_timestamp: DateTime<Utc>,
        asset_ids: Vec<String>,
    },
    StateResponse {
        states: Vec<AssetState>,
        timestamp: DateTime<Utc>,
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AssetState {
    pub asset_id: String,
    pub location: Option<GeoPoint>,
    pub status: AssetStatus,
    pub last_updated: DateTime<Utc>,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum AssetQueryType {
    Location,
    Status,
    History,
    Full,
}

impl PeerInfo {
    pub fn new(node_id: String, address: String) -> Self {
        Self {
            node_id,
            address,
            capabilities: Vec::new(),
            last_seen: Utc::now(),
            metadata: HashMap::new(),
        }
    }

    pub fn with_capability(mut self, capability: PeerCapability) -> Self {
        self.capabilities.push(capability);
        self
    }

    pub fn has_capability(&self, capability: &PeerCapability) -> bool {
        self.capabilities.contains(capability)
    }

    pub fn update_last_seen(&mut self) {
        self.last_seen = Utc::now();
    }
}

impl QueueItem {
    pub fn new(id: String, peer_id: String, sync_type: SyncType, priority: SyncPriority) -> Self {
        Self {
            id,
            peer_id,
            sync_type,
            priority,
            attempts: 0,
            last_attempt: None,
            status: SyncStatus::Pending,
        }
    }

    pub fn increment_attempts(&mut self) {
        self.attempts += 1;
        self.last_attempt = Some(Utc::now());
    }

    pub fn should_retry(&self, max_attempts: u32) -> bool {
        self.attempts < max_attempts
    }
}
