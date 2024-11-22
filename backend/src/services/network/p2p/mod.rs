pub mod discovery;
pub mod protocol;

// Re-export protocol types only since mesh types come from central types
pub use self::protocol::{
    Message,
    ProtocolHandler,
    ProtocolError,
    AssetStatus,
    AssetState,
};

use chrono::Utc;
use std::collections::HashMap;

use crate::types::{
    app::DatabaseService,
    mesh::{PeerInfo, PeerCapability, AuthStatus},
    error::{NetworkError, CoreError},
    sync::{SyncStatus, SyncType},
};

pub struct P2PNetwork {
    discovery: discovery::PeerDiscovery,
    protocol: ProtocolHandler,
    node_id: String,
}

impl P2PNetwork {
    pub fn new(
        node_id: String,
        discovery_config: discovery::DiscoveryConfig,
        capabilities: Vec<PeerCapability>,
    ) -> Self {
        let discovery = discovery::PeerDiscovery::new(discovery_config);
        let protocol = ProtocolHandler::new(node_id.clone(), capabilities);

        Self {
            discovery,
            protocol,
            node_id,
        }
    }

    pub async fn start(&self) -> Result<(), NetworkError> {
        // Announce this node to the network
        let peer_info = PeerInfo::new(
            self.node_id.clone(),
            String::new(), // Set actual network address
        ).with_capability(PeerCapability::Sync);

        self.discovery.add_peer(peer_info).await
            .map_err(|e| NetworkError::ConnectionFailed(e.to_string()))?;

        Ok(())
    }

    pub async fn broadcast(&self, message: Message) -> Result<(), NetworkError> {
        // Implement message broadcasting to peers
        Ok(())
    }

    pub async fn send_to_peer(&self, peer_id: &str, message: Message) -> Result<(), NetworkError> {
        // Implement direct peer message sending
        Ok(())
    }

    pub async fn get_peers_with_capability(&self, capability: PeerCapability) -> Vec<PeerInfo> {
        self.discovery.get_peers_with_capability(capability).await
    }
}

// Convenience function to create a new P2P network instance
pub fn create_p2p_network(
    node_id: String,
    db: DatabaseService,
    capabilities: Vec<PeerCapability>,
) -> P2PNetwork {
    let config = discovery::DiscoveryConfig::default();
    P2PNetwork::new(node_id, config, capabilities)
}
