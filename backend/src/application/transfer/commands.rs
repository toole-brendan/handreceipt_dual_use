use std::sync::Arc;
use crate::{
    domain::{
        transfer::{
            entity::Transfer,
            repository::TransferRepository,
        },
    },
    error::validation::ValidationError,
    types::security::SecurityContext,
};
use super::validation::TransferValidator;

pub struct TransferCommand {
    repository: Arc<dyn TransferRepository>,
    validator: Arc<dyn TransferValidator>,
}

impl TransferCommand {
    pub fn new(
        repository: Arc<dyn TransferRepository>,
        validator: Arc<dyn TransferValidator>,
    ) -> Self {
        Self {
            repository,
            validator,
        }
    }

    pub async fn create_transfer(
        &self,
        transfer: Transfer,
        context: &SecurityContext,
    ) -> Result<Transfer, ValidationError> {
        // Validate
        self.validator.validate_create(&transfer, context)?;

        // Create
        self.repository
            .create_transfer(transfer)
            .await
            .map_err(|e| ValidationError::Repository(e.to_string()))
    }

    pub async fn approve_transfer(
        &self,
        transfer: &Transfer,
        context: &SecurityContext,
    ) -> Result<Transfer, ValidationError> {
        // Validate
        self.validator.validate_approve(transfer, context)?;

        // Update status
        let mut updated = transfer.clone();
        updated.status = crate::domain::transfer::entity::TransferStatus::Approved;

        // Update in repository
        self.repository
            .update_transfer(&updated)
            .await
            .map(|_| updated)
            .map_err(|e| ValidationError::Repository(e.to_string()))
    }
}
