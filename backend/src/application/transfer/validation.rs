use uuid::Uuid;
use chrono::{DateTime, Utc, Duration};
use serde::{Serialize, Deserialize};
use std::sync::Arc;

use crate::{
    domain::models::{
        transfer::{PropertyTransferRecord, TransferStatus, VerificationMethod},
        qr::QRData,
    },
    types::{
        app::PropertyService,
        security::SecurityContext,
    },
    error::CoreError,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct TransferValidationResult {
    pub is_valid: bool,
    pub requires_approval: bool,
    pub validation_errors: Vec<String>,
    pub expires_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransferValidationContext {
    pub qr_data: QRData,
    pub scanned_at: DateTime<Utc>,
    pub scanner_location: Option<String>,
    pub property_id: Uuid,
    pub new_custodian: String,
}

pub struct TransferValidationService {
    property_service: Arc<dyn PropertyService>,
}

impl TransferValidationService {
    pub fn new(property_service: Arc<dyn PropertyService>) -> Self {
        Self { property_service }
    }

    /// Validates a transfer request
    pub async fn validate_transfer(
        &self,
        context: TransferValidationContext,
        security_context: &SecurityContext,
    ) -> Result<TransferValidationResult, CoreError> {
        let mut validation_errors = Vec::new();
        let mut requires_approval = false;

        // Get property
        let property = match self.property_service
            .get_property(context.property_id, security_context)
            .await?
        {
            Some(p) => p,
            None => {
                validation_errors.push("Property not found".to_string());
                return Ok(TransferValidationResult {
                    is_valid: false,
                    requires_approval: false,
                    validation_errors,
                    expires_at: None,
                });
            }
        };

        // Validate QR code expiration
        let qr_age = context.scanned_at - context.qr_data.timestamp;
        if qr_age > Duration::hours(24) {
            validation_errors.push("QR code has expired".to_string());
        }

        // Validate property status
        if !property.is_available_for_transfer() {
            validation_errors.push(format!(
                "Property is not available for transfer. Current status: {:?}",
                property.status()
            ));
        }

        // Check if property is sensitive
        if property.is_sensitive() {
            requires_approval = true;
            
            // Validate permissions for sensitive items
            if !security_context.has_permission_for_sensitive_items() {
                validation_errors.push("Insufficient permissions for sensitive item transfer".to_string());
            }
        }

        // Validate current custodian
        if let Some(current_custodian) = property.custodian() {
            if current_custodian.as_str() == context.new_custodian {
                validation_errors.push("Cannot transfer to current custodian".to_string());
            }
        }

        // Calculate expiration
        let expires_at = if validation_errors.is_empty() {
            Some(Utc::now() + Duration::hours(24))
        } else {
            None
        };

        Ok(TransferValidationResult {
            is_valid: validation_errors.is_empty(),
            requires_approval,
            validation_errors,
            expires_at,
        })
    }

    /// Validates transfer approval
    pub async fn validate_approval(
        &self,
        transfer: &PropertyTransferRecord,
        security_context: &SecurityContext,
    ) -> Result<TransferValidationResult, CoreError> {
        let mut validation_errors = Vec::new();

        // Verify officer role
        if !security_context.is_officer() {
            validation_errors.push("Only officers can approve transfers".to_string());
        }

        // Verify transfer status
        if transfer.status != TransferStatus::Pending {
            validation_errors.push(format!(
                "Transfer cannot be approved in {:?} status",
                transfer.status
            ));
        }

        // Get property
        let property = match self.property_service
            .get_property(transfer.property_id, security_context)
            .await?
        {
            Some(p) => p,
            None => {
                validation_errors.push("Property not found".to_string());
                return Ok(TransferValidationResult {
                    is_valid: false,
                    requires_approval: false,
                    validation_errors,
                    expires_at: None,
                });
            }
        };

        // Verify command chain
        if !security_context.can_approve_for_command(&property.command_id().unwrap_or_default()) {
            validation_errors.push("Officer cannot approve transfers for this command".to_string());
        }

        Ok(TransferValidationResult {
            is_valid: validation_errors.is_empty(),
            requires_approval: false,
            validation_errors,
            expires_at: None,
        })
    }

    /// Validates blockchain verification
    pub async fn validate_blockchain_verification(
        &self,
        transfer: &PropertyTransferRecord,
        verification: &str,
        security_context: &SecurityContext,
    ) -> Result<TransferValidationResult, CoreError> {
        let mut validation_errors = Vec::new();

        // Verify transfer status
        match transfer.status {
            TransferStatus::Completed | TransferStatus::InProgress => {},
            _ => {
                validation_errors.push(format!(
                    "Transfer cannot be blockchain verified in {:?} status",
                    transfer.status
                ));
            }
        }

        // Verify blockchain data
        if verification.is_empty() {
            validation_errors.push("Invalid blockchain verification data".to_string());
        }

        // Verify verification method
        if !transfer.can_complete(&VerificationMethod::Blockchain) {
            validation_errors.push("Transfer does not support blockchain verification".to_string());
        }

        Ok(TransferValidationResult {
            is_valid: validation_errors.is_empty(),
            requires_approval: false,
            validation_errors,
            expires_at: None,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::property::{
        repository::mock::MockPropertyRepository,
        service_impl::PropertyServiceImpl,
        service_wrapper::PropertyServiceWrapper,
    };

    #[tokio::test]
    async fn test_transfer_validation() {
        let repository = MockPropertyRepository::new();
        let property_service = PropertyServiceImpl::new(repository);
        let wrapped_service = Arc::new(PropertyServiceWrapper::new(property_service));
        let validation_service = TransferValidationService::new(wrapped_service);

        let context = TransferValidationContext {
            qr_data: QRData {
                id: Uuid::new_v4(),
                property_id: Uuid::new_v4(),
                metadata: serde_json::json!({}),
                timestamp: Utc::now(),
            },
            scanned_at: Utc::now(),
            scanner_location: None,
            property_id: Uuid::new_v4(),
            new_custodian: "NEW_CUSTODIAN".to_string(),
        };

        let security_context = SecurityContext::default();
        let result = validation_service.validate_transfer(context, &security_context).await;
        assert!(result.is_ok());
    }
}
