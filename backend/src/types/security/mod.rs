pub mod key_management;

use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SecurityClassification {
    NonSensitive,
    Sensitive,
}

#[derive(Debug, Clone)]
pub struct SecurityContext {
    pub user_id: Uuid,
    pub classification: SecurityClassification,
    pub permissions: Vec<String>,
}

impl SecurityContext {
    pub fn has_permission(&self, resource: &str, action: &str) -> bool {
        self.permissions.contains(&format!("{}:{}", resource, action))
    }

    pub fn can_handle_sensitive_items(&self) -> bool {
        self.classification == SecurityClassification::Sensitive
    }
}