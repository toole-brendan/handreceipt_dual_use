// src/security/audit/logger.rs

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AuditError {
    #[error("Database error: {0}")]
    DatabaseError(String),
    #[error("Serialization error: {0}")]
    SerializationError(String),
    #[error("Chain validation error: {0}")]
    ChainValidationError(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditEventType {
    Authentication,
    Authorization,
    AssetTransfer,
    SystemConfig,
    SecurityAlert,
    DataAccess,
    KeyOperation,
    MfaEvent,
    BlockchainOperation,
    NetworkEvent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub event_type: AuditEventType,
    pub severity: AuditSeverity,
    pub user_id: Option<Uuid>,
    pub resource_id: Option<String>,
    pub action: String,
    pub status: String,
    pub details: serde_json::Value,
    pub metadata: serde_json::Value,
    pub previous_hash: Option<String>,
    pub hash: Option<String>,
}

pub struct AuditLogger {
    events: Arc<RwLock<Vec<AuditEvent>>>,
    db_pool: Arc<deadpool_postgres::Pool>,
}

impl AuditLogger {
    pub fn new(db_pool: Arc<deadpool_postgres::Pool>) -> Self {
        Self {
            events: Arc::new(RwLock::new(Vec::new())),
            db_pool,
        }
    }

    /// Log an audit event
    pub async fn log_event(
        &self,
        event_type: AuditEventType,
        severity: AuditSeverity,
        user_id: Option<Uuid>,
        resource_id: Option<String>,
        action: String,
        status: String,
        details: serde_json::Value,
        metadata: Option<serde_json::Value>,
    ) -> Result<Uuid, AuditError> {
        let event_id = Uuid::new_v4();
        let previous_hash = self.get_last_event_hash().await?;
        
        let event = AuditEvent {
            id: event_id,
            timestamp: Utc::now(),
            event_type,
            severity,
            user_id,
            resource_id,
            action,
            status,
            details,
            metadata: metadata.unwrap_or(serde_json::Value::Null),
            previous_hash,
            hash: None, // Will be computed before storage
        };

        // Compute hash including previous hash
        let hash = self.compute_event_hash(&event)?;
        let mut event = event;
        event.hash = Some(hash);

        // Store in memory buffer
        self.events.write().await.push(event.clone());

        // Persist to database
        self.persist_event(&event).await?;

        Ok(event_id)
    }

    /// Get the hash of the last event in the chain
    async fn get_last_event_hash(&self) -> Result<Option<String>, AuditError> {
        let client = self.db_pool.get().await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        let row = client
            .query_opt(
                "SELECT hash FROM audit_events ORDER BY timestamp DESC LIMIT 1",
                &[],
            )
            .await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        Ok(row.and_then(|r| r.get(0)))
    }

    /// Compute hash for an audit event
    fn compute_event_hash(&self, event: &AuditEvent) -> Result<String, AuditError> {
        use sha2::{Sha256, Digest};
        
        let event_json = serde_json::to_string(&event)
            .map_err(|e| AuditError::SerializationError(e.to_string()))?;
        
        let mut hasher = Sha256::new();
        if let Some(prev_hash) = &event.previous_hash {
            hasher.update(prev_hash.as_bytes());
        }
        hasher.update(event_json.as_bytes());
        
        Ok(format!("{:x}", hasher.finalize()))
    }

    /// Persist an audit event to the database
    async fn persist_event(&self, event: &AuditEvent) -> Result<(), AuditError> {
        let client = self.db_pool.get().await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        client
            .execute(
                "INSERT INTO audit_events (
                    id, timestamp, event_type, severity, user_id, resource_id,
                    action, status, details, metadata, previous_hash, hash
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
                &[
                    &event.id,
                    &event.timestamp,
                    &serde_json::to_value(&event.event_type).unwrap(),
                    &serde_json::to_value(&event.severity).unwrap(),
                    &event.user_id,
                    &event.resource_id,
                    &event.action,
                    &event.status,
                    &event.details,
                    &event.metadata,
                    &event.previous_hash,
                    &event.hash,
                ],
            )
            .await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    /// Verify the integrity of the audit chain
    pub async fn verify_chain(&self) -> Result<bool, AuditError> {
        let client = self.db_pool.get().await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        let rows = client
            .query("SELECT * FROM audit_events ORDER BY timestamp", &[])
            .await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        let mut previous_hash: Option<String> = None;

        for row in rows {
            let event: AuditEvent = self.row_to_event(&row)?;
            
            // Verify hash chain
            if event.previous_hash != previous_hash {
                return Ok(false);
            }

            // Verify event hash
            let computed_hash = self.compute_event_hash(&event)?;
            if Some(computed_hash) != event.hash {
                return Ok(false);
            }

            previous_hash = event.hash.clone();
        }

        Ok(true)
    }

    /// Convert a database row to an AuditEvent
    fn row_to_event(&self, row: &tokio_postgres::Row) -> Result<AuditEvent, AuditError> {
        Ok(AuditEvent {
            id: row.get("id"),
            timestamp: row.get("timestamp"),
            event_type: serde_json::from_value(row.get("event_type"))
                .map_err(|e| AuditError::SerializationError(e.to_string()))?,
            severity: serde_json::from_value(row.get("severity"))
                .map_err(|e| AuditError::SerializationError(e.to_string()))?,
            user_id: row.get("user_id"),
            resource_id: row.get("resource_id"),
            action: row.get("action"),
            status: row.get("status"),
            details: row.get("details"),
            metadata: row.get("metadata"),
            previous_hash: row.get("previous_hash"),
            hash: row.get("hash"),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use deadpool_postgres::Config;
    use tokio_postgres::NoTls;

    async fn create_test_pool() -> Arc<deadpool_postgres::Pool> {
        let mut cfg = Config::new();
        cfg.host = Some("localhost".to_string());
        cfg.dbname = Some("test_db".to_string());
        cfg.user = Some("test_user".to_string());
        cfg.password = Some("test_password".to_string());
        
        Arc::new(cfg.create_pool(NoTls).unwrap())
    }

    #[tokio::test]
    async fn test_audit_logging() {
        let pool = create_test_pool().await;
        let logger = AuditLogger::new(pool);

        let event_id = logger
            .log_event(
                AuditEventType::Authentication,
                AuditSeverity::Info,
                Some(Uuid::new_v4()),
                None,
                "login".to_string(),
                "success".to_string(),
                serde_json::json!({"ip": "127.0.0.1"}),
                None,
            )
            .await
            .unwrap();

        assert!(!event_id.is_nil());
    }

    #[tokio::test]
    async fn test_chain_verification() {
        let pool = create_test_pool().await;
        let logger = AuditLogger::new(pool);

        // Log multiple events
        for _ in 0..3 {
            logger
                .log_event(
                    AuditEventType::DataAccess,
                    AuditSeverity::Info,
                    None,
                    None,
                    "read".to_string(),
                    "success".to_string(),
                    serde_json::json!({}),
                    None,
                )
                .await
                .unwrap();
        }

        assert!(logger.verify_chain().await.unwrap());
    }
}