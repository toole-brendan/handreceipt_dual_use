pub mod chain;
pub mod logger;
pub mod trail;
pub mod validator;

pub use chain::AuditChain;
pub use logger::AuditLogger;
pub use trail::AuditTrail;
pub use validator::AuditValidator;

use crate::services::infrastructure::database::DatabaseService;
use crate::types::{
    audit::{AuditEvent, AuditStatus, AuditEventType},
    error::CoreError,
};
use chrono::{DateTime, Utc};
use std::sync::Arc;

pub struct AuditManager {
    db: Arc<DatabaseService>,
}

impl AuditManager {
    pub fn new(db: DatabaseService) -> Self {
        Self {
            db: Arc::new(db),
        }
    }

    pub async fn log_event(
        &self,
        event_type: &str,
        action: &str,
        status: AuditStatus,
        details: serde_json::Value,
    ) -> Result<(), CoreError> {
        let event = AuditEvent::new(
            event_type.to_string(),
            action.to_string(),
            status,
            details,
        );

        self.store_event(&event).await
    }

    pub async fn log_user_event(
        &self,
        user_id: &str,
        event_type: &str,
        action: &str,
        status: AuditStatus,
        details: serde_json::Value,
    ) -> Result<(), CoreError> {
        let event = AuditEvent::new(
            event_type.to_string(),
            action.to_string(),
            status,
            details,
        ).with_user(user_id.to_string());

        self.store_event(&event).await
    }

    pub async fn log_resource_event(
        &self,
        resource_id: &str,
        event_type: &str,
        action: &str,
        status: AuditStatus,
        details: serde_json::Value,
    ) -> Result<(), CoreError> {
        let event = AuditEvent::new(
            event_type.to_string(),
            action.to_string(),
            status,
            details,
        ).with_resource(resource_id.to_string());

        self.store_event(&event).await
    }

    async fn store_event(&self, event: &AuditEvent) -> Result<(), CoreError> {
        // Store the event in the database
        let query = "INSERT INTO audit_events (id, timestamp, event_type, user_id, resource_id, action, status, details) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
        
        self.db.execute(query, &[
            &event.id,
            &event.timestamp,
            &event.event_type,
            &event.user_id,
            &event.resource_id,
            &event.action,
            &serde_json::to_value(&event.status)
                .map_err(|e| CoreError::ValidationError(e.to_string()))?,
            &event.details,
        ])
        .await
        .map_err(|e| CoreError::Database(e.to_string()))?;

        Ok(())
    }

    pub async fn get_events(
        &self,
        from: DateTime<Utc>,
        to: DateTime<Utc>,
        event_type: Option<&str>,
    ) -> Result<Vec<AuditEvent>, CoreError> {
        let query = match event_type {
            Some(_) => "SELECT * FROM audit_events WHERE timestamp >= $1 AND timestamp <= $2 AND event_type = $3",
            None => "SELECT * FROM audit_events WHERE timestamp >= $1 AND timestamp <= $2",
        };

        let rows = match event_type {
            Some(et) => self.db.query(query, &[&from, &to, &et]),
            None => self.db.query(query, &[&from, &to]),
        }
        .await
        .map_err(|e| CoreError::Database(e.to_string()))?;

        let events = rows
            .iter()
            .map(|row| AuditEvent {
                id: row.get("id"),
                timestamp: row.get("timestamp"),
                event_type: row.get("event_type"),
                user_id: row.get("user_id"),
                resource_id: row.get("resource_id"),
                action: row.get("action"),
                status: serde_json::from_value(row.get("status"))
                    .map_err(|e| CoreError::ValidationError(e.to_string()))
                    .unwrap_or(AuditStatus::Warning),
                details: row.get("details"),
            })
            .collect();

        Ok(events)
    }
}
