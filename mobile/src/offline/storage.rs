use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Serialize, Deserialize};
use crate::mesh::error::MeshError;
use crate::Result;
use crate::sync::SyncPriority;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MobileData {
    pub id: String,
    pub data_type: String,
    pub content: serde_json::Value,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub sync_status: MobileSyncStatus,
    pub priority: SyncPriority,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MobileSyncStatus {
    Pending,
    Queued,
    Syncing,
    Synced,
    Failed { reason: String },
}

pub struct MobileStorage {
    data_store: Arc<RwLock<HashMap<String, MobileData>>>,
    max_storage_size: usize,
}

impl MobileStorage {
    pub fn new(max_storage_size: usize) -> Self {
        Self {
            data_store: Arc::new(RwLock::new(HashMap::new())),
            max_storage_size,
        }
    }

    pub async fn store(&self, data: MobileData) -> Result<(), MeshError> {
        let mut store = self.data_store.write().await;
        
        if store.len() >= self.max_storage_size {
            return Err(MeshError::StorageLimitReached);
        }

        store.insert(data.id.clone(), data);
        Ok(())
    }

    pub async fn get(&self, id: &str) -> Option<MobileData> {
        self.data_store.read().await.get(id).cloned()
    }

    pub async fn get_pending_sync(&self) -> Vec<MobileData> {
        self.data_store
            .read()
            .await
            .values()
            .filter(|data| matches!(data.sync_status, MobileSyncStatus::Pending))
            .cloned()
            .collect()
    }

    pub async fn update_sync_status(&self, id: &str, status: MobileSyncStatus) -> Result<(), MeshError> {
        let mut store = self.data_store.write().await;
        
        if let Some(data) = store.get_mut(id) {
            data.sync_status = status;
            Ok(())
        } else {
            Err(MeshError::DataNotFound(id.to_string()))
        }
    }

    pub async fn cleanup_old_data(&self, age_limit: chrono::Duration) -> Result<(), MeshError> {
        let mut store = self.data_store.write().await;
        let now = chrono::Utc::now();
        
        store.retain(|_, data| {
            now.signed_duration_since(data.timestamp) < age_limit
        });
        
        Ok(())
    }
} 