// backend/src/services/network/mesh/sync/mod.rs

pub mod manager;   // Sync orchestration
pub mod resolver;  // Conflict resolution

pub use manager::{SyncManager, SyncType, SyncPriority, SyncStatus};
pub use resolver::{ConflictResolver, Resolution, Change, ChangeOperation};
