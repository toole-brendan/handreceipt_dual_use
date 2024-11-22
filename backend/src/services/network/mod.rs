// backend/src/services/network/mod.rs

pub mod mesh;
pub mod sync;
pub mod p2p;

// Re-export commonly used types and services
pub use mesh::{
    MeshService,
    MeshError,
    discovery::{PeerAuthenticator, PeerScanner},
    sync::{SyncManager, SyncType, SyncStatus},
    offline::{OfflineStorage, SyncQueue},
};

pub use sync::{
    service::SyncService,
    manager::SyncManager as NetworkSyncManager,
};

// Network-wide types
#[derive(Debug, Clone)]
pub struct NetworkConfig {
    pub mesh_enabled: bool,
    pub p2p_enabled: bool,
    pub sync_interval: std::time::Duration,
    pub max_peers: usize,
}

pub struct NetworkService {
    pub mesh: Option<mesh::MeshService>,
    pub sync: sync::service::SyncService,
    config: NetworkConfig,
}

impl NetworkService {
    pub async fn new(config: NetworkConfig) -> Result<Self, MeshError> {
        let mesh = if config.mesh_enabled {
            Some(mesh::MeshService::new(
                "node-1".to_string(),
                config.sync_interval,
                1024 * 1024 * 10, // 10MB storage
                1000, // queue size
            ).await?)
        } else {
            None
        };

        let sync = sync::service::SyncService::new();

        Ok(Self {
            mesh,
            sync,
            config,
        })
    }

    pub async fn start(&self) -> Result<(), MeshError> {
        if let Some(mesh) = &self.mesh {
            mesh.start().await?;
        }
        Ok(())
    }
}
