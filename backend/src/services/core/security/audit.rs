use chrono::Utc;
use serde_json::json;
use crate::types::{
    audit::{AuditEvent, AuditEventType, AuditStatus, AuditContext, AuditSeverity},
    security::SecurityContext,
};

pub struct SecurityAudit {
    context: SecurityContext,
}

impl SecurityAudit {
    pub fn new(context: SecurityContext) -> Self {
        Self { context }
    }

    pub fn create_event(
        &self,
        event_type: AuditEventType,
        action: String,
        status: AuditStatus,
        details: serde_json::Value,
        severity: AuditSeverity,
    ) -> AuditEvent {
        AuditEvent {
            id: uuid::Uuid::new_v4(),
            timestamp: Utc::now(),
            event_type,
            status,
            details,
            context: AuditContext {
                user_id: Some(self.context.user_id.to_string()),
                resource_id: None,
                action,
                severity,
                metadata: None,
            },
        }
    }
}
