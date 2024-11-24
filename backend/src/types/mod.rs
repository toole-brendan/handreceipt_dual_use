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
pub use {
    app::{AppConfig, AppState},
    asset::{Asset, AssetMetadata, AssetType},
    audit::{AuditEvent, AuditContext},
    security::{SecurityContext, SecurityClassification},
    signature::{SignatureMetadata, SignatureType, SignatureAlgorithm},
    validation::{ValidationContext, ValidationResult},
};

// Common type aliases
pub type Result<T> = std::result::Result<T, crate::error::CoreError>;
