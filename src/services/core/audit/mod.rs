mod chain;
mod logging;

use std::sync::Arc;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};

use crate::services::infrastructure::database::DatabaseService;
use crate::core::SecurityContext;

pub use self::chain::{AuditChain, AuditEntry, ChainManager};
pub use self::logging::{AuditLog, AuditLogger, AuditEventType, AuditSeverity};

#[derive(Debug)]
pub struct AuditManager {
    database: Arc<DatabaseService>,
    chain_manager: Arc<ChainManager>,
    logger: Arc<AuditLogger>,
}

impl AuditManager {
    pub fn new(database: Arc<DatabaseService>) -> Self {
        let chain_manager = Arc::new(ChainManager::new(database.clone()));
        let logger = Arc::new(AuditLogger::new(database.clone(), chain_manager.clone()));
        
        Self {
            database,
            chain_manager,
            logger,
        }
    }

    pub async fn log_asset_transfer(
        &self,
        asset_id: Uuid,
        from_user: Uuid,
        to_user: Uuid,
        context: &SecurityContext,
        metadata: Option<serde_json::Value>,
    ) -> Result<Uuid, AuditError> {
        self.logger.log_event(
            AuditEventType::AssetTransfer,
            AuditSeverity::High,
            serde_json::json!({
                "asset_id": asset_id,
                "from_user": from_user,
                "to_user": to_user,
                "action": "transfer_initiated"
            }),
            context,
            metadata,
        ).await
    }

    pub async fn log_security_event(
        &self,
        event_type: &str,
        severity: AuditSeverity,
        details: serde_json::Value,
        context: &SecurityContext,
    ) -> Result<Uuid, AuditError> {
        self.logger.log_event(
            AuditEventType::SecurityCheck,
            severity,
            details,
            context,
            None,
        ).await
    }

    pub async fn log_location_update(
        &self,
        asset_id: Uuid,
        latitude: f64,
        longitude: f64,
        context: &SecurityContext,
    ) -> Result<Uuid, AuditError> {
        self.logger.log_event(
            AuditEventType::LocationUpdate,
            AuditSeverity::Info,
            serde_json::json!({
                "asset_id": asset_id,
                "latitude": latitude,
                "longitude": longitude,
                "timestamp": Utc::now()
            }),
            context,
            None,
        ).await
    }

    pub async fn get_asset_audit_trail(
        &self,
        asset_id: Uuid,
        start_time: Option<DateTime<Utc>>,
        end_time: Option<DateTime<Utc>>,
    ) -> Result<Vec<AuditLog>, AuditError> {
        let filters = logging::AuditLogFilters {
            event_types: None,
            severity: None,
            start_time,
            end_time,
            limit: None,
            asset_id: Some(asset_id),
        };

        self.logger.get_logs(filters).await
    }

    pub async fn verify_audit_chain(&self) -> Result<bool, AuditError> {
        let current_chain = self.chain_manager.get_current_chain().await?;
        
        // Verify chain integrity
        let mut previous_hash = current_chain.previous_hash.clone();
        for entry in current_chain.entries.iter() {
            let calculated_hash = self.chain_manager.calculate_chain_hash(
                &current_chain,
                entry,
            )?;
            
            if let Some(prev) = previous_hash {
                if prev != calculated_hash {
                    return Ok(false);
                }
            }
            
            previous_hash = Some(calculated_hash);
        }
        
        Ok(true)
    }
}

#[derive(Debug, thiserror::Error)]
pub enum AuditError {
    #[error("Database error: {0}")]
    Database(String),
    
    #[error("Chain verification failed: {0}")]
    ChainVerification(String),
    
    #[error("Logging error: {0}")]
    Logging(String),
    
    #[error("Invalid data: {0}")]
    InvalidData(String),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_audit_manager() {
        let database = Arc::new(DatabaseService::new().await.unwrap());
        let manager = AuditManager::new(database);

        let context = SecurityContext::new_test();
        let asset_id = Uuid::new_v4();
        let from_user = Uuid::new_v4();
        let to_user = Uuid::new_v4();

        // Test asset transfer logging
        let log_id = manager.log_asset_transfer(
            asset_id,
            from_user,
            to_user,
            &context,
            None,
        ).await.unwrap();

        // Test audit trail retrieval
        let logs = manager.get_asset_audit_trail(
            asset_id,
            None,
            None,
        ).await.unwrap();

        assert!(!logs.is_empty());
        assert_eq!(logs[0].id, log_id);

        // Test chain verification
        assert!(manager.verify_audit_chain().await.unwrap());
    }
} 