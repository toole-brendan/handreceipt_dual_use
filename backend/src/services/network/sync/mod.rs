// backend/src/services/network/sync/mod.rs

pub mod service;
pub mod manager;

pub use service::SyncService;
pub use manager::{SyncManager, SyncStatus, SyncType};

// Common sync types
#[derive(Debug, Clone)]
pub enum SyncError {
    ConnectionFailed(String),
    AuthenticationFailed(String),
    ValidationFailed(String),
    TransferFailed(String),
    Timeout(String),
}

#[derive(Debug, Clone)]
pub struct SyncMetrics {
    pub total_transfers: usize,
    pub successful_transfers: usize,
    pub failed_transfers: usize,
    pub last_sync: Option<chrono::DateTime<chrono::Utc>>,
    pub average_sync_time: std::time::Duration,
}
