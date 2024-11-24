use chrono::Utc;
use serde_json::json;
use async_trait::async_trait;
use std::sync::Arc;

use crate::{
    error::CoreError,
    types::{
        audit::{AuditEvent, AuditEventType, AuditStatus, AuditContext, AuditSeverity},
        security::SecurityContext,
        signature::SignatureMetadata,
        app::AuditLogger,
    },
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
        let context = AuditContext::new(
            action,
            severity,
            self.context.classification,
            Some(self.context.user_id.to_string()),
        );

        AuditEvent {
            id: uuid::Uuid::new_v4(),
            event_type,
            data: details,
            context,
            signature: SignatureMetadata::new(
                uuid::Uuid::new_v4(),
                vec![],
                uuid::Uuid::new_v4(),
                self.context.classification,
                crate::types::signature::SignatureType::Audit,
                crate::types::signature::SignatureAlgorithm::Ed25519,
            ),
            timestamp: Utc::now(),
        }
    }
}

pub struct AuditServiceImpl {
    security_audit: Arc<SecurityAudit>,
}

impl AuditServiceImpl {
    pub fn new(context: SecurityContext) -> Self {
        Self {
            security_audit: Arc::new(SecurityAudit::new(context)),
        }
    }
}

#[async_trait]
impl AuditLogger for AuditServiceImpl {
    async fn log_event(&self, event: AuditEvent, context: &SecurityContext) -> Result<(), CoreError> {
        // TODO: Implement actual audit logging
        // For now, just print to console in debug builds
        #[cfg(debug_assertions)]
        println!("Audit event: {:?}", event);
        
        Ok(())
    }
}

impl Default for AuditServiceImpl {
    fn default() -> Self {
        Self::new(SecurityContext::default())
    }
}
