// backend/src/blockchain/network/core/mod.rs

pub mod p2p;
pub mod sync;
pub mod sync_manager;

pub use p2p::{P2PNetwork, BlockchainBehaviour, NetworkMessage};
pub use sync::PropertySync;
pub use sync_manager::{SyncManager, SyncError, SyncStatus};
