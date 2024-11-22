//! Services module providing core business logic and infrastructure components

pub mod core;
pub mod asset;
pub mod network;
pub mod infrastructure;

// Re-export commonly used types and services
pub use self::core::{
    audit::AuditManager,
    security::SecurityManager,
    verification::VerificationManager,
};

pub use self::asset::{
    scanning::{
        Scanner,
        ScanResult,
        ScanError,
        ScanType,
        BarcodeScanner,
        NFCCommunicator,
        QRGenerator,
        RFIDWriter,
    },
    location::LocationService,
};

pub use self::network::{
    mesh::MeshService,
    sync::SyncManager,
};

pub use self::infrastructure::{
    blockchain::BlockchainService,
    database::DatabaseService,
};

// Common error type for all services
#[derive(Debug, thiserror::Error)]
pub enum ServiceError {
    #[error("Scanning error: {0}")]
    Scanning(#[from] asset::scanning::ScanError),
    
    #[error("Location error: {0}")]
    Location(#[from] asset::location::LocationError),
    
    #[error("Network error: {0}")]
    Network(String),
    
    #[error("Database error: {0}")]
    Database(String),
    
    #[error("Security error: {0}")]
    Security(String),
}

pub type Result<T> = std::result::Result<T, ServiceError>; 