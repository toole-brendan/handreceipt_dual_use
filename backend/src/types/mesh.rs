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
    pub id: Uuid,
    pub address: String,
    pub capabilities: Vec<PeerCapability>,
    pub last_seen: DateTime<Utc>,
    pub status: AuthStatus,
}

/// Represents capabilities of a peer
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum PeerCapability {
    Sync,
    Discovery,
    Relay,
    Storage,
}

/// Represents the authentication status of a peer
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum AuthStatus {
    Pending,
    Verified,
    Authenticated,
    Failed,
}

/// Represents a queue item for sync operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueItem {
    pub id: Uuid,
    pub data: Vec<u8>,
    pub timestamp: DateTime<Utc>,
    pub priority: SyncPriority,
    pub attempts: u32,
}

/// Represents different types of mesh network messages
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Message {
    Discovery(DiscoveryMessage),
    Asset(AssetMessage),
    Location(LocationMessage),
    Transfer(TransferMessage),
    Sync(SyncMessage),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DiscoveryMessage {
    Ping,
    Pong,
    Announce(PeerInfo),
    Leave(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetMessage {
    pub id: Uuid,
    pub data: Vec<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocationMessage {
    pub id: Uuid,
    pub latitude: f64,
    pub longitude: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferMessage {
    pub id: Uuid,
    pub from: String,
    pub to: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncMessage {
    pub id: Uuid,
    pub data: Vec<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OfflineData {
    pub id: Uuid,
    pub data: Vec<u8>,
    pub timestamp: DateTime<Utc>,
    pub sync_priority: SyncPriority,
    pub attempts: u32,
    pub created_at: DateTime<Utc>,
}

impl PeerInfo {
    pub fn new(id: String, address: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            address,
            capabilities: Vec::new(),
            last_seen: Utc::now(),
            status: AuthStatus::Pending,
        }
    }

    pub fn with_capabilities(mut self, capabilities: Vec<PeerCapability>) -> Self {
        self.capabilities = capabilities;
        self
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
