use crate::services::core::audit::{AuditEvent, AuditError, AuditStatus};
use chrono::Utc;
use serde_json::Value;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct AuditLogger {
    buffer: Arc<Mutex<Vec<AuditEvent>>>,
    buffer_size: usize,
}

impl AuditLogger {
    pub fn new() -> Self {
        Self {
            buffer: Arc::new(Mutex::new(Vec::new())),
            buffer_size: 1000, // Default buffer size
        }
    }

    pub async fn log_event(
        &self,
        event_type: &str,
        action: &str,
        status: AuditStatus,
        details: Value,
    ) -> Result<AuditEvent, AuditError> {
        let event = AuditEvent {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            event_type: event_type.to_string(),
            user_id: None,
            resource_id: None,
            action: action.to_string(),
            status,
            details,
        };

        self.buffer_event(event.clone()).await?;
        Ok(event)
    }

    pub async fn log_user_event(
        &self,
        user_id: &str,
        event_type: &str,
        action: &str,
        status: AuditStatus,
        details: Value,
    ) -> Result<AuditEvent, AuditError> {
        let event = AuditEvent {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            event_type: event_type.to_string(),
            user_id: Some(user_id.to_string()),
            resource_id: None,
            action: action.to_string(),
            status,
            details,
        };

        self.buffer_event(event.clone()).await?;
        Ok(event)
    }

    async fn buffer_event(&self, event: AuditEvent) -> Result<(), AuditError> {
        let mut buffer = self.buffer.lock().await;
        
        if buffer.len() >= self.buffer_size {
            return Err(AuditError::Storage("Audit buffer is full".to_string()));
        }

        buffer.push(event);
        Ok(())
    }

    pub async fn flush(&self) -> Result<Vec<AuditEvent>, AuditError> {
        let mut buffer = self.buffer.lock().await;
        let events = buffer.clone();
        buffer.clear();
        Ok(events)
    }

    pub fn set_buffer_size(&mut self, size: usize) {
        self.buffer_size = size;
    }
}

impl Default for AuditLogger {
    fn default() -> Self {
        Self::new()
    }
}
