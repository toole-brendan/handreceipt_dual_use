pub mod handler;
pub mod queue;

// Re-exports
pub use handler::SyncHandler;
pub use queue::{MobileSyncQueue, MobileSyncItem};

// Common sync types
#[derive(Debug, Clone)]
pub enum SyncStatus {
    Pending,
    InProgress,
    Completed,
    Failed(String),
}

#[derive(Debug, Clone)]
pub enum SyncPriority {
    Low,
    Normal,
    High,
    Critical,
}
