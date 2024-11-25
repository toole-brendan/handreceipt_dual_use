use std::sync::Arc;
use tokio::time::{Duration, interval};
use serde::{Serialize, Deserialize};

use crate::{
    Result,
    error::Error,
    offline::{Storage, SyncStatus, StoredTransfer},
};

#[derive(Debug, Serialize, Deserialize)]
struct TransferRequest {
    property_id: String,
    scan_data: String,
    timestamp: String,
}

pub struct SyncManager {
    storage: Arc<Storage>,
    sync_interval: Duration,
}

impl SyncManager {
    pub fn new(storage: Arc<Storage>) -> Self {
        Self {
            storage,
            sync_interval: Duration::from_secs(30),
        }
    }

    pub async fn start(&self) -> Result<()> {
        let storage = self.storage.clone();
        let interval = self.sync_interval;

        tokio::spawn(async move {
            let mut timer = interval(interval);
            loop {
                timer.tick().await;
                if let Err(e) = Self::sync_pending_transfers(&storage).await {
                    eprintln!("Sync error: {}", e);
                }
            }
        });

        Ok(())
    }

    async fn sync_pending_transfers(storage: &Storage) -> Result<()> {
        let transfers = storage.get_pending_transfers().await?;
        for transfer in transfers {
            if let Err(e) = Self::sync_transfer(storage, &transfer).await {
                eprintln!("Failed to sync transfer {}: {}", transfer.id, e);
                storage.update_transfer_status(transfer.id, SyncStatus::Failed).await?;
            }
        }
        Ok(())
    }

    async fn sync_transfer(storage: &Storage, transfer: &StoredTransfer) -> Result<()> {
        // Mark as in progress
        storage.update_transfer_status(transfer.id, SyncStatus::InProgress).await?;

        // Prepare request
        let request = TransferRequest {
            property_id: transfer.property_id.to_string(),
            scan_data: serde_json::to_string(&transfer.scan_data)?,
            timestamp: transfer.timestamp.to_rfc3339(),
        };

        // Send to server (mock implementation)
        if Self::send_to_server(&request).await? {
            storage.update_transfer_status(transfer.id, SyncStatus::Completed).await?;
        } else {
            storage.update_transfer_status(transfer.id, SyncStatus::Failed).await?;
        }

        Ok(())
    }

    async fn send_to_server(_request: &TransferRequest) -> Result<bool> {
        // Mock implementation - in production this would make an HTTP request
        Ok(true)
    }
} 