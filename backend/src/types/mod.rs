// Re-export all type modules
pub mod app;
pub mod asset;
pub mod audit;
pub mod blockchain;
pub mod error;
pub mod mesh;
pub mod permissions;
pub mod scanning;
pub mod security;
pub mod signature;
pub mod sync;
pub mod verification;

// Re-export commonly used types
pub use app::{
    AppState, AppConfig, ServerConfig, DatabaseConfig, SecurityConfig,
    MeshConfig, BlockchainConfig, ServiceResult,
};

pub use asset::{
    Asset, AssetStatus, LocationData, LocationMetadata, PointWrapper,
};

pub use audit::{
    AuditEvent, AuditStatus, AuditEventType, AuditSeverity,
};

pub use blockchain::{
    Block, Transaction, BlockchainTransaction, BlockchainNode, NodeStatus,
};

pub use error::{
    CoreError, NetworkError, SecurityError, AssetError, DatabaseError, MeshError,
};

pub use mesh::{
    PeerInfo, PeerCapability, AuthStatus, QueueItem,
    SyncPriority, OfflineData,
};

pub use permissions::{
    Action, Permission, ResourceType, Constraint,
};

pub use scanning::{
    ScanResult, ScanType, GeoPoint, ScanError, Scanner, ScanVerifier,
};

pub use security::{
    SecurityClassification, SecurityContext, KeyType,
};

pub use signature::{
    SignatureType, CommandSignature, SignatureChain,
};

pub use sync::{
    SyncStatus, SyncType, SyncRequest, Change, ChangeOperation,
    Resolution, ResolutionType, OfflineData as SyncOfflineData,
};

pub use verification::{
    VerificationStatus, ValidationStatus, SignatureContext, SignatureStatus,
};

// Type aliases
pub type Result<T> = std::result::Result<T, CoreError>;
pub type BoxError = Box<dyn std::error::Error + Send + Sync>;
pub type BoxFuture<T> = std::pin::Pin<Box<dyn std::future::Future<Output = T> + Send>>;

// Re-export common traits
pub use app::{
    SecurityService,
    BlockchainService,
    SyncManager,
    AssetVerification,
    AuditLogger,
};
