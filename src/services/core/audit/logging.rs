use std::sync::Arc;
use uuid::Uuid;
use chrono::Utc;
use serde::{Serialize, Deserialize};
use crate::services::{
    infrastructure::database::DatabaseService,
    core::security::SecurityContext,
};
use super::{chain::{ChainManager, AuditEntry, AuditError}};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLog {
    pub id: Uuid,
    pub event_type: AuditEventType,
    pub severity: AuditSeverity,
    pub data: serde_json::Value,
    pub user_id: Option<Uuid>,
    pub timestamp: chrono::DateTime<Utc>,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AuditEventType {
    AssetTransfer,
    AssetScan,
    SecurityCheck,
    UserAction,
    SystemEvent,
    LocationUpdate,
    ValidationEvent,
    Custom(String),
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum AuditSeverity {
    Critical,
    High,
    Medium,
    Low,
    Info,
}

pub struct AuditLogger {
    database: Arc<DatabaseService>,
    chain_manager: Arc<ChainManager>,
}

impl AuditLogger {
    pub fn new(database: Arc<DatabaseService>, chain_manager: Arc<ChainManager>) -> Self {
        Self {
            database,
            chain_manager,
        }
    }

    pub async fn log_event(
        &self,
        event_type: AuditEventType,
        severity: AuditSeverity,
        data: serde_json::Value,
        context: &SecurityContext,
        metadata: Option<serde_json::Value>,
    ) -> Result<Uuid, AuditError> {
        let log = AuditLog {
            id: Uuid::new_v4(),
            event_type,
            severity,
            data,
            user_id: context.user_id(),
            timestamp: Utc::now(),
            metadata: metadata.unwrap_or_else(|| serde_json::json!({})),
        };

        // Store in database
        self.database.store_audit_log(&log)
            .await
            .map_err(|e| AuditError::Database(e.to_string()))?;

        // Add to audit chain
        let chain_entry = AuditEntry {
            id: log.id,
            event_type: format!("{:?}", log.event_type),
            data: log.data.clone(),
            timestamp: log.timestamp,
            user_id: log.user_id,
            metadata: log.metadata.clone(),
        };

        self.chain_manager.add_entry(chain_entry).await?;

        Ok(log.id)
    }

    pub async fn get_logs(
        &self,
        filters: AuditLogFilters,
    ) -> Result<Vec<AuditLog>, AuditError> {
        self.database.get_audit_logs(&filters)
            .await
            .map_err(|e| AuditError::Database(e.to_string()))
    }

    pub async fn get_log_by_id(&self, log_id: Uuid) -> Result<Option<AuditLog>, AuditError> {
        self.database.get_audit_log(log_id)
            .await
            .map_err(|e| AuditError::Database(e.to_string()))
    }
}

#[derive(Debug, Clone)]
pub struct AuditLogFilters {
    pub event_types: Option<Vec<AuditEventType>>,
    pub severity: Option<AuditSeverity>,
    pub user_id: Option<Uuid>,
    pub start_time: Option<chrono::DateTime<Utc>>,
    pub end_time: Option<chrono::DateTime<Utc>>,
    pub limit: Option<i64>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_audit_logging() {
        let database = Arc::new(DatabaseService::new().await.unwrap());
        let chain_manager = Arc::new(ChainManager::new(database.clone()));
        let logger = AuditLogger::new(database, chain_manager);

        let context = SecurityContext::new_test();
        
        // Test logging an event
        let log_id = logger.log_event(
            AuditEventType::AssetTransfer,
            AuditSeverity::High,
            serde_json::json!({
                "asset_id": Uuid::new_v4(),
                "action": "transfer_initiated"
            }),
            &context,
            None,
        ).await.unwrap();

        // Test retrieving the log
        let log = logger.get_log_by_id(log_id).await.unwrap().unwrap();
        assert_eq!(log.event_type, AuditEventType::AssetTransfer);
        assert_eq!(log.severity, AuditSeverity::High);

        // Test filtering logs
        let filters = AuditLogFilters {
            event_types: Some(vec![AuditEventType::AssetTransfer]),
            severity: Some(AuditSeverity::High),
            user_id: context.user_id(),
            start_time: None,
            end_time: None,
            limit: Some(10),
        };

        let logs = logger.get_logs(filters).await.unwrap();
        assert!(!logs.is_empty());
        assert_eq!(logs[0].id, log_id);
    }
} 