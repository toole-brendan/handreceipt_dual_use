use async_trait::async_trait;
use uuid::Uuid;

use crate::{
    error::CoreError,
    types::security::SecurityContext,
    domain::property::Property,
};

use super::{
    entity::{Transfer, TransferStatus},
    repository::{TransferRepository, TransferError},
};

/// Domain service for transfer operations
#[async_trait]
pub trait TransferService: Send + Sync {
    /// Initiates a new transfer
    async fn initiate_transfer(
        &self,
        property_id: Uuid,
        new_custodian: String,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError>;

    /// Approves a transfer
    async fn approve_transfer(
        &self,
        transfer_id: Uuid,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError>;

    /// Rejects a transfer
    async fn reject_transfer(
        &self,
        transfer_id: Uuid,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError>;

    /// Completes a transfer with blockchain verification
    async fn complete_transfer(
        &self,
        transfer_id: Uuid,
        blockchain_verification: String,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError>;

    /// Cancels a transfer
    async fn cancel_transfer(
        &self,
        transfer_id: Uuid,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError>;

    /// Gets transfer history for a property
    async fn get_property_transfers(
        &self,
        property_id: Uuid,
        context: &SecurityContext,
    ) -> Result<Vec<Transfer>, CoreError>;

    /// Gets pending transfers for approval
    async fn get_pending_approvals(
        &self,
        context: &SecurityContext,
    ) -> Result<Vec<Transfer>, CoreError>;
}

pub struct TransferServiceImpl<R: TransferRepository> {
    repository: R,
}

impl<R: TransferRepository> TransferServiceImpl<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }
}

#[async_trait]
impl<R: TransferRepository> TransferService for TransferServiceImpl<R> {
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
            true, // Requires approval by default
            None,
            None,
        );

        // Save to repository
        self.repository
            .create(transfer)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to create transfer: {}", e)))
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

        // Approve
        transfer.approve()
            .map_err(|e| CoreError::Transfer(e))?;

        // Update repository
        self.repository
            .update(transfer)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to update transfer: {}", e)))
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

        // Reject
        transfer.reject()
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

        // Complete with blockchain verification
        transfer.complete(blockchain_verification)
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

        // Cancel
        transfer.cancel()
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
        _context: &SecurityContext,
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
        self.repository
            .get_pending_approvals(&context.user_id.to_string())
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to get pending approvals: {}", e)))
    }
}
