// backend/src/services/network/sync/mod.rs

pub mod service;
pub mod manager;

pub use service::SyncService;
pub use manager::SyncManager;

use crate::types::{
    sync::{
        SyncType, SyncStatus, SyncPriority, SyncMetrics,
        SyncMetadata, SyncHandler, SyncError,
    },
    error::MeshError,
    security::SecurityContext,
};

// Re-export commonly used types
pub use crate::types::sync::{
    Change,
    ChangeOperation,
    Resolution,
    BroadcastMessage,
    OfflineData,
};
