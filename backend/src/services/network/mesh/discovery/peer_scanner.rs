use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use tokio::net::UdpSocket;
use tokio::time::Duration;
use serde::{Serialize, Deserialize};
use chrono::Utc;

use crate::types::{
    mesh::{PeerInfo, PeerCapability, AuthStatus, Message, DiscoveryMessage},
    error::MeshError,
};

const DISCOVERY_PORT: u16 = 8338;
const BROADCAST_ADDR: &str = "255.255.255.255";

#[derive(Debug, Serialize, Deserialize)]
struct DiscoveryPayload {
    message_type: MessageType,
    node_id: String,
    capabilities: Vec<PeerCapability>,
}

#[derive(Debug, Serialize, Deserialize)]
enum MessageType {
    Announce,
    Response,
}

pub struct PeerScanner {
    peers: Arc<Mutex<HashMap<String, PeerInfo>>>,
    scan_interval: Duration,
    socket: Arc<UdpSocket>,
    node_id: String,
}

impl PeerScanner {
    pub async fn new(node_id: String, scan_interval: Duration) -> Result<Self, MeshError> {
        let socket = UdpSocket::bind("0.0.0.0:0").await
            .map_err(|e| MeshError::SystemError(e.to_string()))?;
        socket.set_broadcast(true)
            .map_err(|e| MeshError::SystemError(e.to_string()))?;
        
        Ok(Self {
            peers: Arc::new(Mutex::new(HashMap::new())),
            scan_interval,
            socket: Arc::new(socket),
            node_id,
        })
    }

    pub async fn start_scanning(&self) -> Result<(), MeshError> {
        let peers = self.peers.clone();
        let socket = self.socket.clone();
        let node_id = self.node_id.clone();
        let scan_interval = self.scan_interval;
        
        // Start broadcast listener
        self.start_listener().await?;
        
        // Start periodic announcements
        tokio::spawn(async move {
            loop {
                if let Err(e) = Self::broadcast_presence(&socket, &node_id).await {
                    eprintln!("Broadcast error: {}", e);
                }
                
                if let Ok(discovered_peers) = Self::scan_network(&socket).await {
                    let mut peers_lock = peers.lock().unwrap();
                    for (id, peer_info) in discovered_peers {
                        peers_lock.insert(id, peer_info);
                    }
                }
                
                tokio::time::sleep(scan_interval).await;
            }
        });

        Ok(())
    }

    async fn start_listener(&self) -> Result<(), MeshError> {
        let socket = self.socket.clone();
        let peers = self.peers.clone();
        let node_id = self.node_id.clone();

        tokio::spawn(async move {
            let mut buf = vec![0u8; 1024];
            
            loop {
                match socket.recv_from(&mut buf).await {
                    Ok((len, addr)) => {
                        if let Ok(message) = serde_json::from_slice::<DiscoveryPayload>(&buf[..len]) {
                            match message.message_type {
                                MessageType::Announce => {
                                    // Respond to announcements
                                    let response = DiscoveryPayload {
                                        message_type: MessageType::Response,
                                        node_id: node_id.clone(),
                                        capabilities: vec![
                                            PeerCapability::Sync,
                                            PeerCapability::Storage,
                                        ],
                                    };
                                    
                                    if let Ok(data) = serde_json::to_vec(&response) {
                                        let _ = socket.send_to(&data, addr).await;
                                    }
                                }
                                MessageType::Response => {
                                    // Update peer info
                                    let mut peers_lock = peers.lock().unwrap();
                                    peers_lock.insert(
                                        message.node_id.clone(),
                                        PeerInfo::new(message.node_id.clone(), addr.to_string())
                                            .with_capabilities(message.capabilities),
                                    );
                                }
                            }
                        }
                    }
                    Err(e) => eprintln!("Socket receive error: {}", e),
                }
            }
        });

        Ok(())
    }

    async fn broadcast_presence(socket: &UdpSocket, node_id: &str) -> Result<(), MeshError> {
        let message = DiscoveryPayload {
            message_type: MessageType::Announce,
            node_id: node_id.to_string(),
            capabilities: vec![
                PeerCapability::Sync,
                PeerCapability::Storage,
            ],
        };

        let data = serde_json::to_vec(&message)
            .map_err(|e| MeshError::SystemError(e.to_string()))?;
        
        socket.send_to(&data, format!("{}:{}", BROADCAST_ADDR, DISCOVERY_PORT)).await
            .map_err(|e| MeshError::SystemError(e.to_string()))?;
        
        Ok(())
    }

    async fn scan_network(socket: &UdpSocket) -> Result<HashMap<String, PeerInfo>, MeshError> {
        let mut discovered_peers = HashMap::new();
        
        // TODO: Implement active network scanning
        // This could include:
        // 1. Port scanning
        // 2. Service discovery
        // 3. Known peers list
        
        Ok(discovered_peers)
    }

    pub async fn get_available_peers(&self) -> Vec<PeerInfo> {
        let peers = self.peers.lock().unwrap();
        peers.values()
            .filter(|p| p.status != AuthStatus::Failed)
            .cloned()
            .collect()
    }

    pub async fn get_peer(&self, node_id: &str) -> Option<PeerInfo> {
        self.peers.lock().unwrap().get(node_id).cloned()
    }

    pub async fn remove_peer(&self, node_id: &str) {
        self.peers.lock().unwrap().remove(node_id);
    }

    pub async fn update_peer_capabilities(&self, node_id: &str, capabilities: Vec<PeerCapability>) -> Result<(), MeshError> {
        let mut peers = self.peers.lock().unwrap();
        if let Some(peer) = peers.get_mut(node_id) {
            peer.capabilities = capabilities;
            Ok(())
        } else {
            Err(MeshError::PeerNotFound(node_id.to_string()))
        }
    }

    pub async fn update_peer_status(&self, node_id: &str, status: AuthStatus) -> Result<(), MeshError> {
        let mut peers = self.peers.lock().unwrap();
        if let Some(peer) = peers.get_mut(node_id) {
            peer.status = status;
            peer.last_seen = Utc::now();
            Ok(())
        } else {
            Err(MeshError::PeerNotFound(node_id.to_string()))
        }
    }

    async fn handle_discovery_message(&self, message: Message, addr: SocketAddr) -> Result<(), MeshError> {
        match message {
            Message::Discovery(DiscoveryMessage::Announce(mut peer_info)) => {
                // Update peer address from actual connection
                peer_info.address = addr.to_string();
                peer_info.last_seen = Utc::now();
                
                let mut peers = self.peers.lock().unwrap();
                peers.insert(peer_info.id.to_string(), peer_info);
                Ok(())
            },
            Message::Discovery(DiscoveryMessage::Leave(id)) => {
                self.remove_peer(&id).await;
                Ok(())
            },
            _ => Ok(()),
        }
    }
}
