// backend/src/blockchain/network/mesh/bluetooth.rs

use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use chrono::Utc;
use log::{info, error, warn};
use btleplug::api::{Central, Manager as _, Peripheral, ScanFilter};
use btleplug::platform::{Manager, Adapter};
use serde::{Serialize, Deserialize};

use crate::models::mesh::NodeInfo;
use crate::config::mesh_config::MESH_CONFIG;

#[derive(Debug)]
pub struct BluetoothDiscovery {
    adapter: Arc<Adapter>,
    discovered_devices: Arc<RwLock<Vec<NodeInfo>>>,
    scan_filter: ScanFilter,
}

impl BluetoothDiscovery {
    pub async fn new() -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let manager = Manager::new().await?;
        let adapters = manager.adapters().await?;
        let adapter = adapters.into_iter().next()
            .ok_or("No Bluetooth adapter found")?;

        let scan_filter = ScanFilter {
            services: vec![
                MESH_CONFIG.bluetooth.service_uuid.parse()?,
            ],
        };

        Ok(Self {
            adapter: Arc::new(adapter),
            discovered_devices: Arc::new(RwLock::new(Vec::new())),
            scan_filter,
        })
    }

    pub async fn start_discovery(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        info!("Starting Bluetooth discovery");

        self.adapter.start_scan(self.scan_filter.clone()).await?;

        let adapter_clone = self.adapter.clone();
        let devices_clone = self.discovered_devices.clone();

        tokio::spawn(async move {
            loop {
                match Self::scan_for_devices(&adapter_clone, &devices_clone).await {
                    Ok(_) => tokio::time::sleep(tokio::time::Duration::from_secs(5)).await,
                    Err(e) => {
                        error!("Bluetooth scan error: {}", e);
                        break;
                    }
                }
            }
        });

        Ok(())
    }

    async fn scan_for_devices(
        adapter: &Adapter,
        discovered_devices: &RwLock<Vec<NodeInfo>>,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let peripherals = adapter.peripherals().await?;

        for peripheral in peripherals {
            if let Ok(properties) = peripheral.properties().await {
                if let Some(name) = properties.local_name {
                    if name.starts_with("MESH_") {
                        let device_info = Self::extract_device_info(&peripheral).await?;
                        Self::update_device_list(discovered_devices, device_info).await?;
                    }
                }
            }
        }

        Ok(())
    }

    async fn extract_device_info(
        peripheral: &impl Peripheral,
    ) -> Result<NodeInfo, Box<dyn std::error::Error + Send + Sync>> {
        let properties = peripheral.properties().await?;
        let services = peripheral.services();
        
        // Connect to device to read characteristics
        peripheral.connect().await?;
        
        // Read mesh service characteristics
        let characteristics = peripheral
            .characteristics()
            .into_iter()
            .filter(|c| c.uuid == MESH_CONFIG.bluetooth.characteristic_uuid);

        let mut node_info = NodeInfo {
            id: Uuid::new_v4(), // Will be overwritten with actual device ID
            address: peripheral.address().to_string(),
            last_seen: Utc::now(),
            capabilities: vec!["bluetooth".to_string()],
            status: "Online".to_string(),
            version: "1.0".to_string(),
            network_strength: properties.rssi.unwrap_or(0),
            security_level: None,
        };

        for characteristic in characteristics {
            if let Ok(data) = peripheral.read(&characteristic).await {
                if let Ok(info) = serde_json::from_slice::<NodeInfo>(&data) {
                    node_info = info;
                    node_info.last_seen = Utc::now();
                    node_info.network_strength = properties.rssi.unwrap_or(0);
                    break;
                }
            }
        }

        peripheral.disconnect().await?;
        Ok(node_info)
    }

    async fn update_device_list(
        discovered_devices: &RwLock<Vec<NodeInfo>>,
        device_info: NodeInfo,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut devices = discovered_devices.write().await;
        
        if let Some(existing) = devices.iter_mut().find(|d| d.id == device_info.id) {
            existing.last_seen = device_info.last_seen;
            existing.network_strength = device_info.network_strength;
            existing.status = device_info.status;
        } else {
            devices.push(device_info);
        }

        // Remove old devices
        let cutoff = Utc::now() - chrono::Duration::seconds(30);
        devices.retain(|d| d.last_seen > cutoff);

        Ok(())
    }

    pub async fn stop_discovery(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        info!("Stopping Bluetooth discovery");
        self.adapter.stop_scan().await?;
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
    async fn test_bluetooth_discovery() {
        // TODO: Add tests
        // Note: Will need to mock BLE functionality for testing
    }
}
