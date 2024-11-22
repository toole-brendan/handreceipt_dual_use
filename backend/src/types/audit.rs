use thiserror::Error;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::collections::HashMap;

use super::security::SecurityContext;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub event_type: AuditEventType,
    pub status: AuditStatus,
    pub details: serde_json::Value,
    pub context: AuditContext,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditEventType {
    AssetCreated,
    AssetUpdated,
    AssetDeleted,
    AssetTransferred,
    SecurityViolation,
    SystemEvent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditStatus {
    Success,
    Failure,
    Warning,
    Info,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditSeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditContext {
    pub user_id: Option<String>,
    pub resource_id: Option<String>,
    pub action: String,
    pub severity: AuditSeverity,
    pub metadata: Option<HashMap<String, String>>,
}

#[derive(Error, Debug)]
pub enum AuditError {
    #[error("Database error: {0}")]
    Database(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Chain verification failed: {0}")]
    ChainVerification(String),

    #[error("Logging failed: {0}")]
    LoggingFailed(String),
}

impl From<AuditError> for super::error::CoreError {
    fn from(err: AuditError) -> Self {
        match err {
            AuditError::Database(msg) => Self::Database(msg),
            AuditError::Validation(msg) => Self::ValidationError(msg),
            AuditError::ChainVerification(msg) => Self::SecurityViolation(msg),
            AuditError::LoggingFailed(msg) => Self::InternalError(msg),
        }
    }
}
