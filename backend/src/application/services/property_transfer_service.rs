use std::sync::Arc;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use serde::{Serialize, Deserialize};

use crate::domain::{
    entities::property::{Property, PropertyStatus, Verification, VerificationMethod},
    repositories::property_repository::{PropertyRepository, RepositoryError},
};

/// Errors specific to property transfer operations
#[derive(Debug, thiserror::Error)]
pub enum TransferError {
    #[error("Repository error: {0}")]
    Repository(#[from] RepositoryError),

    #[error("Invalid QR code: {0}")]
    InvalidQRCode(String),

    #[error("Authorization error: {0}")]
    Authorization(String),

    #[error("Business rule violation: {0}")]
    BusinessRule(String),
}

/// Data encoded in property QR codes
#[derive(Debug, Serialize, Deserialize)]
pub struct PropertyQRData {
    pub property_id: Uuid,
    pub name: String,
    pub nsn: Option<String>,
    pub serial_number: Option<String>,
    pub is_sensitive: bool,
    pub current_custodian: Option<String>,
    pub timestamp: DateTime<Utc>,
}

/// Input for initiating a property transfer via QR code
#[derive(Debug)]
pub struct QRTransferInput {
    pub qr_data: String,
    pub new_custodian_id: String,
    pub location: Option<Location>,
    pub notes: Option<String>,
}

/// Response containing transfer details
#[derive(Debug, Serialize)]
pub struct TransferResponse {
    pub property: Property,
    pub transaction_id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub from_custodian: Option<String>,
    pub to_custodian: String,
    pub requires_commander_approval: bool,
}

/// Service for handling property transfers via mobile scanning
#[async_trait]
pub trait PropertyTransferService: Send + Sync {
    /// Process a property transfer initiated by QR code scan
    async fn process_qr_transfer(
        &self,
        input: QRTransferInput,
        verifier_id: String,
    ) -> Result<TransferResponse, TransferError>;

    /// Get all property currently signed for by a user
    async fn get_user_property(
        &self,
        user_id: &str,
    ) -> Result<Vec<Property>, TransferError>;

    /// Get transfer history for a user
    async fn get_user_transfer_history(
        &self,
        user_id: &str,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<TransferResponse>, TransferError>;

    /// Get pending transfers requiring commander approval
    async fn get_pending_commander_approvals(
        &self,
        commander_id: &str,
    ) -> Result<Vec<TransferResponse>, TransferError>;

    /// Approve or reject a transfer (for commanders)
    async fn process_commander_approval(
        &self,
        transfer_id: Uuid,
        commander_id: &str,
        approved: bool,
        notes: Option<String>,
    ) -> Result<TransferResponse, TransferError>;

    /// Generate QR code data for a property item
    async fn generate_property_qr(
        &self,
        property_id: Uuid,
    ) -> Result<String, TransferError>;
}

pub struct PropertyTransferServiceImpl {
    repository: Arc<dyn PropertyRepository>,
}

impl PropertyTransferServiceImpl {
    pub fn new(repository: Arc<dyn PropertyRepository>) -> Self {
        Self { repository }
    }

    /// Validates if a transfer requires commander approval
    fn requires_commander_approval(&self, property: &Property) -> bool {
        property.is_sensitive() || property.metadata().get("value").map_or(false, |v| {
            v.parse::<i32>().map_or(false, |value| value > 5000)
        })
    }

    /// Decodes and validates QR code data
    fn decode_qr_data(&self, qr_data: &str) -> Result<PropertyQRData, TransferError> {
        serde_json::from_str(qr_data).map_err(|e| {
            TransferError::InvalidQRCode(format!("Invalid QR code format: {}", e))
        })
    }
}

#[async_trait]
impl PropertyTransferService for PropertyTransferServiceImpl {
    async fn process_qr_transfer(
        &self,
        input: QRTransferInput,
        verifier_id: String,
    ) -> Result<TransferResponse, TransferError> {
        // Decode QR data
        let qr_data = self.decode_qr_data(&input.qr_data)?;

        // Start transaction
        let mut transaction = self.repository.begin_transaction().await?;

        // Get property
        let mut property = self.repository.get_by_id(qr_data.property_id).await?;

        // Validate current status
        if matches!(property.status(), PropertyStatus::Deleted | PropertyStatus::Archived) {
            return Err(TransferError::BusinessRule(
                "Cannot transfer deleted or archived property".to_string()
            ));
        }

        // Check if commander approval is needed
        let requires_approval = self.requires_commander_approval(&property);

        // Create transfer record
        let transaction_id = Uuid::new_v4();
        let from_custodian = property.custodian().cloned();

        // Update property custody
        property.transfer_custody(
            input.new_custodian_id.clone(),
            Some(transaction_id.to_string()),
        ).map_err(|e| TransferError::BusinessRule(e))?;

        // Add verification record
        property.verify(Verification {
            timestamp: Utc::now(),
            verifier: verifier_id,
            method: VerificationMethod::QrCode,
            location: input.location,
            condition_code: None,
            notes: input.notes,
        }).map_err(|e| TransferError::BusinessRule(e))?;

        // Save changes
        let property = transaction.update(property).await?;
        transaction.commit().await?;

        Ok(TransferResponse {
            property,
            transaction_id,
            timestamp: Utc::now(),
            from_custodian,
            to_custodian: input.new_custodian_id,
            requires_commander_approval: requires_approval,
        })
    }

