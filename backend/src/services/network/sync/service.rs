// backend/src/services/network/sync/service.rs

use crate::services::core::{SecurityContext, CoreError};
use crate::models::transfer::AssetTransfer;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use std::collections::HashMap;

pub struct SyncService {
    peers: Arc<RwLock<HashMap<Uuid, PeerSync>>>,
    security_context: Arc<SecurityContext>,
}

impl SyncService {
    pub fn new() -> Self {
        Self {
            peers: Arc::new(RwLock::new(HashMap::new())),
            security_context: Arc::new(SecurityContext::default()),
        }
    }

    pub async fn register_peer(&self, peer_id: Uuid, security_context: Arc<SecurityContext>) -> Result<(), CoreError> {
        let mut peers = self.peers.write().await;
        let peer_sync = PeerSync::new(peer_id, security_context);
        peers.insert(peer_id, peer_sync);
        Ok(())
    }

    pub async fn queue_transfer(&self, peer_id: Uuid, transfer: AssetTransfer) -> Result<(), CoreError> {
        let peers = self.peers.read().await;
        if let Some(peer) = peers.get(&peer_id) {
            peer.queue_transfer(transfer).await?;
            Ok(())
        } else {
            Err(CoreError::NotFound("Peer not found".to_string()))
        }
    }

    pub async fn sync_all(&self) -> Result<(), CoreError> {
        let peers = self.peers.read().await;
        for (peer_id, peer) in peers.iter() {
            if let Err(e) = peer.sync_with_peer(*peer_id).await {
                log::error!("Failed to sync with peer {}: {}", peer_id, e);
            }
        }
        Ok(())
    }
}

pub struct PeerSync {
    peer_id: Uuid,
    security_context: Arc<SecurityContext>,
    transfer_queue: Arc<RwLock<Vec<AssetTransfer>>>,
}

impl PeerSync {
    pub fn new(peer_id: Uuid, security_context: Arc<SecurityContext>) -> Self {
        Self {
            peer_id,
            security_context,
            transfer_queue: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub async fn queue_transfer(&self, transfer: AssetTransfer) -> Result<(), CoreError> {
        // Validate transfer
        if !transfer.is_valid() {
            return Err(CoreError::ValidationError(
                "Invalid transfer for sync".to_string()
            ));
        }

        // Add to queue
        let mut queue = self.transfer_queue.write().await;
        queue.push(transfer);
        Ok(())
    }

    pub async fn process_queue(&self) -> Result<Vec<AssetTransfer>, CoreError> {
        let mut queue = self.transfer_queue.write().await;
        let transfers = queue.drain(..).collect();
        Ok(transfers)
    }

    pub async fn sync_with_peer(&self, peer_id: Uuid) -> Result<(), CoreError> {
        // Check if peer is authorized
        if !self.security_context.can_sync_with_peer(&peer_id) {
            return Err(CoreError::SecurityViolation(
                "Unauthorized peer sync attempt".to_string()
            ));
        }

        // Process queue
        let transfers = self.process_queue().await?;
        
        // In a real implementation, this would send the transfers to the peer
        // For now, just log the action
        log::info!("Syncing {} transfers with peer {}", transfers.len(), peer_id);
        
        Ok(())
    }
}

impl Default for SyncService {
    fn default() -> Self {
        Self::new()
    }
}
