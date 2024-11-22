use crate::services::core::audit::{AuditEvent, AuditError};
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
        events.insert(event.id.clone(), event);
        Ok(())
    }

    pub async fn get_event(&self, event_id: &str) -> Option<AuditEvent> {
        let events = self.events.read().await;
        events.get(event_id).cloned()
    }

    pub async fn add_relationship(&self, parent_id: &str, child_id: &str) -> Result<(), AuditError> {
        let mut relationships = self.relationships.write().await;
        relationships
            .entry(parent_id.to_string())
            .or_insert_with(Vec::new)
            .push(child_id.to_string());
        Ok(())
    }

    pub async fn get_related_events(&self, event_id: &str) -> Vec<AuditEvent> {
        let relationships = self.relationships.read().await;
        let events = self.events.read().await;
        
        let related_ids = relationships.get(event_id).cloned().unwrap_or_default();
        related_ids
            .iter()
            .filter_map(|id| events.get(id).cloned())
            .collect()
    }

    pub async fn search_events(
        &self,
        from: DateTime<Utc>,
        to: DateTime<Utc>,
        event_type: Option<&str>,
    ) -> Vec<AuditEvent> {
        let events = self.events.read().await;
        
        events
            .values()
            .filter(|event| {
                event.timestamp >= from
                    && event.timestamp <= to
                    && event_type
                        .map(|t| event.event_type == t)
                        .unwrap_or(true)
            })
            .cloned()
            .collect()
    }

    pub async fn clear_old_events(&self, before: DateTime<Utc>) -> Result<usize, AuditError> {
        let mut events = self.events.write().await;
        let mut relationships = self.relationships.write().await;
        
        let initial_count = events.len();
        
        // Remove old events
        events.retain(|_, event| event.timestamp > before);
        
        // Clean up relationships for removed events
        relationships.retain(|event_id, _| events.contains_key(event_id));
        for related_events in relationships.values_mut() {
            related_events.retain(|event_id| events.contains_key(event_id));
        }
        
        Ok(initial_count - events.len())
    }
}

impl Default for AuditTrail {
    fn default() -> Self {
        Self::new()
    }
}
