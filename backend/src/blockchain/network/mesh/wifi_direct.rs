// backend/src/blockchain/network/mesh/wifi_direct.rs

use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use chrono::Utc;
use log::{info, error, warn};
use tokio::net::{TcpListener, TcpStream};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use serde::{Serialize, Deserialize};
use std::net::SocketAddr;

use crate::models::mesh::NodeInfo;
use crate::config::mesh_config::MESH_CONFIG;
use crate::services::security::validation::TransferValidator;

#[derive(Debug)]
pub struct WifiDirectDiscovery {
    discovered_devices: Arc<RwLock<Vec<NodeInfo>>>,
    listener: Arc<TcpListener>,
    validator: Arc<TransferValidator>,
    local_node_info: NodeInfo,
}

#[derive(Debug, Serialize, Deserialize)]
struct DiscoveryMessage {
    message_type: MessageType,
    node_info: NodeInfo,
    timestamp: chrono::DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
enum MessageType {
    Announce,
    Response,
    Heartbeat,
    Disconnect,
}

impl WifiDirectDiscovery {
    pub async fn new(
        port: u16,
        validator: Arc<TransferValidator>,
        local_node_info: NodeInfo,
    ) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let addr = format!("0.0.0.0:{}", port);
        let listener = TcpListener::bind(&addr).await?;
        info!("WiFi Direct discovery listening on {}", addr);

        Ok(Self {
            discovered_devices: Arc::new(RwLock::new(Vec::new())),
            listener: Arc::new(listener),
            validator,
            local_node_info,
        })
    }

    pub async fn start_discovery(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let devices_clone = self.discovered_devices.clone();
        let listener_clone = self.listener.clone();
        let local_info_clone = self.local_node_info.clone();
        let validator_clone = self.validator.clone();

        // Start announcement broadcaster
        self.start_announcer().await?;

        // Start connection listener
        tokio::spawn(async move {
            loop {
                match listener_clone.accept().await {
                    Ok((socket, addr)) => {
                        let devices = devices_clone.clone();
                        let validator = validator_clone.clone();
                        let local_info = local_info_clone.clone();
                        
                        tokio::spawn(async move {
                            if let Err(e) = Self::handle_connection(
                                socket, 
                                addr, 
                                devices,
                                validator,
                                local_info
                            ).await {
                                error!("Error handling connection from {}: {}", addr, e);
                            }
                        });
                    }
                    Err(e) => {
                        error!("Failed to accept connection: {}", e);
                    }
                }
            }
        });

        Ok(())
    }

    async fn start_announcer(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let devices = self.discovered_devices.clone();
        let local_info = self.local_node_info.clone();

        tokio::spawn(async move {
            loop {
                if let Err(e) = Self::broadcast_announcement(&local_info).await {
                    error!("Failed to broadcast announcement: {}", e);
                }
                tokio::time::sleep(tokio::time::Duration::from_secs(
                    MESH_CONFIG.wifi_direct.announcement_interval
                )).await;
            }
        });

        Ok(())
    }

    async fn broadcast_announcement(
        local_info: &NodeInfo,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let message = DiscoveryMessage {
            message_type: MessageType::Announce,
            node_info: local_info.clone(),
            timestamp: Utc::now(),
        };

        let encoded = serde_json::to_vec(&message)?;

        // Broadcast to subnet
        // This is a simplified example - in production you'd use proper network discovery
        for port in MESH_CONFIG.wifi_direct.discovery_ports.iter() {
            if let Ok(mut stream) = TcpStream::connect(format!("255.255.255.255:{}", port)).await {
                if let Err(e) = stream.write_all(&encoded).await {
                    warn!("Failed to send announcement to port {}: {}", port, e);
                }
            }
        }

        Ok(())
    }

    async fn handle_connection(
        mut socket: TcpStream,
        addr: SocketAddr,
        devices: Arc<RwLock<Vec<NodeInfo>>>,
        validator: Arc<TransferValidator>,
        local_info: NodeInfo,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut buffer = vec![0u8; 4096];
        let n = socket.read(&mut buffer).await?;

        let message: DiscoveryMessage = serde_json::from_slice(&buffer[..n])?;

        // Validate the node
        if !validator.validate_node(&message.node_info).await? {
            return Err("Node validation failed".into());
        }

        // Update discovered devices
        {
            let mut devices = devices.write().await;
            if let Some(existing) = devices.iter_mut().find(|n| n.id == message.node_info.id) {
                existing.last_seen = Utc::now();
                existing.network_strength = message.node_info.network_strength;
            } else {
                devices.push(message.node_info.clone());
            }
        }

        // Send response if this was an announcement
        if matches!(message.message_type, MessageType::Announce) {
            let response = DiscoveryMessage {
                message_type: MessageType::Response,
                node_info: local_info,
                timestamp: Utc::now(),
            };

            let encoded = serde_json::to_vec(&response)?;
            socket.write_all(&encoded).await?;
        }

        Ok(())
    }

    pub async fn stop_discovery(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Send disconnect message to all peers
        let message = DiscoveryMessage {
            message_type: MessageType::Disconnect,
            node_info: self.local_node_info.clone(),
            timestamp: Utc::now(),
        };

        let encoded = serde_json::to_vec(&message)?;

        let devices = self.discovered_devices.read().await;
        for device in devices.iter() {
            if let Ok(mut stream) = TcpStream::connect(&device.address).await {
                if let Err(e) = stream.write_all(&encoded).await {
                    warn!("Failed to send disconnect to {}: {}", device.id, e);
                }
            }
        }

        Ok(())
    }

    pub async fn get_discovered_devices(&self) -> Vec<NodeInfo> {
        self.discovered_devices.read().await.clone()
    }

    pub async fn cleanup_old_devices(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut devices = self.discovered_devices.write().await;
        let cutoff = Utc::now() - chrono::Duration::minutes(5);
        
        let initial_count = devices.len();
        devices.retain(|d| d.last_seen > cutoff);
        let removed_count = initial_count - devices.len();
        
        if removed_count > 0 {
            info!("Cleaned up {} old devices", removed_count);
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::test;

    #[test]
    async fn test_wifi_direct_discovery() {
        // TODO: Add tests
        // Note: Will need to mock network functionality for testing
    }
}
