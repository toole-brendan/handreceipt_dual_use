use std::sync::Arc;

use crate::types::{
    app::AppState,
    security::{SecurityContext, SecurityClassification},
    permissions::{Action, Permission, ResourceType},
    error::CoreError,
    audit::AuditEvent,
    asset::Asset,
    blockchain::{Block, Transaction},
    sync::SyncManager,
    verification::VerificationStatus,
};

// Re-export core traits
pub use crate::types::app::{
    SecurityService,
    BlockchainService,
    AssetVerification,
    AuditLogger,
};

/// Core application state and services
#[derive(Clone)]
pub struct Core {
    pub state: Arc<AppState>,
    pub security: Arc<dyn SecurityService>,
    pub blockchain: Arc<dyn BlockchainService>,
    pub sync_manager: Arc<dyn SyncManager>,
    pub asset_verification: Arc<dyn AssetVerification>,
    pub audit_logger: Arc<dyn AuditLogger>,
}

impl Core {
    pub fn new(
        state: AppState,
        security: Arc<dyn SecurityService>,
        blockchain: Arc<dyn BlockchainService>,
        sync_manager: Arc<dyn SyncManager>,
        asset_verification: Arc<dyn AssetVerification>,
        audit_logger: Arc<dyn AuditLogger>,
    ) -> Self {
        Self {
            state: Arc::new(state),
            security,
            blockchain,
            sync_manager,
            asset_verification,
            audit_logger,
        }
    }

    pub async fn verify_permission(
        &self,
        context: &SecurityContext,
        resource: ResourceType,
        action: Action,
    ) -> Result<bool, CoreError> {
        // Check if user has required permission
        if !context.has_permission(&resource, &action) {
            return Ok(false);
        }

        // Log permission check
        self.audit_logger.log_event(
            AuditEvent::new(
                "permission_check".to_string(),
                "verify".to_string(),
                crate::types::audit::AuditStatus::Success,
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
        classification: &SecurityClassification,
    ) -> Result<bool, CoreError> {
        // Check if user has required classification level
        if !context.can_access_classification(&classification.to_string()) {
            return Ok(false);
        }

        // Log classification check
        self.audit_logger.log_event(
            AuditEvent::new(
                "classification_check".to_string(),
                "verify".to_string(),
                crate::types::audit::AuditStatus::Success,
                serde_json::json!({
                    "classification": classification,
                    "user_id": context.user_id,
                }),
            )
        ).await?;

        Ok(true)
    }

    pub async fn verify_asset(
        &self,
        context: &SecurityContext,
        asset: &Asset,
    ) -> Result<VerificationStatus, CoreError> {
        // Check permissions
        if !self.verify_permission(context, ResourceType::Asset, Action::Read).await? {
            return Ok(VerificationStatus::Failed);
        }

        // Check classification
        if !self.verify_classification(context, &asset.classification).await? {
            return Ok(VerificationStatus::Failed);
        }

        // Perform asset verification
        let status = self.asset_verification.verify_asset(&asset.id.to_string()).await?;

        // Log verification
        self.audit_logger.log_event(
            AuditEvent::new(
                "asset_verification".to_string(),
                "verify".to_string(),
                crate::types::audit::AuditStatus::Success,
                serde_json::json!({
                    "asset_id": asset.id,
                    "user_id": context.user_id,
                    "status": status,
                }),
            )
        ).await?;

        Ok(status)
    }

    pub async fn submit_transaction(
        &self,
        context: &SecurityContext,
        transaction: Transaction,
    ) -> Result<Block, CoreError> {
        // Check permissions
        if !self.verify_permission(context, ResourceType::Asset, Action::Create).await? {
            return Err(CoreError::AuthorizationError("Insufficient permissions".into()));
        }

        // Submit to blockchain
        let block = self.blockchain.submit_transaction(transaction.data).await?;

        // Log transaction
        self.audit_logger.log_event(
            AuditEvent::new(
                "transaction_submit".to_string(),
                "create".to_string(),
                crate::types::audit::AuditStatus::Success,
                serde_json::json!({
                    "transaction_id": transaction.id,
                    "user_id": context.user_id,
                    "block_id": block.id,
                }),
            )
        ).await?;

        Ok(block)
    }
}
