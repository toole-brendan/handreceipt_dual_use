use crate::{
    domain::transfer::entity::Transfer,
    error::validation::ValidationError,
    types::security::SecurityContext,
};

pub trait TransferValidator: Send + Sync {
    fn validate_create(&self, transfer: &Transfer, context: &SecurityContext) -> Result<(), ValidationError>;
    fn validate_approve(&self, transfer: &Transfer, context: &SecurityContext) -> Result<(), ValidationError>;
}

pub struct TransferValidatorImpl;

impl TransferValidatorImpl {
    pub fn new() -> Self {
        Self
    }
}

impl TransferValidator for TransferValidatorImpl {
    fn validate_create(&self, transfer: &Transfer, context: &SecurityContext) -> Result<(), ValidationError> {
        // Basic validation
        if transfer.from_holder_id <= 0 || transfer.to_holder_id <= 0 {
            return Err(ValidationError::InvalidField("invalid holder IDs".to_string()));
        }

        // Security validation
        if !context.has_permission(&crate::types::permissions::Permission::CreateTransfer) {
            return Err(ValidationError::InsufficientPermissions);
        }

        Ok(())
    }

    fn validate_approve(&self, transfer: &Transfer, context: &SecurityContext) -> Result<(), ValidationError> {
        // Basic validation
        if transfer.status != crate::domain::transfer::entity::TransferStatus::Pending {
            return Err(ValidationError::InvalidState("transfer must be pending".to_string()));
        }

        // Security validation
        if !context.has_permission(&crate::types::permissions::Permission::ApproveTransfer) {
            return Err(ValidationError::InsufficientPermissions);
        }

        Ok(())
    }
}
