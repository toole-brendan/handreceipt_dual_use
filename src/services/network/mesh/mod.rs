pub mod discovery;
pub mod sync;
pub mod offline;
pub mod error;
pub mod service;

// Re-export commonly used types
pub use discovery::{PeerScanner, PeerAuthenticator};
pub use sync::{SyncManager, SyncStatus};
pub use offline::{OfflineStorage, SyncQueue};
pub use error::MeshError;
pub use service::MeshService; 