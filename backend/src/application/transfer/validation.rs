use uuid::Uuid;
use async_trait::async_trait;
use thiserror::Error;

use crate::{
    domain::{
        transfer::{Transfer, TransferStatus},
        property::{Property, PropertyService},
    },
    types::security::{SecurityContext, SecurityLevel},
    error::CoreError,
};

/// Transfer validation errors
#[derive(Debug, Error)]
pub enum TransferValidationError {
    #[error("Property not found: {0}")]
    PropertyNotFound(Uuid),

    #[error("Property is not available for transfer")]
    PropertyUnavailable,

    #[error("Invalid custodian: {0}")]
    InvalidCustodian(String),

    #[error("Insufficient security clearance")]
    InsufficientClearance,

    #[error("Invalid transfer state: {0}")]
    InvalidState(String),

    #[error("QR code validation failed: {0}")]
    QRValidationFailed(String),

    #[error("Blockchain verification failed: {0}")]
    BlockchainVerificationFailed(String),
}

/// Transfer validation service
#[async_trait]
pub trait TransferValidation: Send + Sync {
    /// Validates a transfer initiation
    async fn validate_initiation(
        &self,
        property_id: Uuid,
        new_custodian: &str,
        context: &SecurityContext,
    ) -> Result<(), TransferValidationError>;

    /// Validates a transfer approval
    async fn validate_approval(
        &self,
        transfer: &Transfer,
        context: &SecurityContext,
    ) -> Result<(), TransferValidationError>;

    /// Validates a transfer completion
    async fn validate_completion(
        &self,
        transfer: &Transfer,
        qr_code: &str,
        context: &SecurityContext,
    ) -> Result<(), TransferValidationError>;

    /// Validates a transfer cancellation
    async fn validate_cancellation(
        &self,
        transfer: &Transfer,
        context: &SecurityContext,
    ) -> Result<(), TransferValidationError>;
}

pub struct TransferValidationImpl<P: PropertyService> {
    property_service: P,
}

impl<P: PropertyService> TransferValidationImpl<P> {
    pub fn new(property_service: P) -> Self {
        Self { property_service }
    }

    /// Checks if a user has sufficient clearance for a sensitive item
    async fn validate_security_clearance(
        &self,
        property: &Property,
        context: &SecurityContext,
    ) -> Result<(), TransferValidationError> {
        if property.is_sensitive() && context.security_level < SecurityLevel::Secret {
            return Err(TransferValidationError::InsufficientClearance);
        }
        Ok(())
    }

    /// Validates custodian format and existence
    fn validate_custodian(&self, custodian: &str) -> Result<(), TransferValidationError> {
        if custodian.trim().is_empty() {
            return Err(TransferValidationError::InvalidCustodian(
                "Custodian cannot be empty".to_string(),
            ));
        }
        // Additional custodian validation rules can be added here
        Ok(())
    }
}

#[async_trait]
impl<P: PropertyService> TransferValidation for TransferValidationImpl<P> {
    async fn validate_initiation(
        &self,
        property_id: Uuid,
        new_custodian: &str,
        context: &SecurityContext,
    ) -> Result<(), TransferValidationError> {
        // Get property
        let property = self.property_service
            .get_property(property_id, context)
            .await
            .map_err(|_| TransferValidationError::PropertyNotFound(property_id))?
            .ok_or(TransferValidationError::PropertyNotFound(property_id))?;

        // Validate security clearance
        self.validate_security_clearance(&property, context).await?;

        // Validate custodian
        self.validate_custodian(new_custodian)?;

        // Check if property is available for transfer
        if !property.is_available_for_transfer() {
            return Err(TransferValidationError::PropertyUnavailable);
        }

        Ok(())
    }

    async fn validate_approval(
        &self,
        transfer: &Transfer,
        context: &SecurityContext,
    ) -> Result<(), TransferValidationError> {
        // Validate transfer state
        if transfer.status() != &TransferStatus::PendingApproval {
            return Err(TransferValidationError::InvalidState(
                "Transfer is not pending approval".to_string(),
            ));
        }

        // Get property
        let property = self.property_service
            .get_property(transfer.property_id(), context)
            .await
            .map_err(|_| TransferValidationError::PropertyNotFound(transfer.property_id()))?
            .ok_or(TransferValidationError::PropertyNotFound(transfer.property_id()))?;

        // Validate security clearance
        self.validate_security_clearance(&property, context).await?;

        Ok(())
    }

    async fn validate_completion(
        &self,
        transfer: &Transfer,
        qr_code: &str,
        context: &SecurityContext,
    ) -> Result<(), TransferValidationError> {
        // Validate transfer state
        match transfer.status() {
            TransferStatus::Pending | TransferStatus::Approved => (),
            _ => return Err(TransferValidationError::InvalidState(
                "Transfer cannot be completed in current state".to_string(),
            )),
        }

        // Get property
        let property = self.property_service
            .get_property(transfer.property_id(), context)
            .await
            .map_err(|_| TransferValidationError::PropertyNotFound(transfer.property_id()))?
            .ok_or(TransferValidationError::PropertyNotFound(transfer.property_id()))?;

        // Validate security clearance
        self.validate_security_clearance(&property, context).await?;

        // Validate QR code
        if !self.validate_qr_code(&property, qr_code) {
            return Err(TransferValidationError::QRValidationFailed(
                "Invalid QR code".to_string(),
            ));
        }

        Ok(())
    }

    async fn validate_cancellation(
        &self,
        transfer: &Transfer,
        context: &SecurityContext,
    ) -> Result<(), TransferValidationError> {
        // Validate transfer state
        match transfer.status() {
            TransferStatus::Pending | TransferStatus::PendingApproval => (),
            _ => return Err(TransferValidationError::InvalidState(
                "Transfer cannot be cancelled in current state".to_string(),
            )),
        }

        // Get property
        let property = self.property_service
            .get_property(transfer.property_id(), context)
            .await
            .map_err(|_| TransferValidationError::PropertyNotFound(transfer.property_id()))?
            .ok_or(TransferValidationError::PropertyNotFound(transfer.property_id()))?;

        // Validate security clearance
        self.validate_security_clearance(&property, context).await?;

        Ok(())
    }
}

impl<P: PropertyService> TransferValidationImpl<P> {
    /// Validates a QR code against a property
    fn validate_qr_code(&self, property: &Property, qr_code: &str) -> bool {
        // QR code validation logic would go here
        // This could involve checking digital signatures, comparing hashes, etc.
        // For now, we'll just check if the QR code contains the property ID
        qr_code.contains(&property.id().to_string())
    }
}
