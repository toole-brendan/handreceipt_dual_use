// backend/src/blockchain/network/mod.rs

pub mod core;
pub mod mesh;

use std::sync::Arc;
use tokio::sync::RwLock;

pub struct NetworkManager {
    p2p: Arc<core::p2p::P2PNetwork>,
    mesh: Arc<RwLock<Box<dyn mesh::MeshNetwork + Send + Sync>>>,
    sync: Arc<core::sync::PropertySync>,
}

impl NetworkManager {
    pub fn new(
        p2p: Arc<core::p2p::P2PNetwork>,
        mesh: Box<dyn mesh::MeshNetwork + Send + Sync>,
        sync: Arc<core::sync::PropertySync>,
    ) -> Self {
        Self {
            p2p,
            mesh: Arc::new(RwLock::new(mesh)),
            sync,
        }
    }

    pub async fn start(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Initialize and start network components
        Ok(())
    }
}

// Re-export commonly used types
pub use core::sync_manager::SyncManager;
pub use mesh::{bluetooth::BluetoothManager, wifi_direct::WifiDirectManager}; 