use uuid::Uuid;
use async_trait::async_trait;
use serde::{Serialize, Deserialize};

use crate::{
    domain::transfer::{
        Transfer,
        TransferService,
    },
    types::security::SecurityContext,
    error::CoreError,
};

/// Transfer request for batch processing
#[derive(Debug, Serialize, Deserialize)]
pub struct TransferRequest {
    pub property_id: Uuid,
    pub new_custodian: String,
    pub notes: Option<String>,
    pub qr_code: Option<String>,  // Optional QR code for immediate completion
}

/// Transfer command handlers
#[async_trait]
pub trait TransferCommands: Send + Sync {
    /// Initiates a new transfer
    async fn initiate_transfer(
        &self,
        property_id: Uuid,
        new_custodian: String,
        notes: Option<String>,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError>;

    /// Initiates multiple transfers in a batch
    async fn batch_transfer(
        &self,
        transfers: Vec<TransferRequest>,
        context: &SecurityContext,
    ) -> Result<Vec<Transfer>, CoreError>;

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
        reason: String,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError>;

    /// Completes a transfer with blockchain verification
    async fn complete_transfer(
        &self,
        transfer_id: Uuid,
        qr_code: String,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError>;

    /// Cancels a transfer
    async fn cancel_transfer(
        &self,
        transfer_id: Uuid,
        reason: String,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError>;
}

pub struct TransferCommandsImpl<S: TransferService> {
    transfer_service: S,
}

impl<S: TransferService> TransferCommandsImpl<S> {
    pub fn new(transfer_service: S) -> Self {
        Self { transfer_service }
    }
}

#[async_trait]
impl<S: TransferService> TransferCommands for TransferCommandsImpl<S> {
    async fn initiate_transfer(
        &self,
        property_id: Uuid,
        new_custodian: String,
        _notes: Option<String>,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError> {
        // Initiate transfer through domain service
        self.transfer_service.initiate_transfer(
            property_id,
            new_custodian,
            context,
        ).await
    }

    async fn batch_transfer(
        &self,
        transfers: Vec<TransferRequest>,
        context: &SecurityContext,
    ) -> Result<Vec<Transfer>, CoreError> {
        let mut results = Vec::new();

        // Process each transfer in the batch
        for request in transfers {
            // Initiate the transfer
            let transfer = self.transfer_service.initiate_transfer(
                request.property_id,
                request.new_custodian,
                context,
            ).await?;

            // If QR code is provided, complete the transfer immediately
            let final_transfer = if let Some(qr_code) = request.qr_code {
                self.transfer_service.complete_transfer(
                    transfer.id(),
                    qr_code,
                    context,
                ).await?
            } else {
                transfer
            };

            results.push(final_transfer);
        }

        Ok(results)
    }

    async fn approve_transfer(
        &self,
        transfer_id: Uuid,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError> {
        // Approve transfer through domain service
        self.transfer_service.approve_transfer(
            transfer_id,
            context,
        ).await
    }

    async fn reject_transfer(
        &self,
        transfer_id: Uuid,
        _reason: String,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError> {
        // Reject transfer through domain service
        self.transfer_service.reject_transfer(
            transfer_id,
            context,
        ).await
    }

    async fn complete_transfer(
        &self,
        transfer_id: Uuid,
        qr_code: String,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError> {
        // Complete transfer through domain service with blockchain verification
        self.transfer_service.complete_transfer(
            transfer_id,
            qr_code, // QR code will be used as blockchain verification
            context,
        ).await
    }

    async fn cancel_transfer(
        &self,
        transfer_id: Uuid,
        _reason: String,
        context: &SecurityContext,
    ) -> Result<Transfer, CoreError> {
        // Cancel transfer through domain service
        self.transfer_service.cancel_transfer(
            transfer_id,
            context,
        ).await
    }
}
