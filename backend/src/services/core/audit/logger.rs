use crate::types::{
    audit::{AuditEvent, AuditStatus, AuditEventType, AuditSeverity, AuditError},
    security::SecurityContext,
};
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
        event: AuditEvent,
        context: &SecurityContext,
    ) -> Result<(), AuditError> {
        let mut buffer = self.buffer.lock().await;
        
        if buffer.len() >= self.buffer_size {
            return Err(AuditError::LoggingFailed("Audit buffer is full".to_string()));
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
