use uuid::Uuid;
use std::sync::Arc;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

use crate::{
    domain::{
        models::{
            qr::{QRCodeService, VerifyQRRequest},
            transfer::{AssetTransfer, TransferStatus, VerificationMethod},
        },
        transfer::service::TransferService,
        property::service::PropertyService,
    },
    error::CoreError,
    types::security::{SecurityContext, SecurityClassification},
};

#[derive(Debug, Serialize, Deserialize)]
pub struct InitiateTransferCommand {
    pub property_id: Uuid,
    pub new_custodian: String,
    pub location: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanQRTransferCommand {
    pub qr_data: String,
    pub scanner_id: String,
    pub location: Option<String>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApproveTransferCommand {
    pub transfer_id: Uuid,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransferResult {
    pub transfer: AssetTransfer,
    pub status: TransferStatus,
    pub requires_approval: bool,
    pub verification_method: VerificationMethod,
}

pub struct TransferCommandService {
    transfer_service: Arc<dyn TransferService>,
    property_service: Arc<dyn PropertyService>,
    qr_service: Arc<dyn QRCodeService>,
}

impl TransferCommandService {
    pub fn new(
        transfer_service: Arc<dyn TransferService>,
        property_service: Arc<dyn PropertyService>,
        qr_service: Arc<dyn QRCodeService>,
    ) -> Self {
        Self {
            transfer_service,
            property_service,
            qr_service,
        }
    }

    /// Initiates a new transfer using QR code
    pub async fn initiate_transfer_with_qr(
        &self,
        command: ScanQRTransferCommand,
        context: &SecurityContext,
    ) -> Result<TransferResult, CoreError> {
        // Validate QR code
        let verify_request = VerifyQRRequest {
            qr_data: command.qr_data,
            scanned_at: command.timestamp,
            scanner_id: command.scanner_id,
            location: command.location.map(|l| l.parse().unwrap()),
        };

        let qr_data = self.qr_service.validate_qr(verify_request, context).await?;

        // Get property
        let property = self.property_service
            .get_property(qr_data.property_id, context)
            .await?
            .ok_or_else(|| CoreError::NotFound("Property not found".into()))?;

        // Check if property is available for transfer
        if property.is_sensitive() && !context.has_permission_for_sensitive_items() {
            return Err(CoreError::Authorization("Cannot transfer sensitive items".into()));
        }

        // Create transfer
        let transfer = self.transfer_service
            .initiate_transfer(
                property.id(),
                context.user_id.to_string(), // New custodian is the scanner
                context,
            )
            .await?;

        Ok(TransferResult {
            transfer,
            status: TransferStatus::InProgress,
            requires_approval: property.is_sensitive(),
            verification_method: VerificationMethod::QRCode,
        })
    }

    /// Approves a transfer (Officers only)
    pub async fn approve_transfer(
        &self,
        command: ApproveTransferCommand,
        context: &SecurityContext,
    ) -> Result<TransferResult, CoreError> {
        // Verify officer permissions
        if !context.is_officer() {
            return Err(CoreError::Authorization("Only officers can approve transfers".into()));
        }

        // Get transfer
        let transfer = self.transfer_service
            .approve_transfer(command.transfer_id, context)
            .await?;

        Ok(TransferResult {
            transfer,
            status: TransferStatus::Completed,
            requires_approval: false,
            verification_method: VerificationMethod::QRCode,
        })
    }

    /// Completes a transfer with blockchain verification
    pub async fn complete_transfer(
        &self,
        transfer_id: Uuid,
        blockchain_verification: String,
        context: &SecurityContext,
    ) -> Result<TransferResult, CoreError> {
        let transfer = self.transfer_service
            .complete_transfer(transfer_id, blockchain_verification, context)
            .await?;

        Ok(TransferResult {
            transfer,
            status: TransferStatus::Confirmed,
            requires_approval: false,
            verification_method: VerificationMethod::Blockchain,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::{
        property::repository::mock::MockPropertyRepository,
        transfer::repository::mock::MockTransferRepository,
        models::qr::QRCodeServiceImpl,
    };
    use ed25519_dalek::SigningKey;
    use rand::rngs::OsRng;

    fn create_test_services() -> TransferCommandService {
        let property_repository = Arc::new(MockPropertyRepository::new());
        let property_service = Arc::new(PropertyServiceImpl::new(property_repository));

        let transfer_repository = Arc::new(MockTransferRepository::new());
        let transfer_service = Arc::new(TransferServiceImpl::new(transfer_repository));

        let signing_key = SigningKey::generate(&mut OsRng);
        let qr_service = Arc::new(QRCodeServiceImpl::new(signing_key));

        TransferCommandService::new(
            transfer_service,
            property_service,
            qr_service,
        )
    }

    #[tokio::test]
    async fn test_transfer_workflow() {
        let service = create_test_services();
        let context = SecurityContext::default(); // Mock context for testing

        // Create test property and QR code
        let property_id = Uuid::new_v4();
        let qr_response = service.qr_service
            .generate_qr(property_id, QRFormat::PNG, &context)
            .await
            .unwrap();

        // Scan QR code
        let scan_command = ScanQRTransferCommand {
            qr_data: qr_response.qr_code,
            scanner_id: "TEST_SCANNER".to_string(),
            location: None,
            timestamp: Utc::now(),
        };

        let result = service.initiate_transfer_with_qr(scan_command, &context).await;
        assert!(result.is_ok());
    }
}
