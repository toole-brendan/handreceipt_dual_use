use async_trait::async_trait;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::{
    error::CoreError,
    types::security::SecurityContext,
    domain::property::Property,
};

use super::{
    entity::Transfer,
    repository::{TransferRepository, TransferError},
};

use crate::domain::models::transfer::TransferStatus;

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

    /// Gets pending transfers that require approval
    async fn get_pending_transfers(
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
        let transfer = Transfer::new(
            property_id,
            None,
            new_custodian,
            None,
            None,
            context.is_officer(),
            context.user_id.to_string(),
        );

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
        let mut transfer = self.repository
            .get_by_id(transfer_id)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to get transfer: {}", e)))?;

        transfer.approve(
            context.user_id.to_string(),
            Some("Approved by officer".to_string()),
        ).map_err(|e| CoreError::Transfer(e))?;

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
        let mut transfer = self.repository
            .get_by_id(transfer_id)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to get transfer: {}", e)))?;

        transfer.reject(
            context.user_id.to_string(),
            Some("Rejected by officer".to_string()),
        ).map_err(|e| CoreError::Transfer(e))?;

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
        let mut transfer = self.repository
            .get_by_id(transfer_id)
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to get transfer: {}", e)))?;

        transfer.complete(
            blockchain_verification,
            None,
        ).map_err(|e| CoreError::Transfer(e))?;

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

    async fn get_pending_transfers(
        &self,
        context: &SecurityContext,
    ) -> Result<Vec<Transfer>, CoreError> {
        self.repository
            .get_pending_transfers(&context.user_id.to_string())
            .await
            .map_err(|e| CoreError::Transfer(format!("Failed to get pending transfers: {}", e)))
    }
}
