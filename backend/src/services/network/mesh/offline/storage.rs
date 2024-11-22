use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Duration, Utc};

use crate::types::{
    sync::{SyncStatus, SyncType, SyncPriority},
    mesh::OfflineData,
    error::MeshError,
};

pub struct OfflineStorage {
    data_store: Arc<RwLock<HashMap<String, OfflineData>>>,
    max_storage_size: usize,
}

impl OfflineStorage {
    pub fn new(max_storage_size: usize) -> Self {
        Self {
            data_store: Arc::new(RwLock::new(HashMap::new())),
            max_storage_size,
        }
    }

    pub async fn store(&self, data: OfflineData) -> Result<(), MeshError> {
        let mut store = self.data_store.write().await;
        
        // Check storage limits
        if store.len() >= self.max_storage_size {
            return Err(MeshError::SystemError("Storage limit reached".into()));
        }

        store.insert(data.id.to_string(), data);
        Ok(())
    }

    pub async fn get(&self, id: &str) -> Option<OfflineData> {
        self.data_store.read().await.get(id).cloned()
    }

    pub async fn get_pending_sync(&self) -> Vec<OfflineData> {
        self.data_store
            .read()
            .await
            .values()
            .filter(|data| data.attempts == 0)
            .cloned()
            .collect()
    }

    pub async fn update_sync_status(&self, id: &str, status: SyncStatus) -> Result<(), MeshError> {
        let mut store = self.data_store.write().await;
        
        if let Some(data) = store.get_mut(id) {
            // Update attempts count based on status
            match status {
                SyncStatus::Failed | SyncStatus::Cancelled => {
                    data.attempts += 1;
                }
                SyncStatus::Completed => {
                    // Remove successfully synced data
                    store.remove(id);
                    return Ok(());
                }
                _ => {}
            }
            Ok(())
        } else {
            Err(MeshError::DataNotFound(id.to_string()))
        }
    }

    pub async fn cleanup_old_data(&self, age_limit: Duration) -> Result<(), MeshError> {
        let mut store = self.data_store.write().await;
        let now = Utc::now();
        
        store.retain(|_, data| {
            now.signed_duration_since(data.created_at) < age_limit
        });
        
        Ok(())
    }

    pub async fn get_by_priority(&self, priority: SyncPriority) -> Vec<OfflineData> {
        self.data_store
            .read()
            .await
            .values()
            .filter(|data| data.sync_priority == priority)
            .cloned()
            .collect()
    }

    pub async fn get_failed_syncs(&self, min_attempts: u32) -> Vec<OfflineData> {
        self.data_store
            .read()
            .await
            .values()
            .filter(|data| data.attempts >= min_attempts)
            .cloned()
            .collect()
    }

    pub async fn clear_all(&self) -> Result<(), MeshError> {
        let mut store = self.data_store.write().await;
        store.clear();
        Ok(())
    }
}
