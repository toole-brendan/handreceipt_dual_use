use backend::mesh::error::MeshError;

pub mod scanner;
pub mod sync;
pub mod offline;
pub mod service;

// Re-exports for convenience
pub use scanner::{qr::QRScanner, rfid::RFIDScanner};
pub use sync::{handler::SyncHandler, queue::MobileSyncQueue};
pub use offline::storage::MobileStorage;
pub use service::MobileService;

// Common types used across mobile modules
pub type Result<T> = std::result::Result<T, MeshError>;