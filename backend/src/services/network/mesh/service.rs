use std::sync::Arc;
use tokio::sync::RwLock;

use crate::types::{
    mesh::{
        PeerInfo, AuthStatus, QueueItem, OfflineData,
        PeerCapability, SyncPriority,
    },
    sync::{SyncType, Resolution},
    error::MeshError,
};

// Use relative imports for service implementations
use super::{
    discovery::{
        peer_scanner::PeerScanner,
        authenticator::PeerAuthenticator,
    },
    sync::{
        manager::SyncManager,
        resolver::ConflictResolver,
    },
    offline::{
        storage::OfflineStorage,
        queue::SyncQueue,
    },
};

pub struct MeshService {
    peer_scanner: Arc<PeerScanner>,
    authenticator: Arc<PeerAuthenticator>,
    sync_manager: Arc<SyncManager>,
    conflict_resolver: Arc<RwLock<ConflictResolver>>,
    offline_storage: Arc<OfflineStorage>,
    sync_queue: Arc<SyncQueue>,
}

impl MeshService {
    pub async fn new(
        node_id: String,
        scan_interval: std::time::Duration,
        max_storage_size: usize,
        max_queue_size: usize,
    ) -> Result<Self, MeshError> {
        let peer_scanner = Arc::new(PeerScanner::new(node_id.clone(), scan_interval)
            .await
            .map_err(|e| MeshError::SystemError(e.to_string()))?);
            
        let authenticator = Arc::new(PeerAuthenticator::new());
        
        // Initialize SyncManager with required parameters
        let storage = Arc::new(OfflineStorage::new(max_storage_size));
        let sync_manager = Arc::new(SyncManager::new(storage.clone()));
        
        let conflict_resolver = Arc::new(RwLock::new(ConflictResolver::new()));
        let sync_queue = Arc::new(SyncQueue::new(3, max_queue_size));

        Ok(Self {
            peer_scanner,
            authenticator,
            sync_manager,
            conflict_resolver,
            offline_storage: storage,
            sync_queue,
        })
    }

    pub async fn start(&self) -> Result<(), MeshError> {
        // Start peer discovery
        self.peer_scanner.start_scanning().await
            .map_err(|e| MeshError::SystemError(e.to_string()))?;

        // Start sync queue processing
        self.start_queue_processor().await?;

        Ok(())
    }

    async fn start_queue_processor(&self) -> Result<(), MeshError> {
        let sync_queue = self.sync_queue.clone();
        let sync_manager = self.sync_manager.clone();
        let offline_storage = self.offline_storage.clone();
        let conflict_resolver = self.conflict_resolver.clone();

        tokio::spawn(async move {
            loop {
                if let Some(item) = sync_queue.dequeue().await {
                    match Self::process_sync_item(
                        &sync_manager,
                        &offline_storage,
                        &conflict_resolver,
                        item.clone()
                    ).await {
                        Ok(_) => {
                            // Update sync status in storage
                            let _ = offline_storage.update_sync_status(
                                &item.id,
                                crate::types::sync::SyncStatus::Completed
                            ).await;
                        }
                        Err(e) => {
                            // Handle sync failure
                            let _ = sync_queue.requeue_failed(item).await;
                            eprintln!("Sync error: {}", e);
                        }
                    }
                }
                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
            }
        });

        Ok(())
    }

    async fn process_sync_item(
        sync_manager: &SyncManager,
        offline_storage: &OfflineStorage,
        conflict_resolver: &RwLock<ConflictResolver>,
        item: QueueItem,
    ) -> Result<(), MeshError> {
        // Get data from storage
        let data = offline_storage.get(&item.id).await
            .ok_or_else(|| MeshError::DataNotFound(item.id.clone()))?;

        // Check for conflicts
        if let Some(remote_data) = sync_manager.get_remote_data(&item.id).await {
            let resolver = conflict_resolver.read().await;
            let resolution = resolver.resolve_conflicts(
                &data.into(),
                &remote_data
            ).await;

            match resolution {
                Resolution::Accept(change) => {
                    sync_manager.apply_change(change).await
                        .map_err(|e| MeshError::SyncFailed {
                            peer_id: item.id.clone(),
                            reason: e.to_string(),
                        })?;
                }
                Resolution::Reject => {
                    return Err(MeshError::ConflictResolutionFailed {
                        resource_id: item.id,
                        reason: "Change rejected".to_string(),
                    });
                }
                Resolution::Merge(merged) => {
                    sync_manager.apply_change(merged).await
                        .map_err(|e| MeshError::SyncFailed {
                            peer_id: item.id.clone(),
                            reason: e.to_string(),
                        })?;
                }
            }
        }

        Ok(())
    }

    pub async fn connect_to_peer(&self, peer_id: &str) -> Result<(), MeshError> {
        // Get peer info
        let peers = self.peer_scanner.get_available_peers().await;
        let peer = peers.iter()
            .find(|p| p.node_id == peer_id)
            .ok_or_else(|| MeshError::PeerNotFound(peer_id.to_string()))?;

        // Authenticate peer
        match self.authenticator.verify_peer(peer_id).await {
            Ok(AuthStatus::Verified) => {
                // Start sync process
                self.sync_manager.start_sync(
                    peer_id,
                    SyncType::Full
                ).await.map_err(|e| MeshError::SyncFailed {
                    peer_id: peer_id.to_string(),
                    reason: e.to_string(),
                })?;
                Ok(())
            }
            _ => Err(MeshError::AuthenticationFailed {
                peer_id: peer_id.to_string(),
                reason: "Verification failed".to_string(),
            })
        }
    }
}
