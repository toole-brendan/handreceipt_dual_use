pub mod core;
pub mod asset;
pub mod network;
pub mod infrastructure;

// Re-export core service traits from types module
pub use crate::types::app::{
    SecurityService,
    BlockchainService,
    AssetVerification,
    AuditLogger,
    SyncManager,
};

// Re-export core types
pub use crate::types::{
    // Security types
    security::{
        SecurityContext,
        SecurityClassification,
        KeyType,
        AuditEvent,
    },
    
    // Permission types
    permissions::{
        Action,
        Permission,
        ResourceType,
        Constraint,
    },

    // Verification types
    verification::{
        VerificationStatus,
        ValidationStatus,
        SignatureContext,
        SignatureStatus,
    },

    // Asset types
    asset::{
        Asset,
        AssetStatus,
        LocationData,
        LocationMetadata,
    },

    // Network types
    mesh::{
        PeerInfo,
        PeerCapability,
        AuthStatus,
        QueueItem,
        OfflineData,
    },

    sync::{
        SyncStatus,
        SyncType,
        SyncRequest,
        SyncPriority,
        Change,
        ChangeOperation,
        Resolution,
        ResolutionType,
    },

    // Error types
    error::{
        CoreError,
        NetworkError,
        SecurityError,
        AssetError,
        DatabaseError,
        MeshError,
    },
};

// Re-export service implementations
pub use self::core::{
    CoreModule,
    security::AccessControl,
    verification::VerificationManager,
    audit::AuditManager,
};

pub use self::network::{
    mesh::MeshService,
    sync::SyncService,
};

pub use self::infrastructure::{
    InfrastructureModule,
    database::DatabaseService,
    blockchain::BlockchainService,
};

pub use self::asset::{
    AssetService,
    scanning::ScanningService,
    location::LocationService,
    transfer::TransferService,
};

// Type alias for service results
pub type Result<T> = std::result::Result<T, CoreError>;
