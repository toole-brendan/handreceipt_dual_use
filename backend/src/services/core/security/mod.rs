pub mod access_control;
pub mod audit;
pub mod encryption;
pub mod hsm;
pub mod key_management;
pub mod mfa;
pub mod validation;

// Use types from the new types module
use crate::types::{
    permissions::{Permission, ResourceType, Action},
    security::{SecurityContext, SecurityClassification, KeyType, AuditEvent},
    error::{SecurityError, CoreError},
};

// Re-export service traits and implementations
pub use self::access_control::AccessControl;
pub use self::encryption::EncryptionService;
pub use self::hsm::{HsmManager, HsmConfig};
pub use self::key_management::KeyRotationManager;
pub use self::mfa::MfaManager;

// Re-export error types from the new error module
pub use crate::types::error::{
    SecurityError as AccessControlError,
    SecurityError as AuditError,
    SecurityError as EncryptionError,
    SecurityError as HsmError,
    SecurityError as KeyError,
    SecurityError as MfaError,
};

// Re-export status types from the new types module
pub use crate::types::security::{
    AuditEvent as AuditEventType,
    KeyType as MfaTokenType,
};
