// backend/src/services/network/mod.rs

pub mod mesh;
pub mod p2p;
pub mod sync;

use crate::types::{
    mesh::{
        PeerInfo, PeerCapability, AuthStatus, QueueItem,
        Message, DiscoveryMessage, AssetMessage, LocationMessage,
        TransferMessage, SyncMessage,
    },
    sync::{SyncStatus, SyncType, SyncPriority},
    error::{MeshError, NetworkError},
    security::SecurityContext,
};

pub use mesh::MeshService;
pub use sync::SyncService;
pub use p2p::protocol::ProtocolHandler;

// Re-export common types
pub use crate::types::sync::{
    Change,
    ChangeOperation,
    Resolution,
    BroadcastMessage,
};

// Type alias for network results
pub type Result<T> = std::result::Result<T, NetworkError>;
