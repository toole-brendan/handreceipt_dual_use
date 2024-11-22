pub mod storage;

// Re-exports
pub use storage::{MobileStorage, MobileData, MobileSyncStatus};

// Common offline types
#[derive(Debug, Clone)]
pub enum StorageType {
    Persistent,
    Temporary,
    Encrypted,
}

#[derive(Debug, Clone)]
pub struct StorageConfig {
    pub storage_type: StorageType,
    pub max_size: usize,
    pub encryption_enabled: bool,
}
