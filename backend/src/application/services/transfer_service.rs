use std::sync::Arc;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use serde::{Serialize, Deserialize};

use crate::{
    domain::property::{
        Property,
        PropertyService,
        PropertyServiceError,
    },
    application::services::qr_service::{
        QRService,
        QRServiceError,
        PropertyQRData,
    },
    infrastructure::blockchain::authority::{
        AuthorityNode,
        TransferRecord,
        PropertyTransfer,
    },
};

/// Status of a property transfer
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum TransferStatus {
    Pending,      // Transfer initiated
    Validated,    // QR code validated
    Verified,     // Blockchain verification complete
    Completed,    // Transfer completed
    Failed,       // Transfer failed
    Cancelled,    // Transfer cancelled
}

/// Input for initiating a transfer via QR code
#[derive(Debug)]
pub struct InitiateTransferInput {
    pub qr_data: String,
    pub new_custodian: String,
    pub location: Option<String>,
    pub notes: Option<String>,
}

/// Response containing transfer details
#[derive(Debug, Serialize)]
pub struct TransferResponse {
    pub transfer_id: Uuid,
    pub property_id: Uuid,
    pub from_custodian: Option<String>,
    pub to_custodian: String,
    pub status: TransferStatus,
    pub timestamp: DateTime<Utc>,
    pub blockchain_verification: Option<String>,
}

