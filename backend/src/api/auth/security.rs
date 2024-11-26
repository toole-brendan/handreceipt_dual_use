use async_trait::async_trait;
use std::sync::Arc;

use crate::{
    error::CoreError,
    types::{
        security::{SecurityContext, SecurityClassification},
        app::{SecurityService, EncryptionService},
        permissions::{ResourceType, Action, Permission},
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
        // Convert string resource and action to enum types
        let permission = match (resource, action) {
            ("property", "read") => Permission::ViewProperty,
            ("property", "create") => Permission::CreateProperty,
            ("property", "update") => Permission::UpdateProperty,
            ("property", "delete") => Permission::DeleteProperty,
            ("transfer", "read") => Permission::ViewTransfer,
            ("transfer", "create") => Permission::CreateTransfer,
            ("transfer", "approve") => Permission::ApproveTransfer,
            ("audit", "read") => Permission::ViewAuditLog,
            ("qr", "generate") => Permission::GenerateQRCode,
            ("analytics", "read") => Permission::ViewAnalytics,
            _ => return Ok(false),
        };

        Ok(context.has_permission(&permission))
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