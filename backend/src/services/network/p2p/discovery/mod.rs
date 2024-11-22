use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::Utc;

use crate::types::{
    mesh::{PeerInfo, PeerCapability, DiscoveryConfig},
    error::MeshError,
};

pub struct PeerDiscovery {
    peers: Arc<RwLock<HashMap<String, PeerInfo>>>,
    discovery_config: DiscoveryConfig,
}

impl PeerDiscovery {
    pub fn new(config: DiscoveryConfig) -> Self {
        Self {
            peers: Arc::new(RwLock::new(HashMap::new())),
            discovery_config: config,
        }
    }

    pub async fn add_peer(&self, peer: PeerInfo) -> Result<(), MeshError> {
        let mut peers = self.peers.write().await;
        
        if peers.len() >= self.discovery_config.max_peers {
            return Err(MeshError::SystemError("Max peers reached".to_string()));
        }

        peers.insert(peer.node_id.clone(), peer);
        Ok(())
    }

    pub async fn remove_peer(&self, peer_id: &str) {
        let mut peers = self.peers.write().await;
        peers.remove(peer_id);
    }

    pub async fn get_peer(&self, peer_id: &str) -> Option<PeerInfo> {
        let peers = self.peers.read().await;
        peers.get(peer_id).cloned()
    }

    pub async fn get_peers_with_capability(&self, capability: PeerCapability) -> Vec<PeerInfo> {
        let peers = self.peers.read().await;
        peers.values()
            .filter(|peer| peer.has_capability(&capability))
            .cloned()
            .collect()
    }

    pub async fn update_peer_last_seen(&self, peer_id: &str) -> Result<(), MeshError> {
        let mut peers = self.peers.write().await;
        
        if let Some(peer) = peers.get_mut(peer_id) {
            peer.update_last_seen();
            Ok(())
        } else {
            Err(MeshError::PeerNotFound(peer_id.to_string()))
        }
    }

    pub async fn cleanup_stale_peers(&self) {
        let now = Utc::now();
        let timeout = self.discovery_config.peer_timeout;

        let mut peers = self.peers.write().await;
        peers.retain(|_, peer| {
            now.signed_duration_since(peer.last_seen).num_seconds() 
            < timeout.as_secs() as i64
        });
    }
}
