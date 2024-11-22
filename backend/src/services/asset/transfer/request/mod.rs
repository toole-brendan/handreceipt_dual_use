use crate::core::security::SecurityContext;
use crate::infrastructure::database::DatabaseService;
use crate::asset::transfer::validation::{Transfer, TransferValidator};

pub struct TransferRequest {
    pub id: String,
    pub asset_id: String,
    pub requester: String,
    pub source_location: String,
    pub destination_location: String,
    pub status: TransferStatus,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, PartialEq)]
pub enum TransferStatus {
    Pending,
    Validated,
    InProgress,
    Completed,
    Failed,
    Cancelled,
}

pub struct TransferRequestManager {
    db: DatabaseService,
    validator: TransferValidator,
}

impl TransferRequestManager {
    pub fn new(db: DatabaseService) -> Self {
        let validator = TransferValidator::new(db.clone());
        Self { db, validator }
    }

    pub async fn create_request(
        &self,
        asset_id: String,
        destination: String,
        security_context: &SecurityContext,
    ) -> Result<TransferRequest, TransferError> {
        let request = TransferRequest {
            id: uuid::Uuid::new_v4().to_string(),
            asset_id,
            requester: security_context.user_id.clone(),
            source_location: security_context.location.clone(),
            destination_location: destination,
            status: TransferStatus::Pending,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        };

        self.db.save_transfer_request(&request).await
            .map_err(|e| TransferError::DatabaseError(e.to_string()))?;

        Ok(request)
    }

    pub async fn validate_request(&self, request_id: &str) -> Result<(), TransferError> {
        let mut request = self.db.get_transfer_request(request_id).await
            .map_err(|e| TransferError::DatabaseError(e.to_string()))?;

        let validation = self.validator.validate_transfer(request_id).await
            .map_err(|e| TransferError::ValidationError(e.to_string()))?;

        if validation.is_valid {
            request.status = TransferStatus::Validated;
            request.updated_at = chrono::Utc::now();

            self.db.update_transfer_request(&request).await
                .map_err(|e| TransferError::DatabaseError(e.to_string()))?;
        }

        Ok(())
    }

    pub async fn complete_transfer(&self, request_id: &str) -> Result<(), TransferError> {
        let mut request = self.db.get_transfer_request(request_id).await
            .map_err(|e| TransferError::DatabaseError(e.to_string()))?;

        if request.status != TransferStatus::Validated {
            return Err(TransferError::InvalidState("Transfer not validated".to_string()));
        }

        request.status = TransferStatus::Completed;
        request.updated_at = chrono::Utc::now();

        self.db.update_transfer_request(&request).await
            .map_err(|e| TransferError::DatabaseError(e.to_string()))?;

        Ok(())
    }
}

#[derive(Debug)]
pub enum TransferError {
    ValidationError(String),
    DatabaseError(String),
    InvalidState(String),
    AuthorizationError(String),
}
