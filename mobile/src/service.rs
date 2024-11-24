use std::sync::Arc;
use serde::{Serialize, Deserialize};
use chrono::Utc;

use crate::{
    Result,
    scanner::QRScanner,
    sync::{SyncHandler, MobileSyncQueue},
    offline::storage::MobileStorage,
    error::MobileError,
};

/// Mobile service configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MobileServiceConfig {
    pub max_queue_size: usize,
    pub sync_interval: u64,  // In seconds
    pub storage_path: String,
}

/// Mobile service status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceStatus {
    pub scanner_active: bool,
    pub pending_syncs: usize,
    pub last_sync: Option<chrono::DateTime<Utc>>,
}

/// Main mobile service handling scanning and sync
pub struct MobileService {
    qr_scanner: Arc<QRScanner>,
    sync_handler: Arc<SyncHandler>,
    sync_queue: Arc<MobileSyncQueue>,
    storage: Arc<MobileStorage>,
}

impl MobileService {
    pub async fn new(
        storage: Arc<MobileStorage>,
        max_queue_size: usize,
        verification_key: ed25519_dalek::VerifyingKey,
    ) -> Self {
        let qr_scanner = Arc::new(QRScanner::new(storage.clone(), verification_key));
        let sync_queue = Arc::new(MobileSyncQueue::new(max_queue_size));
        let sync_handler = Arc::new(SyncHandler::new(
            storage.clone(),
            sync_queue.clone(),
        ));

        Self {
            qr_scanner,
            sync_handler,
            sync_queue,
            storage,
        }
    }

    /// Starts the mobile service
    pub async fn start(&self) -> Result<()> {
        // Start QR scanner
        self.qr_scanner.start().await?;
        
        // Start sync handler
        self.sync_handler.start().await?;
        
        Ok(())
    }

    /// Stops the mobile service
    pub async fn stop(&self) -> Result<()> {
        // Stop QR scanner
        self.qr_scanner.stop().await?;
        
        // Stop sync handler
        self.sync_handler.stop().await?;
        
        Ok(())
    }

    /// Gets current service status
    pub async fn get_status(&self) -> Result<ServiceStatus> {
        Ok(ServiceStatus {
            scanner_active: true, // Implement actual status checking
            pending_syncs: self.sync_queue.get_queue_status().await.total_items,
            last_sync: self.sync_handler.last_sync_time().await,
        })
    }

    /// Forces immediate sync
    pub async fn force_sync(&self) -> Result<()> {
        self.sync_handler.sync_now().await
    }

    /// Clears local storage
    pub async fn clear_storage(&self) -> Result<()> {
        self.storage.clear().await.map_err(|e| {
            MobileError::StorageError(format!("Failed to clear storage: {}", e))
        })
    }

    /// Gets scanner instance
    pub fn scanner(&self) -> Arc<QRScanner> {
        self.qr_scanner.clone()
    }

    /// Gets sync queue instance
    pub fn sync_queue(&self) -> Arc<MobileSyncQueue> {
        self.sync_queue.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    use ed25519_dalek::SigningKey;

    async fn create_test_service() -> (MobileService, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        let storage = Arc::new(MobileStorage::new(temp_dir.path()).await.unwrap());
        
        let verification_key = SigningKey::generate(&mut rand::thread_rng())
            .verifying_key();
        
        let service = MobileService::new(
            storage,
            100,
            verification_key,
        ).await;
        
        (service, temp_dir)
    }

    #[tokio::test]
    async fn test_service_lifecycle() {
        let (service, _temp_dir) = create_test_service().await;
        
        // Test start
        assert!(service.start().await.is_ok());
        
        // Test status
        let status = service.get_status().await.unwrap();
        assert!(status.scanner_active);
        assert_eq!(status.pending_syncs, 0);
        
        // Test stop
        assert!(service.stop().await.is_ok());
    }

    #[tokio::test]
    async fn test_storage_operations() {
        let (service, _temp_dir) = create_test_service().await;
        
        // Test clear storage
        assert!(service.clear_storage().await.is_ok());
        
        // Test force sync
        assert!(service.force_sync().await.is_ok());
    }
}