/// Error types for transfer operations
#[derive(Debug, thiserror::Error)]
pub enum TransferServiceError {
    #[error("QR code error: {0}")]
    QRCode(#[from] QRServiceError),

    #[error("Property error: {0}")]
    Property(#[from] PropertyServiceError),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Blockchain error: {0}")]
    Blockchain(String),

    #[error("Authorization error: {0}")]
    Authorization(String),
}

/// Service for handling property transfers
#[async_trait]
pub trait TransferService: Send + Sync {
    /// Initiates a transfer using QR code
    async fn initiate_transfer(
        &self,
        input: InitiateTransferInput,
        initiated_by: String,
    ) -> Result<TransferResponse, TransferServiceError>;

    /// Gets a transfer by ID
    async fn get_transfer(
        &self,
        transfer_id: Uuid,
    ) -> Result<TransferResponse, TransferServiceError>;

    /// Gets transfers for a custodian
    async fn get_custodian_transfers(
        &self,
        custodian: &str,
    ) -> Result<Vec<TransferResponse>, TransferServiceError>;

    /// Cancels a pending transfer
    async fn cancel_transfer(
        &self,
        transfer_id: Uuid,
        cancelled_by: String,
    ) -> Result<TransferResponse, TransferServiceError>;
}

pub struct TransferServiceImpl {
    property_service: Arc<dyn PropertyService>,
    qr_service: Arc<QRService>,
    authority_node: Arc<AuthorityNode>,
}

impl TransferServiceImpl {
    pub fn new(
        property_service: Arc<dyn PropertyService>,
        qr_service: Arc<QRService>,
        authority_node: Arc<AuthorityNode>,
    ) -> Self {
        Self {
            property_service,
            qr_service,
            authority_node,
        }
    }

    /// Validates a transfer request
    async fn validate_transfer(
        &self,
        property: &Property,
        new_custodian: &str,
    ) -> Result<(), TransferServiceError> {
        // Check if property is available for transfer
        if property.status() != &crate::domain::property::PropertyStatus::Available 
            && property.status() != &crate::domain::property::PropertyStatus::Assigned {
            return Err(TransferServiceError::Validation(
                "Property is not available for transfer".to_string()
            ));
        }

        // Verify new custodian is different from current
        if property.custodian() == Some(&new_custodian.to_string()) {
            return Err(TransferServiceError::Validation(
                "New custodian must be different from current custodian".to_string()
            ));
        }

        Ok(())
    }

    /// Creates a blockchain transfer record
    async fn create_transfer_record(
        &self,
        property: &Property,
        new_custodian: String,
        initiated_by: String,
    ) -> Result<TransferRecord, TransferServiceError> {
        let transfer = PropertyTransfer::new(
            property.id(),
            property.custodian().cloned(),
            new_custodian,
            initiated_by,
            true, // Requires approval for sensitive items
        );

        // Get authority signatures
        let record = self.authority_node
            .validate_transfer(&transfer)
            .await
            .map_err(|e| TransferServiceError::Blockchain(e.to_string()))?;

        Ok(record)
    }
}

#[async_trait]
impl TransferService for TransferServiceImpl {
    async fn initiate_transfer(
        &self,
        input: InitiateTransferInput,
        initiated_by: String,
    ) -> Result<TransferResponse, TransferServiceError> {
        // Validate QR code
        let qr_data = self.qr_service
            .validate_qr(&input.qr_data)
            .await?;

        // Get property
        let mut property = self.property_service
            .get_property(qr_data.property_id)
            .await?;

        // Validate transfer
        self.validate_transfer(&property, &input.new_custodian).await?;

        // Create blockchain record
        let transfer_record = self.create_transfer_record(
            &property,
            input.new_custodian.clone(),
            initiated_by,
        ).await?;

        // Update property status
        property.initiate_transfer()
            .map_err(|e| TransferServiceError::Property(PropertyServiceError::BusinessRule(e)))?;

        if let Some(location) = input.location {
            property.update_location(crate::domain::property::Location {
                building: location,
                room: None,
                notes: input.notes,
                grid_coordinates: None,
            });
        }

        // Save property changes
        property = self.property_service
            .update_property(property)
            .await?;

        Ok(TransferResponse {
            transfer_id: transfer_record.id(),
            property_id: property.id(),
            from_custodian: property.custodian().cloned(),
            to_custodian: input.new_custodian,
            status: TransferStatus::Pending,
            timestamp: Utc::now(),
            blockchain_verification: Some(transfer_record.id().to_string()),
        })
    }

    async fn get_transfer(
        &self,
        transfer_id: Uuid,
    ) -> Result<TransferResponse, TransferServiceError> {
        // Get transfer record from blockchain
        let record = self.authority_node
            .get_transfer_record(transfer_id)
            .await
            .map_err(|e| TransferServiceError::Blockchain(e.to_string()))?;

        // Get property
        let property = self.property_service
            .get_property(record.property_id())
            .await?;

        Ok(TransferResponse {
            transfer_id: record.id(),
            property_id: property.id(),
            from_custodian: record.from_custodian().cloned(),
            to_custodian: record.to_custodian().to_string(),
            status: match record.status() {
                crate::infrastructure::blockchain::authority::TransferStatus::Pending => TransferStatus::Pending,
                crate::infrastructure::blockchain::authority::TransferStatus::Approved => TransferStatus::Verified,
                crate::infrastructure::blockchain::authority::TransferStatus::Rejected => TransferStatus::Failed,
                crate::infrastructure::blockchain::authority::TransferStatus::Cancelled => TransferStatus::Cancelled,
                _ => TransferStatus::Completed,
            },
            timestamp: record.timestamp(),
            blockchain_verification: Some(record.id().to_string()),
        })
    }

    async fn get_custodian_transfers(
        &self,
        custodian: &str,
    ) -> Result<Vec<TransferResponse>, TransferServiceError> {
        // Get transfers from blockchain
        let records = self.authority_node
            .get_custodian_transfers(custodian)
            .await
            .map_err(|e| TransferServiceError::Blockchain(e.to_string()))?;

        // Convert to responses
        let mut responses = Vec::new();
        for record in records {
            let property = self.property_service
                .get_property(record.property_id())
                .await?;

            responses.push(TransferResponse {
                transfer_id: record.id(),
                property_id: property.id(),
                from_custodian: record.from_custodian().cloned(),
                to_custodian: record.to_custodian().to_string(),
                status: match record.status() {
                    crate::infrastructure::blockchain::authority::TransferStatus::Pending => TransferStatus::Pending,
                    crate::infrastructure::blockchain::authority::TransferStatus::Approved => TransferStatus::Verified,
                    crate::infrastructure::blockchain::authority::TransferStatus::Rejected => TransferStatus::Failed,
                    crate::infrastructure::blockchain::authority::TransferStatus::Cancelled => TransferStatus::Cancelled,
                    _ => TransferStatus::Completed,
                },
                timestamp: record.timestamp(),
                blockchain_verification: Some(record.id().to_string()),
            });
        }

        Ok(responses)
    }

    async fn cancel_transfer(
        &self,
        transfer_id: Uuid,
        cancelled_by: String,
    ) -> Result<TransferResponse, TransferServiceError> {
        // Get transfer record
        let mut record = self.authority_node
            .get_transfer_record(transfer_id)
            .await
            .map_err(|e| TransferServiceError::Blockchain(e.to_string()))?;

        // Verify transfer can be cancelled
        if record.status() != &crate::infrastructure::blockchain::authority::TransferStatus::Pending {
            return Err(TransferServiceError::Validation(
                "Transfer cannot be cancelled in current status".to_string()
            ));
        }

        // Cancel transfer
        record = self.authority_node
            .cancel_transfer(transfer_id, cancelled_by)
            .await
            .map_err(|e| TransferServiceError::Blockchain(e.to_string()))?;

        // Get property
        let mut property = self.property_service
            .get_property(record.property_id())
            .await?;

        // Update property status
        property.cancel_transfer()
            .map_err(|e| TransferServiceError::Property(PropertyServiceError::BusinessRule(e)))?;

        // Save property changes
        property = self.property_service
            .update_property(property)
            .await?;

        Ok(TransferResponse {
            transfer_id: record.id(),
            property_id: property.id(),
            from_custodian: record.from_custodian().cloned(),
            to_custodian: record.to_custodian().to_string(),
            status: TransferStatus::Cancelled,
            timestamp: Utc::now(),
            blockchain_verification: Some(record.id().to_string()),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::property::repository::mock::MockPropertyRepository;

    #[tokio::test]
    async fn test_transfer_workflow() {
        // Setup
        let repository = Arc::new(MockPropertyRepository::new());
        let property_service = crate::domain::property::new_property_service(repository.clone());
        let qr_service = Arc::new(QRService::new(Arc::new(property_service.clone())));
        let authority_node = Arc::new(AuthorityNode::new(
            "TEST_UNIT".to_string(),
            // Add test keypair and certificate
        ));

        let transfer_service = TransferServiceImpl::new(
            Arc::new(property_service),
            qr_service.clone(),
            authority_node,
        );

        // Create test property
        let property = Property::new(
            "Test Item".to_string(),
            "Test Description".to_string(),
            Some("12345".to_string()),
            false,
            1,
            "Each".to_string(),
        ).unwrap();

        repository.create(property.clone()).await.unwrap();

        // Generate QR code
        let qr_data = qr_service.generate_property_qr(property.id()).await.unwrap();

        // Initiate transfer
        let result = transfer_service.initiate_transfer(
            InitiateTransferInput {
                qr_data,
                new_custodian: "NEW_CUSTODIAN".to_string(),
                location: Some("Building A".to_string()),
                notes: Some("Test transfer".to_string()),
            },
            "INITIATOR".to_string(),
        ).await;

        assert!(result.is_ok());
        let transfer = result.unwrap();
        assert_eq!(transfer.property_id, property.id());
        assert_eq!(transfer.status, TransferStatus::Pending);
    }
}
