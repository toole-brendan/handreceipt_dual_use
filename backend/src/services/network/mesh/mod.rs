// backend/src/services/network/mesh/mod.rs

pub mod discovery;
pub mod sync;
pub mod offline;
pub mod error;
pub mod service;

// Re-export commonly used types
pub use discovery::{
    peer_scanner::PeerScanner,
    authenticator::{PeerAuthenticator, AuthStatus},
};

pub use sync::{
    manager::{SyncManager, SyncType, SyncPriority, SyncStatus},
    resolver::{ConflictResolver, Resolution, Change, ChangeOperation},
};

pub use offline::{
    storage::{OfflineStorage, OfflineData, SyncStatus as StorageSyncStatus},
    queue::{SyncQueue, QueueItem},
};

pub use service::MeshService;
pub use error::MeshError;

// Export common types used across mesh modules
pub use crate::services::core::security::encryption::KeyManagement;
