pub mod asset;
pub mod core;
pub mod infrastructure;
pub mod network;
pub mod security;

use crate::types::{
    app::{
        CoreService, DatabaseService, SecurityService,
        AssetVerification, AuditLogger, MeshService,
        P2PService, SyncManager
    },
    error::CoreError,
};

pub use self::{
    core::CoreServiceImpl,
    infrastructure::InfrastructureService,
    security::SecurityModuleImpl,
    core::verification::VerificationManagerImpl,
    core::audit::AuditManagerImpl,
    network::mesh::MeshServiceImpl,
    network::p2p::P2PServiceImpl,
    network::sync::service::SyncManagerImpl,
};

// Re-export service traits
pub trait ServiceInit {
    fn initialize(&self) -> Result<(), CoreError>;
    fn shutdown(&self) -> Result<(), CoreError>;
}

#[async_trait::async_trait]
pub trait ServiceLifecycle {
    async fn start(&self) -> Result<(), CoreError>;
    async fn stop(&self) -> Result<(), CoreError>;
}

// Re-export service implementations
pub use self::core::CoreServiceImpl as CoreModule;
pub use self::security::SecurityModuleImpl as SecurityModule;
pub use self::infrastructure::InfrastructureService as DatabaseModule;
pub use self::network::mesh::MeshServiceImpl as MeshModule;
pub use self::network::p2p::P2PServiceImpl as P2PModule;
pub use self::network::sync::service::SyncManagerImpl as SyncModule;
