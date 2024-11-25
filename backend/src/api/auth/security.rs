use async_trait::async_trait;
use std::sync::Arc;

use crate::{
    error::CoreError,
    types::{
        security::{SecurityContext, SecurityClassification},
        app::{SecurityService, EncryptionService},
        permissions::{ResourceType, Action},
    },
    api::auth::{
        encryption::EncryptionServiceImpl,
        audit::AuditServiceImpl,
    },
};

pub struct SecurityServiceImpl {
    encryption: Arc<EncryptionServiceImpl>,
    audit: Arc<AuditServiceImpl>,
}

impl SecurityServiceImpl {
    pub fn new(encryption: Arc<EncryptionServiceImpl>, audit: Arc<AuditServiceImpl>) -> Self {
        Self { encryption, audit }
    }
}

#[async_trait]
impl SecurityService for SecurityServiceImpl {
    async fn validate_context(&self, context: &SecurityContext) -> Result<bool, CoreError> {
        // Basic validation - ensure required fields are present
        if context.unit_code.is_empty() {
            return Ok(false);
        }

        // Validate classification level
        match context.classification {
            SecurityClassification::Unclassified | SecurityClassification::Sensitive => (),
            _ => return Ok(false), // Only allow Unclassified and Sensitive for now
        }

        // Validate roles
        if context.roles.is_empty() {
            return Ok(false);
        }

        Ok(true)
    }

    async fn check_permissions(&self, context: &SecurityContext, resource: &str, action: &str) -> Result<bool, CoreError> {
        // Basic permission check - match on strings instead of trying conversions
        let resource_type = match resource {
            "property" => ResourceType::Property,
            "transfer" => ResourceType::Transfer,
            "user" => ResourceType::User,
            _ => return Ok(false),
        };
        
        let action_type = match action {
            "read" => Action::Read,
            "create" => Action::Create,
            "update" => Action::Update,
            "delete" => Action::Delete,
            "approve" => Action::ApproveCommand,
            _ => return Ok(false),
        };

        Ok(context.has_permission(resource_type, action_type))
    }

    async fn encrypt_data(&self, data: &[u8]) -> Result<Vec<u8>, CoreError> {
        self.encryption.encrypt(data).await
    }

    async fn decrypt_data(&self, data: &[u8]) -> Result<Vec<u8>, CoreError> {
        self.encryption.decrypt(data).await
    }

    async fn initialize(&self) -> Result<(), CoreError> {
        Ok(())
    }

    async fn shutdown(&self) -> Result<(), CoreError> {
        Ok(())
    }

    async fn health_check(&self) -> Result<bool, CoreError> {
        Ok(true)
    }
} 