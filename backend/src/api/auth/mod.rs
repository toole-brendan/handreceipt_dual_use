//! Security module providing core security features for the property management system.
//! 
//! This module includes:
//! - Role-based access control
//! - Audit trail with Merkle tree verification
//! - Encryption for sensitive data
//! - Digital signatures for transfer verification

pub mod access_control;
pub mod audit;
pub mod encryption;
pub mod merkle;
pub mod security;

pub use access_control::AccessControlImpl;
pub use audit::AuditServiceImpl;
pub use encryption::EncryptionServiceImpl;
pub use security::SecurityServiceImpl;
