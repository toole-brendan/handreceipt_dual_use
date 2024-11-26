use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub timestamp: DateTime<Utc>,
    pub event_type: String,
    pub description: String,
    pub user_id: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

impl HistoryEntry {
    pub fn new(
        event_type: String,
        description: String,
        user_id: Option<String>,
        metadata: Option<serde_json::Value>,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            event_type,
            description,
            user_id,
            metadata,
        }
    }
} 