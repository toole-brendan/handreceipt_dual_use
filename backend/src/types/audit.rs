use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use uuid::Uuid;

/// Represents an audit event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub event_type: String,
    pub user_id: Option<String>,
    pub resource_id: Option<String>,
    pub action: String,
    pub status: AuditStatus,
    pub details: serde_json::Value,
}

/// Represents the status of an audit event
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum AuditStatus {
    Success,
    Failure,
    Warning,
    Info,
}

/// Represents different types of audit events
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum AuditEventType {
    Security,
    Asset,
    Transfer,
    Access,
    System,
    Network,
    Blockchain,
    Sync,
    Scan,
}

/// Represents the severity of an audit event
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum AuditSeverity {
    Critical,
    High,
    Medium,
    Low,
    Info,
}

impl AuditEvent {
    pub fn new(
        event_type: String,
        action: String,
        status: AuditStatus,
        details: serde_json::Value,
    ) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            event_type,
            user_id: None,
            resource_id: None,
            action,
            status,
            details,
        }
    }

    pub fn with_user(mut self, user_id: String) -> Self {
        self.user_id = Some(user_id);
        self
    }

    pub fn with_resource(mut self, resource_id: String) -> Self {
        self.resource_id = Some(resource_id);
        self
    }
}

impl Default for AuditStatus {
    fn default() -> Self {
        Self::Info
    }
}

impl std::fmt::Display for AuditStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AuditStatus::Success => write!(f, "SUCCESS"),
            AuditStatus::Failure => write!(f, "FAILURE"),
            AuditStatus::Warning => write!(f, "WARNING"),
            AuditStatus::Info => write!(f, "INFO"),
        }
    }
}

impl std::fmt::Display for AuditEventType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AuditEventType::Security => write!(f, "SECURITY"),
            AuditEventType::Asset => write!(f, "ASSET"),
            AuditEventType::Transfer => write!(f, "TRANSFER"),
            AuditEventType::Access => write!(f, "ACCESS"),
            AuditEventType::System => write!(f, "SYSTEM"),
            AuditEventType::Network => write!(f, "NETWORK"),
            AuditEventType::Blockchain => write!(f, "BLOCKCHAIN"),
            AuditEventType::Sync => write!(f, "SYNC"),
            AuditEventType::Scan => write!(f, "SCAN"),
        }
    }
}
