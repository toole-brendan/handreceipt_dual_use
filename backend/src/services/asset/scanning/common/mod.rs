pub mod signature;
pub mod verification;

pub use self::signature::SignatureVerifier;
pub use self::verification::VerificationService;

// Re-export types from the centralized types module
pub use crate::types::scanning::{
    Scanner,
    ScanResult,
    ScanError,
    ScanType,
    ScanVerifier,
    GeoPoint,
};
