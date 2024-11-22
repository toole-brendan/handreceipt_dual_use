use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Duration, Utc};

use crate::types::{
    sync::{SyncStatus, SyncType, SyncPriority, OfflineData},
    error::MeshError,
};

#[derive(Debug)]
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
}

#[async_trait::async_trait]
impl crate::services::network::mesh::sync::manager::OfflineStorage for OfflineStorage {
    async fn store(&self, data: OfflineData) -> Result<(), MeshError> {
        let mut store = self.data_store.write().await;
        
        if store.len() >= self.max_storage_size {
            return Err(MeshError::SystemError("Storage limit reached".into()));
        }

        store.insert(data.id.to_string(), data);
        Ok(())
    }

    async fn get(&self, id: &str) -> Option<OfflineData> {
        self.data_store.read().await.get(id).cloned()
    }

    async fn update_sync_status(&self, id: &str, status: SyncStatus) -> Result<(), MeshError> {
        let mut store = self.data_store.write().await;
        
        match store.get_mut(id) {
            Some(data) => {
                match status {
                    SyncStatus::Completed => {
                        // Remove completed items
                        store.remove(id);
                    }
                    SyncStatus::Failed => {
                        // Increment attempts for failed items
                        data.attempts += 1;
                    }
                    _ => {}
                }
                Ok(())
            }
            None => Err(MeshError::DataNotFound(id.to_string()))
        }
    }
}

// Add helper methods for the concrete implementation
impl OfflineStorage {
    pub async fn get_pending_items(&self) -> Vec<OfflineData> {
        self.data_store.read().await
            .values()
            .filter(|data| data.attempts == 0)
            .cloned()
            .collect()
    }

    pub async fn get_failed_items(&self, min_attempts: u32) -> Vec<OfflineData> {
        self.data_store.read().await
            .values()
            .filter(|data| data.attempts >= min_attempts)
            .cloned()
            .collect()
    }

    pub async fn cleanup_old_data(&self, max_age: Duration) -> Result<(), MeshError> {
        let mut store = self.data_store.write().await;
        let now = Utc::now();
        
        store.retain(|_, data| {
            now.signed_duration_since(data.created_at) < max_age
        });
        
        Ok(())
    }
}

impl std::fmt::Debug for dyn crate::services::network::mesh::sync::manager::OfflineStorage {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "OfflineStorage")
    }
}
