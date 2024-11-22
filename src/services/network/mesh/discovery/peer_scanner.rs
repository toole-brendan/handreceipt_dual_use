use std::time::SystemTime;
use std::net::SocketAddr;
use serde::{Serialize, Deserialize};
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PeerInfo {
    pub address: SocketAddr,
    pub last_seen: SystemTime,
    pub capabilities: Vec<String>,
    pub status: PeerStatus,
    pub node_id: String,
} 