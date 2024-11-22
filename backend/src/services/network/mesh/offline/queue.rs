use std::collections::VecDeque;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::types::{
    mesh::QueueItem,
    sync::{SyncType, SyncPriority},
    error::MeshError,
};

pub struct SyncQueue {
    queue: Arc<RwLock<VecDeque<QueueItem>>>,
    max_retries: u32,
    max_queue_size: usize,
}

#[derive(Debug, Clone)]
pub struct QueueStatus {
    pub total_items: usize,
    pub high_priority: usize,
    pub critical_priority: usize,
    pub failed_items: usize,
}

impl SyncQueue {
    pub fn new(max_retries: u32, max_queue_size: usize) -> Self {
        Self {
            queue: Arc::new(RwLock::new(VecDeque::new())),
            max_retries,
            max_queue_size,
        }
    }

    pub async fn enqueue(&self, item: QueueItem) -> Result<(), MeshError> {
        let mut queue = self.queue.write().await;
        
        if queue.len() >= self.max_queue_size {
            return Err(MeshError::SystemError("Queue size limit reached".into()));
        }

        // Insert based on priority
        let insert_pos = queue.iter()
            .position(|x| x.priority <= item.priority)
            .unwrap_or(queue.len());
            
        queue.insert(insert_pos, item);
        Ok(())
    }

    pub async fn dequeue(&self) -> Option<QueueItem> {
        self.queue.write().await.pop_front()
    }

    pub async fn peek(&self) -> Option<QueueItem> {
        self.queue.read().await.front().cloned()
    }

    pub async fn requeue_failed(&self, mut item: QueueItem) -> Result<(), MeshError> {
        if item.attempts >= self.max_retries {
            return Err(MeshError::SyncError("Max retries exceeded".into()));
        }

        item.attempts += 1;
        self.enqueue(item).await
    }

    pub async fn remove(&self, id: &str) -> Option<QueueItem> {
        let mut queue = self.queue.write().await;
        if let Some(pos) = queue.iter().position(|x| x.id == id) {
            queue.remove(pos)
        } else {
            None
        }
    }

    pub async fn get_queue_status(&self) -> QueueStatus {
        let queue = self.queue.read().await;
        QueueStatus {
            total_items: queue.len(),
            high_priority: queue.iter()
                .filter(|i| matches!(i.priority, SyncPriority::High))
                .count(),
            critical_priority: queue.iter()
                .filter(|i| matches!(i.priority, SyncPriority::Critical))
                .count(),
            failed_items: queue.iter()
                .filter(|i| i.attempts > 0)
                .count(),
        }
    }

    pub async fn clear(&self) -> Result<(), MeshError> {
        self.queue.write().await.clear();
        Ok(())
    }

    pub async fn get_failed_items(&self) -> Vec<QueueItem> {
        self.queue.read().await
            .iter()
            .filter(|i| i.attempts > 0)
            .cloned()
            .collect()
    }

    pub async fn get_by_priority(&self, priority: SyncPriority) -> Vec<QueueItem> {
        self.queue.read().await
            .iter()
            .filter(|i| i.priority == priority)
            .cloned()
            .collect()
    }
}
