use std::sync::Arc;
use uuid::Uuid;
use serde::{Serialize, Deserialize};
use crate::services::{
    infrastructure::database::DatabaseService,
    core::{
        security::{SecurityManager, SecurityContext},
        audit::AuditManager,
    },
    asset::tracking::location::LocationTracker,
};
use super::request::{TransferRequest, TransferError};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub checks: Vec<ValidationCheck>,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationCheck {
    pub check_type: String,
    pub passed: bool,
    pub message: Option<String>,
    pub severity: ValidationSeverity,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum ValidationSeverity {
    Critical,
    Warning,
    Info,
}

pub struct TransferValidator {
    database: Arc<DatabaseService>,
    security: Arc<SecurityManager>,
    audit: Arc<AuditManager>,
    location_tracker: Arc<LocationTracker>,
}

impl TransferValidator {
    pub fn new(
        database: Arc<DatabaseService>,
        security: Arc<SecurityManager>,
        audit: Arc<AuditManager>,
        location_tracker: Arc<LocationTracker>,
    ) -> Self {
        Self {
            database,
            security,
            audit,
            location_tracker,
        }
    }

    pub async fn validate_transfer(
        &self,
        request: &TransferRequest,
        context: &SecurityContext,
    ) -> Result<ValidationResult, ValidationError> {
        let mut checks = Vec::new();
        let mut is_valid = true;

        // Asset existence check
        let asset_check = self.validate_asset_exists(request.asset_id).await?;
        if !asset_check.passed {
            is_valid = false;
        }
        checks.push(asset_check);

        // Security clearance check
        let security_check = self.validate_security_clearance(request, context).await?;
        if !security_check.passed {
            is_valid = false;
        }
        checks.push(security_check);

        // Location check
        let location_check = self.validate_asset_location(request.asset_id).await?;
        if !location_check.passed && location_check.severity == ValidationSeverity::Critical {
            is_valid = false;
        }
        checks.push(location_check);

        // User authorization check
        let auth_check = self.validate_user_authorization(request).await?;
        if !auth_check.passed {
            is_valid = false;
        }
        checks.push(auth_check);

        let metadata = self.collect_validation_metadata(request, &checks).await?;

        Ok(ValidationResult {
            is_valid,
            checks,
            metadata,
        })
    }

    async fn validate_asset_exists(&self, asset_id: Uuid) -> Result<ValidationCheck, ValidationError> {
        let exists = self.database.asset_exists(asset_id)
            .await
            .map_err(|e| ValidationError::Database(e.to_string()))?;

        Ok(ValidationCheck {
            check_type: "asset_existence".to_string(),
            passed: exists,
            message: if !exists {
                Some(format!("Asset {} not found", asset_id))
            } else {
                None
            },
            severity: ValidationSeverity::Critical,
        })
    }

    async fn validate_security_clearance(
        &self,
        request: &TransferRequest,
        context: &SecurityContext,
    ) -> Result<ValidationCheck, ValidationError> {
        let clearance_valid = self.security.validate_transfer_clearance(
            request.asset_id,
            request.from_user,
            request.to_user,
            context,
        ).await.map_err(|e| ValidationError::Security(e.to_string()))?;

        Ok(ValidationCheck {
            check_type: "security_clearance".to_string(),
            passed: clearance_valid,
            message: if !clearance_valid {
                Some("Insufficient security clearance".to_string())
            } else {
                None
            },
            severity: ValidationSeverity::Critical,
        })
    }

    async fn validate_asset_location(
        &self,
        asset_id: Uuid,
    ) -> Result<ValidationCheck, ValidationError> {
        let location = self.location_tracker.track_asset(asset_id)
            .await
            .map_err(|e| ValidationError::Location(e.to_string()))?;

        // Check if location is within allowed transfer zones
        let in_transfer_zone = self.database.check_transfer_zone_compliance(&location)
            .await
            .map_err(|e| ValidationError::Database(e.to_string()))?;

        Ok(ValidationCheck {
            check_type: "location_compliance".to_string(),
            passed: in_transfer_zone,
            message: if !in_transfer_zone {
                Some("Asset not in authorized transfer zone".to_string())
            } else {
                None
            },
            severity: ValidationSeverity::Warning,
        })
    }

    async fn validate_user_authorization(
        &self,
        request: &TransferRequest,
    ) -> Result<ValidationCheck, ValidationError> {
        let from_user_authorized = self.security.check_user_authorization(
            request.from_user,
            "TRANSFER_ASSET",
        ).await.map_err(|e| ValidationError::Security(e.to_string()))?;

        let to_user_authorized = self.security.check_user_authorization(
            request.to_user,
            "RECEIVE_ASSET",
        ).await.map_err(|e| ValidationError::Security(e.to_string()))?;

        Ok(ValidationCheck {
            check_type: "user_authorization".to_string(),
            passed: from_user_authorized && to_user_authorized,
            message: if !from_user_authorized {
                Some("Source user not authorized".to_string())
            } else if !to_user_authorized {
                Some("Target user not authorized".to_string())
            } else {
                None
            },
            severity: ValidationSeverity::Critical,
        })
    }

    async fn collect_validation_metadata(
        &self,
        request: &TransferRequest,
        checks: &[ValidationCheck],
    ) -> Result<serde_json::Value, ValidationError> {
        Ok(serde_json::json!({
            "request_id": request.id,
            "validation_time": chrono::Utc::now(),
            "total_checks": checks.len(),
            "failed_checks": checks.iter().filter(|c| !c.passed).count(),
            "critical_failures": checks.iter()
                .filter(|c| !c.passed && c.severity == ValidationSeverity::Critical)
                .count(),
        }))
    }
}

#[derive(Debug, thiserror::Error)]
pub enum ValidationError {
    #[error("Database error: {0}")]
    Database(String),

    #[error("Security error: {0}")]
    Security(String),

    #[error("Location error: {0}")]
    Location(String),

    #[error("Invalid request: {0}")]
    InvalidRequest(String),
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[tokio::test]
    async fn test_transfer_validation() {
        let database = Arc::new(DatabaseService::new().await.unwrap());
        let security = Arc::new(SecurityManager::new());
        let audit = Arc::new(AuditManager::new(database.clone()));
        let location_tracker = Arc::new(LocationTracker::new(database.clone()));

        let validator = TransferValidator::new(
            database,
            security,
            audit,
            location_tracker,
        );

        let request = TransferRequest {
            id: Uuid::new_v4(),
            asset_id: Uuid::new_v4(),
            from_user: Uuid::new_v4(),
            to_user: Uuid::new_v4(),
            status: super::super::request::TransferStatus::Pending,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            metadata: serde_json::json!({}),
        };

        let context = SecurityContext::new_test();
        let result = validator.validate_transfer(&request, &context).await.unwrap();

        // In test environment, some checks might fail due to missing data
        assert!(!result.is_valid);
        assert!(!result.checks.is_empty());
    }
} 