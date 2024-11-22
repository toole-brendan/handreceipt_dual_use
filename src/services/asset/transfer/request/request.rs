use std::sync::Arc;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use crate::services::{
    infrastructure::database::DatabaseService,
    core::{
        audit::AuditManager,
        security::{SecurityManager, SecurityContext},
    },
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferRequest {
    pub id: Uuid,
    pub asset_id: Uuid,
    pub from_user: Uuid,
    pub to_user: Uuid,
    pub status: TransferStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum TransferStatus {
    Pending,
    Approved,
    Rejected,
    Completed,
    Cancelled,
}

pub struct RequestManager {
    database: Arc<DatabaseService>,
    security: Arc<SecurityManager>,
    audit: Arc<AuditManager>,
}

impl RequestManager {
    pub fn new(
        database: Arc<DatabaseService>,
        security: Arc<SecurityManager>,
        audit: Arc<AuditManager>,
    ) -> Self {
        Self {
            database,
            security,
            audit,
        }
    }

    pub async fn create_request(
        &self,
        asset_id: Uuid,
        from_user: Uuid,
        to_user: Uuid,
        context: &SecurityContext,
        metadata: Option<serde_json::Value>,
    ) -> Result<TransferRequest, TransferError> {
        // Verify permissions
        self.security.verify_transfer_permission(from_user, context)
            .await
            .map_err(|e| TransferError::Security(e.to_string()))?;

        let request = TransferRequest {
            id: Uuid::new_v4(),
            asset_id,
            from_user,
            to_user,
            status: TransferStatus::Pending,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            metadata: metadata.unwrap_or_else(|| serde_json::json!({})),
        };

        // Store in database
        self.database.create_transfer_request(&request)
            .await
            .map_err(|e| TransferError::Database(e.to_string()))?;

        // Audit log
        self.audit.log_transfer_request(&request, context)
            .await
            .map_err(|e| TransferError::Audit(e.to_string()))?;

        Ok(request)
    }

    pub async fn update_status(
        &self,
        request_id: Uuid,
        new_status: TransferStatus,
        context: &SecurityContext,
    ) -> Result<TransferRequest, TransferError> {
        let mut request = self.database.get_transfer_request(request_id)
            .await
            .map_err(|e| TransferError::Database(e.to_string()))?
            .ok_or_else(|| TransferError::NotFound(request_id))?;

        // Verify status transition is valid
        self.validate_status_transition(request.status, new_status)?;

        // Update request
        request.status = new_status;
        request.updated_at = Utc::now();

        // Store updated request
        self.database.update_transfer_request(&request)
            .await
            .map_err(|e| TransferError::Database(e.to_string()))?;

        // Audit log
        self.audit.log_transfer_status_change(&request, context)
            .await
            .map_err(|e| TransferError::Audit(e.to_string()))?;

        Ok(request)
    }

    fn validate_status_transition(
        &self,
        current: TransferStatus,
        new: TransferStatus,
    ) -> Result<(), TransferError> {
        use TransferStatus::*;

        match (current, new) {
            (Pending, Approved) | (Pending, Rejected) | (Pending, Cancelled) => Ok(()),
            (Approved, Completed) | (Approved, Cancelled) => Ok(()),
            _ => Err(TransferError::InvalidStatusTransition {
                from: current,
                to: new,
            }),
        }
    }
}

#[derive(Debug, thiserror::Error)]
pub enum TransferError {
    #[error("Database error: {0}")]
    Database(String),

    #[error("Security error: {0}")]
    Security(String),

    #[error("Audit error: {0}")]
    Audit(String),

    #[error("Transfer request not found: {0}")]
    NotFound(Uuid),

    #[error("Invalid status transition from {from:?} to {to:?}")]
    InvalidStatusTransition {
        from: TransferStatus,
        to: TransferStatus,
    },
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_transfer_request_flow() {
        let database = Arc::new(DatabaseService::new().await.unwrap());
        let security = Arc::new(SecurityManager::new());
        let audit = Arc::new(AuditManager::new(database.clone()));
        
        let manager = RequestManager::new(database, security, audit);
        let context = SecurityContext::new_test();

        // Test create request
        let from_user = Uuid::new_v4();
        let to_user = Uuid::new_v4();
        let asset_id = Uuid::new_v4();

        let request = manager.create_request(
            asset_id,
            from_user,
            to_user,
            &context,
            None,
        ).await.unwrap();

        assert_eq!(request.status, TransferStatus::Pending);

        // Test status update
        let updated = manager.update_status(
            request.id,
            TransferStatus::Approved,
            &context,
        ).await.unwrap();

        assert_eq!(updated.status, TransferStatus::Approved);

        // Test invalid transition
        let result = manager.update_status(
            request.id,
            TransferStatus::Pending,
            &context,
        ).await;

        assert!(matches!(result, Err(TransferError::InvalidStatusTransition { .. })));
    }
} 