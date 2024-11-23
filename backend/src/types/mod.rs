pub mod app;
pub mod asset;
pub mod audit;
pub mod blockchain;
pub mod permissions;
pub mod scanning;
pub mod security;
pub mod signature;
pub mod validation;
pub mod verification;

// Re-export commonly used types
pub use self::{
    app::{AppConfig, AppState, Environment},
    asset::{Asset, AssetMetadata, AssetType},
    audit::{
        AuditEvent, AuditEventType, AuditContext, AuditSeverity,
        AuditStatus,
    },
    blockchain::{
        Block, Transaction, TransactionType, TransactionStatus,
        ChainState, ChainStatus, BlockchainEvent,
    },
    permissions::{Permission, Role, AccessLevel},
    scanning::{Scanner, ScanError, ScanVerifier, GeoPoint},
    security::{
        SecurityContext, SecurityClassification, SecurityZone,
        SecurityLevel, SecurityModule,
    },
    signature::{
        SignatureMetadata, SignatureType, SignatureAlgorithm,
        Signature, SignatureChain,
    },
    validation::{ValidationContext, ValidationResult},
    verification::{VerificationContext, VerificationResult},
};

// Common type aliases
pub type Result<T> = std::result::Result<T, crate::error::CoreError>;
pub type JsonValue = serde_json::Value;
pub type DateTime = chrono::DateTime<chrono::Utc>;
pub type HashMap<K, V> = std::collections::HashMap<K, V>;
pub type HashSet<T> = std::collections::HashSet<T>;
pub type Uuid = uuid::Uuid;
