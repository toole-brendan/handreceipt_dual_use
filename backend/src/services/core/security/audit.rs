use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use tokio::sync::mpsc;
use crate::infrastructure::database::DatabaseService;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub id: String,
    pub event_type: AuditEventType,
    pub severity: AuditSeverity,
    pub timestamp: DateTime<Utc>,
    pub user_id: Option<String>,
    pub resource_id: Option<String>,
    pub action: String,
    pub status: AuditStatus,
    pub details: serde_json::Value,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AuditEventType {
    Authentication,
    Authorization,
    AssetOperation,
    SystemOperation,
    SecurityAlert,
    DataAccess,
    Configuration,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AuditSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AuditStatus {
    Info,
    Success,
    Failure,
    Pending,
    Cancelled,
}

pub struct AuditLogger {
    db: DatabaseService,
    sender: mpsc::Sender<AuditEvent>,
    buffer_size: usize,
}

impl AuditLogger {
    pub fn new(db: DatabaseService, buffer_size: usize) -> (Self, mpsc::Receiver<AuditEvent>) {
        let (sender, receiver) = mpsc::channel(buffer_size);
        
        let logger = Self {
            db,
            sender,
            buffer_size,
        };

        (logger, receiver)
    }

    pub async fn log_event(
        &self,
        event_type: AuditEventType,
        severity: AuditSeverity,
        action: &str,
        status: AuditStatus,
        details: serde_json::Value,
    ) -> Result<(), AuditError> {
        let event = AuditEvent {
            id: uuid::Uuid::new_v4().to_string(),
            event_type,
            severity: severity.clone(), // Clone severity before moving into event
            timestamp: Utc::now(),
            user_id: None,
            resource_id: None,
            action: action.to_string(),
            status,
            details,
            metadata: None,
        };

        self.sender.send(event.clone()).await
            .map_err(|_| AuditError::ChannelError)?;

        // If high severity, write immediately
        if matches!(severity, AuditSeverity::Error | AuditSeverity::Critical) {
            self.write_event(&event).await?;
        }

        Ok(())
    }

    pub async fn log_security_event(
        &self,
        user_id: Option<String>,
        resource_id: Option<String>,
        action: &str,
        status: AuditStatus,
        details: serde_json::Value,
    ) -> Result<(), AuditError> {
        let event = AuditEvent {
            id: uuid::Uuid::new_v4().to_string(),
            event_type: AuditEventType::SecurityAlert,
            severity: AuditSeverity::Warning,
            timestamp: Utc::now(),
            user_id,
            resource_id,
            action: action.to_string(),
            status,
            details,
            metadata: None,
        };

        self.sender.send(event.clone()).await
            .map_err(|_| AuditError::ChannelError)?;

        // Always write security events immediately
        self.write_event(&event).await?;

        Ok(())
    }

    async fn write_event(&self, event: &AuditEvent) -> Result<(), AuditError> {
        self.db.save_audit_event(event).await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))
    }

    pub async fn get_events(
        &self,
        from: DateTime<Utc>,
        to: DateTime<Utc>,
        event_type: Option<AuditEventType>,
        severity: Option<AuditSeverity>,
    ) -> Result<Vec<AuditEvent>, AuditError> {
        self.db.get_audit_events(from, to, event_type, severity).await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))
    }

    pub async fn get_security_events(
        &self,
        from: DateTime<Utc>,
        to: DateTime<Utc>,
    ) -> Result<Vec<AuditEvent>, AuditError> {
        self.db.get_security_events(from, to).await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))
    }
}

#[derive(Debug, thiserror::Error)]
pub enum AuditError {
    #[error("Database error: {0}")]
    DatabaseError(String),
    
    #[error("Channel error")]
    ChannelError,
    
    #[error("Invalid event data: {0}")]
    InvalidEventData(String),
    
    #[error("Query error: {0}")]
    QueryError(String),
}
