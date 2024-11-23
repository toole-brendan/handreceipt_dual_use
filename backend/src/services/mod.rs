pub mod asset;
pub mod core;
pub mod infrastructure;
pub mod network;

// Re-export core modules
pub use self::{
    core::{
        CoreServiceImpl as CoreModule,
        verification::VerificationServiceImpl as VerificationModule,
        audit::AuditServiceImpl as AuditModule,
    },
    infrastructure::storage::DatabaseServiceImpl as DatabaseModule,
    network::{
        mesh::MeshServiceImpl as MeshModule,
        p2p::P2PServiceImpl as P2PModule,
        sync::service::SyncManagerImpl as SyncModule,
    },
};

// Re-export from security module
pub use crate::security::SecurityModule;
