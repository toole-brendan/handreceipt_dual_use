use async_trait::async_trait;
use std::sync::Arc;

use crate::types::{
    app::{DatabaseService, SyncManager},
    error::CoreError,
};

use super::super::{
    mesh::MeshService,
    p2p::P2PService,
};

pub struct SyncManagerImpl {
    infrastructure: Arc<dyn DatabaseService>,
    mesh: Arc<dyn MeshService>,
    p2p: Arc<dyn P2PService>,
}

impl SyncManagerImpl {
    pub fn new(
        infrastructure: Arc<dyn DatabaseService>,
        mesh: Arc<dyn MeshService>,
        p2p: Arc<dyn P2PService>,
    ) -> Self {
        Self {
            infrastructure,
            mesh,
            p2p,
        }
    }
}

#[async_trait]
impl SyncManager for SyncManagerImpl {
    async fn sync_with_peer(&self, peer: &str) -> Result<(), CoreError> {
        // Connect to peer
        self.p2p.connect(peer).await?;

        // Perform sync
        // TODO: Implement sync logic

        // Disconnect
        self.p2p.disconnect(peer).await?;
        Ok(())
    }

    async fn get_sync_status(&self) -> Result<String, CoreError> {
        // Return current sync status
        Ok("Idle".to_string())
    }
}
