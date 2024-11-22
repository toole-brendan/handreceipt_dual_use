use std::sync::Arc;
use tokio::sync::RwLock;
use crate::mesh::error::MeshError;
use crate::Result;
use crate::scanner::{QRScanner, RFIDScanner};
use crate::sync::{SyncHandler, MobileSyncQueue};
use crate::offline::storage::MobileStorage;

pub struct MobileService {
    qr_scanner: Arc<QRScanner>,
    rfid_scanner: Arc<RFIDScanner>,
    storage: Arc<MobileStorage>,
    sync_queue: Arc<MobileSyncQueue>,
    sync_handler: Arc<SyncHandler>,
}

impl MobileService {
    pub fn new(
        max_storage_size: usize,
        max_queue_size: usize,
        rfid_config: RFIDReaderConfig,
    ) -> Self {
        let storage = Arc::new(MobileStorage::new(max_storage_size));
        let sync_queue = Arc::new(MobileSyncQueue::new(3, max_queue_size));
        let sync_handler = Arc::new(SyncHandler::new(storage.clone(), sync_queue.clone()));
        
        let qr_scanner = Arc::new(QRScanner::new(storage.clone()));
        let rfid_scanner = Arc::new(RFIDScanner::new(storage.clone(), rfid_config));

        Self {
            qr_scanner,
            rfid_scanner,
            storage,
            sync_queue,
            sync_handler,
        }
    }

    pub async fn start(&self) -> Result<(), MeshError> {
        // Start sync handler
        self.sync_handler.start_sync_processor().await?;

        // Start scanners
        self.qr_scanner.start_scanning().await?;
        self.rfid_scanner.start_scanning().await?;

        Ok(())
    }

    pub async fn get_scan_status(&self) -> ScanStatus {
        ScanStatus {
            qr_active: true, // Implement actual status checking
            rfid_active: true,
            pending_syncs: self.sync_queue.get_queue_status().await.total_items,
        }
    }
}

#[derive(Debug, Clone)]
pub struct ScanStatus {
    pub qr_active: bool,
    pub rfid_active: bool,
    pub pending_syncs: usize,
} 