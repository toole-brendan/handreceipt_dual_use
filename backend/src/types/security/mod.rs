pub mod key_management;

use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityContext {
    pub user_id: Uuid,
    pub session_id: Uuid,
    pub token: String,
    pub classification: SecurityClassification,
    pub permissions: Vec<String>,
    pub metadata: HashMap<String, String>,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum SecurityClassification {
    Unclassified,
    Confidential,
    Secret,
    TopSecret,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum SecurityLevel {
    Low,
    Medium,
    High,
    Critical,
}

impl SecurityContext {
    pub fn new(
        classification: SecurityClassification,
        user_id: Uuid,
        token: String,
        permissions: Vec<String>,
    ) -> Self {
        let now = Utc::now();
        Self {
            user_id,
            session_id: Uuid::new_v4(),
            token,
            classification,
            permissions,
            metadata: HashMap::new(),
            created_at: now,
            expires_at: now + chrono::Duration::hours(24),
        }
    }

    pub fn has_permission(&self, resource: &str, action: &str) -> bool {
        let permission = format!("{}:{}", resource, action);
        self.permissions.contains(&permission)
    }

    pub fn with_metadata(mut self, metadata: HashMap<String, String>) -> Self {
        self.metadata = metadata;
        self
    }

    pub fn with_expiry(mut self, expires_at: DateTime<Utc>) -> Self {
        self.expires_at = expires_at;
        self
    }
}

impl std::fmt::Display for SecurityClassification {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Unclassified => write!(f, "UNCLASSIFIED"),
            Self::Confidential => write!(f, "CONFIDENTIAL"),
            Self::Secret => write!(f, "SECRET"),
            Self::TopSecret => write!(f, "TOP_SECRET"),
        }
    }
} 