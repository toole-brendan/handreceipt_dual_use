pub mod audit;
pub mod security;
pub mod verification;

// Re-export types from the types module
use crate::types::{
    security::{SecurityContext, SecurityClassification},
    permissions::{Action, Permission, ResourceType},
    error::{CoreError, SecurityError},
    audit::{AuditEvent, AuditStatus},
    verification::{VerificationStatus, ValidationStatus},
};

// Re-export service traits from types module
pub use crate::types::app::{
    SecurityService,
    BlockchainService,
    AssetVerification,
    AuditLogger,
};

// Re-export service implementations
pub use self::security::{
    access_control::AccessControl,
    encryption::EncryptionService,
    key_management::KeyRotationManager,
    mfa::MfaManager,
    hsm::HsmManager,
};

pub use self::verification::VerificationManager;
pub use self::audit::AuditManager;

// Import DatabaseService from infrastructure
use crate::services::infrastructure::database::DatabaseService;

// Type alias for service results
pub type Result<T> = std::result::Result<T, CoreError>;

/// Core service module that provides high-level security, verification,
/// and audit functionality.
pub struct CoreModule {
    security: SecurityService,
    verification: VerificationManager,
    audit: AuditManager,
    db: DatabaseService,
}

impl CoreModule {
    pub fn new(
        security: SecurityService,
        verification: VerificationManager,
        audit: AuditManager,
        db: DatabaseService,
    ) -> Self {
        Self {
            security,
            verification,
            audit,
            db,
        }
    }

    pub async fn verify_access(
        &self,
        context: &SecurityContext,
        resource: ResourceType,
        action: Action,
    ) -> Result<bool> {
        // Check basic permission
        if !context.has_permission(&resource, &action) {
            return Ok(false);
        }

        // Log access check
        self.audit.log_event(
            AuditEvent::new(
                "access_check".to_string(),
                "verify".to_string(),
                AuditStatus::Success,
                serde_json::json!({
                    "resource": resource,
                    "action": action,
                    "user_id": context.user_id,
                }),
            )
        ).await?;

        Ok(true)
    }

    pub async fn verify_classification(
        &self,
        context: &SecurityContext,
        required: &SecurityClassification,
    ) -> Result<bool> {
        let has_access = context.can_access_classification(&required.to_string());

        // Log classification check
        self.audit.log_event(
            AuditEvent::new(
                "classification_check".to_string(),
                "verify".to_string(),
                if has_access { AuditStatus::Success } else { AuditStatus::Failure },
                serde_json::json!({
                    "required": required,
                    "user_classification": context.classification,
                    "user_id": context.user_id,
                }),
            )
        ).await?;

        Ok(has_access)
    }

    pub fn security(&self) -> &SecurityService {
        &self.security
    }

    pub fn verification(&self) -> &VerificationManager {
        &self.verification
    }

    pub fn audit(&self) -> &AuditManager {
        &self.audit
    }
}
