use std::collections::VecDeque;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Serialize, Deserialize};
use crate::mesh::error::MeshError;
use super::handler::SyncOperation;
use crate::Result;
use crate::offline::storage::MobileSyncStatus;
use super::SyncPriority;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MobileSyncItem {
    pub id: String,
    pub operation: SyncOperation,
    pub priority: SyncPriority,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub retries: u32,
}

pub struct MobileSyncQueue {
    queue: Arc<RwLock<VecDeque<MobileSyncItem>>>,
    max_retries: u32,
    max_queue_size: usize,
}

impl MobileSyncQueue {
    pub fn new(max_retries: u32, max_queue_size: usize) -> Self {
        Self {
            queue: Arc::new(RwLock::new(VecDeque::new())),
            max_retries,
            max_queue_size,
        }
    }

    pub async fn enqueue(&self, item: MobileSyncItem) -> Result<(), MeshError> {
        let mut queue = self.queue.write().await;
        
        if queue.len() >= self.max_queue_size {
            return Err(MeshError::QueueProcessingFailed("Queue size limit reached".to_string()));
        }

        // Insert based on priority
        let insert_pos = queue.iter()
            .position(|x| x.priority <= item.priority)
            .unwrap_or(queue.len());
            
        queue.insert(insert_pos, item);
        Ok(())
    }

    pub async fn dequeue(&self) -> Option<MobileSyncItem> {
        self.queue.write().await.pop_front()
    }

    pub async fn requeue_failed(&self, mut item: MobileSyncItem) -> Result<(), MeshError> {
        if item.retries >= self.max_retries {
            return Err(MeshError::QueueProcessingFailed("Max retries exceeded".to_string()));
        }

        item.retries += 1;
        self.enqueue(item).await
    }

    pub async fn get_queue_status(&self) -> QueueStatus {
        let queue = self.queue.read().await;
        QueueStatus {
            total_items: queue.len(),
            high_priority: queue.iter().filter(|i| matches!(i.priority, SyncPriority::High)).count(),
            failed_items: queue.iter().filter(|i| i.retries > 0).count(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct QueueStatus {
    pub total_items: usize,
    pub high_priority: usize,
    pub failed_items: usize,
} 