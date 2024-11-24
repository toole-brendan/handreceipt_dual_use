use std::sync::Arc;
use async_trait::async_trait;
use chrono::Utc;
use uuid::Uuid;

use super::{
    service::TransferService,
    repository::{TransferRepository, TransferError},
    entity::{Transfer, TransferStatus},
};
use crate::{
    error::CoreError,
    types::security::SecurityContext,
    infrastructure::blockchain::verification::TransferVerification,
};

pub struct TransferServiceImpl {
    repository: Arc<dyn TransferRepository>,
    blockchain: Arc<dyn TransferVerification>,
}

impl TransferServiceImpl {
    pub fn new(
        repository: Arc<dyn TransferRepository>,
        blockchain: Arc<dyn TransferVerification>,
    ) -> Self {
        Self { repository, blockchain }
    }

    async fn validate_transfer_access(
        &self,
        transfer: &Transfer,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        // Check if user can access this transfer
        if !context.can_handle_sensitive_items() && transfer.is_sensitive() {
            return Err(CoreError::Authorization(
                "Cannot access sensitive item transfers".into()
            ));
        }

        // Check command access if transfer requires approval
        if transfer.requires_approval() && !context.is_officer() {
            return Err(CoreError::Authorization(
                "Only officers can handle transfers requiring approval".into()
            ));
        }

        Ok(())
    }
}

#[async_trait]
impl TransferService for TransferServiceImpl {
    async fn initiate_transfer(
        &self,
        property_id: Uuid,
        new_custodian: String,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError> {
        // Create new transfer
        let transfer = Transfer::new(
            property_id,
            None, // Current custodian will be set from property
            new_custodian,
            context.is_officer(), // Officers can self-approve
            Some(context.user_id),
            Some(context.unit_code.clone()),
            Utc::now(),
        );

        // Save to repository
        let transfer = self.repository
            .create(transfer)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to create transfer: {}", e)))?;

        // Record on blockchain
        self.blockchain
            .record_transfer(&transfer.into(), context)
            .await?;

        Ok(transfer)
    }

    async fn approve_transfer(
        &self,
        transfer_id: Uuid,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError> {
        // Get transfer
        let mut transfer = self.repository
            .get_by_id(transfer_id)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to get transfer: {}", e)))?;

        // Validate access
        self.validate_transfer_access(&transfer, context).await?;

        // Approve transfer
        transfer.approve(context.user_id, Utc::now())
            .map_err(|e| CoreError::Transfer(e))?;

        // Update repository
        let transfer = self.repository
            .update(transfer)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to update transfer: {}", e)))?;

        // Verify on blockchain
        self.blockchain
            .verify_transfer(&transfer.into(), context)
            .await?;

        Ok(transfer)
    }

    async fn reject_transfer(
        &self,
        transfer_id: Uuid,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError> {
        // Get transfer
        let mut transfer = self.repository
            .get_by_id(transfer_id)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to get transfer: {}", e)))?;

        // Validate access
        self.validate_transfer_access(&transfer, context).await?;

        // Reject transfer
        transfer.reject(context.user_id, Utc::now())
            .map_err(|e| CoreError::Transfer(e))?;

        // Update repository
        self.repository
            .update(transfer)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to update transfer: {}", e)))
    }

    async fn complete_transfer(
        &self,
        transfer_id: Uuid,
        blockchain_verification: String,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError> {
        // Get transfer
        let mut transfer = self.repository
            .get_by_id(transfer_id)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to get transfer: {}", e)))?;

        // Validate access
        self.validate_transfer_access(&transfer, context).await?;

        // Complete transfer with blockchain verification
        transfer.complete(blockchain_verification, Utc::now())
            .map_err(|e| CoreError::Transfer(e))?;

        // Update repository
        self.repository
            .update(transfer)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to update transfer: {}", e)))
    }

    async fn cancel_transfer(
        &self,
        transfer_id: Uuid,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError> {
        // Get transfer
        let mut transfer = self.repository
            .get_by_id(transfer_id)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to get transfer: {}", e)))?;

        // Validate access
        self.validate_transfer_access(&transfer, context).await?;

        // Cancel transfer
        transfer.cancel(context.user_id, Utc::now())
            .map_err(|e| CoreError::Transfer(e))?;

        // Update repository
        self.repository
            .update(transfer)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to update transfer: {}", e)))
    }

    async fn get_property_transfers(
        &self,
        property_id: Uuid,
        context: &SecurityContext,
    ) -> Result<Vec<Transfer>, CoreError> {
        self.repository
            .get_by_property(property_id)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to get property transfers: {}", e)))
    }

    async fn get_pending_approvals(
        &self,
        context: &SecurityContext,
    ) -> Result<Vec<Transfer>, CoreError> {
        if !context.is_officer() {
            return Err(CoreError::Authorization("Only officers can view pending approvals".into()));
        }

        self.repository
            .get_pending_approvals(&context.user_id.to_string())
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to get pending approvals: {}", e)))
    }
} 