// backend/src/security/audit/mod.rs

pub mod logger;
pub mod trail;
pub mod chain;
pub mod validator;

use std::sync::Arc;
use deadpool_postgres::Pool;
pub use logger::{AuditError, AuditEvent, AuditEventType, AuditSeverity, AuditLogger};
pub use trail::{AuditTrail, AuditTrailManager, TrailStatus};
pub use chain::AuditChain;
pub use validator::AuditValidator;

/// Main audit service that coordinates logging, trails, and validation
pub struct AuditService {
    logger: Arc<AuditLogger>,
    trail_manager: Arc<AuditTrailManager>,
    validator: Arc<AuditValidator>,
}

impl AuditService {
    pub fn new(db_pool: Arc<Pool>) -> Self {
        Self {
            logger: Arc::new(AuditLogger::new(db_pool.clone())),
            trail_manager: Arc::new(AuditTrailManager::new(db_pool.clone())),
            validator: Arc::new(AuditValidator::new(db_pool)),
        }
    }

    /// Log an event and optionally add it to a trail
    pub async fn log_event(
        &self,
        event_type: AuditEventType,
        severity: AuditSeverity,
        user_id: Option<uuid::Uuid>,
        resource_id: Option<String>,
        action: String,
        status: String,
        details: serde_json::Value,
        metadata: Option<serde_json::Value>,
        trail_id: Option<uuid::Uuid>,
    ) -> Result<uuid::Uuid, AuditError> {
        // Log the event
        let event_id = self.logger.log_event(
            event_type,
            severity,
            user_id,
            resource_id,
            action,
            status,
            details,
            metadata,
        ).await?;

        // Add to trail if specified
        if let Some(trail_id) = trail_id {
            self.trail_manager.add_event(trail_id, event_id).await?;
        }

        Ok(event_id)
    }

    /// Start a new audit trail
    pub async fn start_trail(
        &self,
        resource_id: String,
        user_id: Option<uuid::Uuid>,
        operation_type: String,
        metadata: serde_json::Value,
    ) -> Result<uuid::Uuid, AuditError> {
        self.trail_manager.start_trail(
            resource_id,
            user_id,
            operation_type,
            metadata,
        ).await
    }

    /// Complete an audit trail
    pub async fn complete_trail(
        &self,
        trail_id: uuid::Uuid,
        status: TrailStatus,
    ) -> Result<(), AuditError> {
        self.trail_manager.complete_trail(trail_id, status).await
    }

    /// Analyze a trail for suspicious patterns
    pub async fn analyze_trail(&self, trail_id: uuid::Uuid) -> Result<TrailStatus, AuditError> {
        self.trail_manager.analyze_trail(trail_id).await
    }

    /// Verify the integrity of the audit chain
    pub async fn verify_chain(&self) -> Result<bool, AuditError> {
        self.logger.verify_chain().await
    }

    /// Validate a specific audit trail
    pub async fn validate_trail(&self, trail_id: uuid::Uuid) -> Result<bool, AuditError> {
        self.validator.validate_trail(trail_id).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use deadpool_postgres::Config;
    use tokio_postgres::NoTls;

    async fn create_test_pool() -> Arc<Pool> {
        let mut cfg = Config::new();
        cfg.host = Some("localhost".to_string());
        cfg.dbname = Some("test_db".to_string());
        cfg.user = Some("test_user".to_string());
        cfg.password = Some("test_password".to_string());
        
        Arc::new(cfg.create_pool(NoTls).unwrap())
    }

    #[tokio::test]
    async fn test_audit_service() {
        let pool = create_test_pool().await;
        let service = AuditService::new(pool);

        // Start a trail
        let trail_id = service
            .start_trail(
                "test_resource".to_string(),
                None,
                "test_operation".to_string(),
                serde_json::json!({}),
            )
            .await
            .unwrap();

        // Log an event in the trail
        let event_id = service
            .log_event(
                AuditEventType::DataAccess,
                AuditSeverity::Info,
                None,
                Some("test_resource".to_string()),
                "read".to_string(),
                "success".to_string(),
                serde_json::json!({}),
                None,
                Some(trail_id),
            )
            .await
            .unwrap();

        assert!(!event_id.is_nil());

        // Complete the trail
        service
            .complete_trail(trail_id, TrailStatus::Completed)
            .await
            .unwrap();

        // Verify chain integrity
        assert!(service.verify_chain().await.unwrap());
    }
}
