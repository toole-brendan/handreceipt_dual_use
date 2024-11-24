pub mod app;
pub mod asset;
pub mod audit;
pub mod blockchain;
pub mod permissions;
pub mod property;
pub mod scanning;
pub mod security;
pub mod signature;
pub mod user;
pub mod validation;
pub mod verification;

// Re-export commonly used types
pub use self::{
    app::{AppConfig, AppState, PropertyService, TransferService, SecurityService},
    property::{Property, PropertyMetadata, PropertyType},
    audit::{AuditEvent, AuditContext},
    blockchain::{BlockchainTransaction as Transaction, Block},
    permissions::{Permission, ResourceType, Action},
    scanning::{QRScanResult as ScanResult, QRScanError as ScanError},
    security::{SecurityContext, SecurityClassification, Role},
    validation::ValidationResult,
    user::{Rank, Unit},
};
