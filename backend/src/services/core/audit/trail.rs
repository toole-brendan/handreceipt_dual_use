use crate::types::audit::{AuditEvent, AuditError, AuditEventType};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use std::sync::Arc;

pub struct AuditTrail {
    events: Arc<RwLock<HashMap<String, AuditEvent>>>,
    relationships: Arc<RwLock<HashMap<String, Vec<String>>>>,
}

impl AuditTrail {
    pub fn new() -> Self {
        Self {
            events: Arc::new(RwLock::new(HashMap::new())),
            relationships: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn add_event(&self, event: AuditEvent) -> Result<(), AuditError> {
        let mut events = self.events.write().await;
        events.insert(event.id.to_string(), event);
        Ok(())
    }

    pub async fn get_event(&self, event_id: &str) -> Option<AuditEvent> {
        let events = self.events.read().await;
        events.get(event_id).cloned()
    }

    pub async fn search_events(
        &self,
        from: DateTime<Utc>,
        to: DateTime<Utc>,
        event_type: Option<AuditEventType>,
    ) -> Vec<AuditEvent> {
        let events = self.events.read().await;
        
        events
            .values()
            .filter(|event| {
                event.timestamp >= from
                    && event.timestamp <= to
                    && event_type
                        .as_ref()
                        .map(|t| std::mem::discriminant(t) == std::mem::discriminant(&event.event_type))
                        .unwrap_or(true)
            })
            .cloned()
            .collect()
    }
}

impl Default for AuditTrail {
    fn default() -> Self {
        Self::new()
    }
}