    async fn get_user_property(
        &self,
        user_id: &str,
    ) -> Result<Vec<Property>, TransferError> {
        self.repository.get_by_custodian(user_id).await
            .map_err(TransferError::Repository)
    }

    async fn get_user_transfer_history(
        &self,
        user_id: &str,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<TransferResponse>, TransferError> {
        // Get all property where user was either sender or receiver
        let mut transfers = Vec::new();
        
        // Get property currently or previously held by user
        let properties = self.repository.get_by_custodian(user_id).await?;
        
        for property in properties {
            // Look through verification history for transfers
            for verification in property.verifications() {
                if verification.method == VerificationMethod::QrCode {
                    transfers.push(TransferResponse {
                        property: property.clone(),
                        transaction_id: Uuid::new_v4(), // In real impl, get from transfer record
                        timestamp: verification.timestamp,
                        from_custodian: Some(user_id.to_string()),
                        to_custodian: verification.verifier.clone(),
                        requires_commander_approval: self.requires_commander_approval(&property),
                    });
                }
            }
        }

        // Sort by timestamp descending
        transfers.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        // Apply pagination
        let start = offset.unwrap_or(0) as usize;
        let end = start + limit.unwrap_or(50) as usize;
        
        Ok(transfers.into_iter().skip(start).take(end - start).collect())
    }

    async fn get_pending_commander_approvals(
        &self,
        commander_id: &str,
    ) -> Result<Vec<TransferResponse>, TransferError> {
        // Get all sensitive items and high-value items pending approval
        let properties = self.repository.search(
            PropertySearchCriteria {
                status: Some(PropertyStatus::InTransit),
                ..Default::default()
            }
        ).await?;

        let mut pending_approvals = Vec::new();
        
        for property in properties {
            if self.requires_commander_approval(&property) {
                // Get latest transfer from verifications
                if let Some(verification) = property.verifications().last() {
                    pending_approvals.push(TransferResponse {
                        property: property.clone(),
                        transaction_id: Uuid::new_v4(), // In real impl, get from transfer record
                        timestamp: verification.timestamp,
                        from_custodian: property.custodian().cloned(),
                        to_custodian: verification.verifier.clone(),
                        requires_commander_approval: true,
                    });
                }
            }
        }

        Ok(pending_approvals)
    }

    async fn process_commander_approval(
        &self,
        transfer_id: Uuid,
        commander_id: &str,
        approved: bool,
        notes: Option<String>,
    ) -> Result<TransferResponse, TransferError> {
        let mut transaction = self.repository.begin_transaction().await?;

        // Get property from transfer record
        let mut property = self.repository.get_by_id(transfer_id).await?;

        if approved {
            // Update status to Active
            property.change_status(PropertyStatus::Active);
        } else {
            // Revert transfer
            if let Some(last_verification) = property.verifications().last() {
                property.transfer_custody(
                    last_verification.verifier.clone(),
                    None,
                ).map_err(|e| TransferError::BusinessRule(e))?;
            }
        }

        // Add commander's verification
        property.verify(Verification {
            timestamp: Utc::now(),
            verifier: commander_id.to_string(),
            method: VerificationMethod::ManualCheck,
            location: None,
            condition_code: None,
            notes,
        }).map_err(|e| TransferError::BusinessRule(e))?;

        // Save changes
        let property = transaction.update(property).await?;
        transaction.commit().await?;

        Ok(TransferResponse {
            property: property.clone(),
            transaction_id: transfer_id,
            timestamp: Utc::now(),
            from_custodian: property.custodian().cloned(),
            to_custodian: commander_id.to_string(),
            requires_commander_approval: false, // Already approved
        })
    }

    async fn generate_property_qr(
        &self,
        property_id: Uuid,
    ) -> Result<String, TransferError> {
        let property = self.repository.get_by_id(property_id).await?;

        let qr_data = PropertyQRData {
            property_id: property.id(),
            name: property.name().to_string(),
            nsn: property.nsn().cloned(),
            serial_number: property.serial_number().cloned(),
            is_sensitive: property.is_sensitive(),
            current_custodian: property.custodian().cloned(),
            timestamp: Utc::now(),
        };

        serde_json::to_string(&qr_data)
            .map_err(|e| TransferError::BusinessRule(format!("Failed to generate QR data: {}", e)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::repositories::property_repository::mock::MockPropertyRepository;

    #[tokio::test]
    async fn test_qr_transfer() {
        let repository = Arc::new(MockPropertyRepository::new());
        let service = PropertyTransferServiceImpl::new(repository.clone());

        // Create test property
        let property = Property::new(
            "Test Item".to_string(),
            "Test Description".to_string(),
            PropertyCategory::Equipment,
            false,
            1,
        ).unwrap();

        let property = repository.create(property).await.unwrap();

        // Generate QR code
        let qr_data = service.generate_property_qr(property.id()).await.unwrap();

        // Process transfer
        let result = service.process_qr_transfer(
            QRTransferInput {
                qr_data,
                new_custodian_id: "NEW_USER".to_string(),
                location: None,
                notes: None,
            },
            "VERIFIER".to_string(),
        ).await;

        assert!(result.is_ok());
        let transfer = result.unwrap();
        assert_eq!(transfer.to_custodian, "NEW_USER");
    }
}
