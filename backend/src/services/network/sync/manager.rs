use crate::types::{
    security::SecurityContext,
    error::MeshError,
    sync::{SyncStatus, SyncState},
};
use chrono::{DateTime, Utc};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

impl SyncManager {
    pub fn new(security_context: Arc<SecurityContext>) -> Self {
        Self {
            security_context,
            sync_state: Arc::new(RwLock::new(SyncState {
                last_sync: Utc::now(),
                pending_transfers: Vec::new(),
                status: SyncStatus::Pending,
            })),
        }
    }

    pub async fn schedule_sync(&self, target: String, context: &SecurityContext) -> Result<Uuid, MeshError> {
        let sync_id = Uuid::new_v4();
        let mut state = self.sync_state.write().await;
        state.pending_transfers.push(sync_id);
        Ok(sync_id)
    }

    pub async fn get_sync_status(&self) -> Result<SyncStatus, MeshError> {
        let state = self.sync_state.read().await;
        Ok(state.status.clone())
    }
} 