use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MeshConfig {
    pub discovery_port: u16,
    pub sync_interval: Duration,
    pub max_peers: usize,
    pub bluetooth: BluetoothConfig,
    pub wifi_direct: WifiDirectConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BluetoothConfig {
    pub enabled: bool,
    pub service_uuid: String,
    pub characteristic_uuid: String,
    pub scan_interval: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WifiDirectConfig {
    pub enabled: bool,
    pub group_owner_intent: i32,
    pub service_name: String,
    pub service_type: String,
}

impl Default for MeshConfig {
    fn default() -> Self {
        Self {
            discovery_port: 8765,
            sync_interval: Duration::from_secs(60),
            max_peers: 10,
            bluetooth: BluetoothConfig::default(),
            wifi_direct: WifiDirectConfig::default(),
        }
    }
}

impl Default for BluetoothConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            service_uuid: "00001101-0000-1000-8000-00805F9B34FB".to_string(),
            characteristic_uuid: "00002101-0000-1000-8000-00805F9B34FB".to_string(),
            scan_interval: Duration::from_secs(30),
        }
    }
}

impl Default for WifiDirectConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            group_owner_intent: 7,
            service_name: "MeshNetwork".to_string(),
            service_type: "_mesh._tcp.local.".to_string(),
        }
    }
}
