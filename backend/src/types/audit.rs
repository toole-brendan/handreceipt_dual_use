use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::collections::HashMap;

use crate::types::security::SecurityClassification;
use crate::types::signature::SignatureMetadata;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub id: Uuid,
    pub event_type: AuditEventType,
    pub data: serde_json::Value,
    pub context: AuditContext,
    pub signature: SignatureMetadata,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum AuditEventType {
    AssetCreated,
    AssetUpdated,
    AssetDeleted,
    AssetTransferred,
    SecurityViolation,
    SystemEvent,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum AuditStatus {
    Pending,
    Recorded,
    Verified,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditContext {
    pub event_name: String,
    pub severity: AuditSeverity,
    pub classification: SecurityClassification,
    pub user_id: Option<String>,
    pub resource_id: Option<String>,
    pub metadata: HashMap<String, String>,
}

impl AuditContext {
    pub fn new(
        event_name: String,
        severity: AuditSeverity,
        classification: SecurityClassification,
        user_id: Option<String>,
    ) -> Self {
        Self {
            event_name,
            severity,
            classification,
            user_id,
            resource_id: None,
            metadata: HashMap::new(),
        }
    }

    pub fn with_resource(mut self, resource_id: String) -> Self {
        self.resource_id = Some(resource_id);
        self
    }

    pub fn with_metadata(mut self, metadata: HashMap<String, String>) -> Self {
        self.metadata = metadata;
        self
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum AuditSeverity {
    Low,
    Medium,
    High,
    Critical,
}
