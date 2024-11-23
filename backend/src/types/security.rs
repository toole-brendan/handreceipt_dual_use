use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SecurityClassification {
    Unclassified = 0,
    Confidential = 1,
    Secret = 2,
    TopSecret = 3,
}

impl PartialOrd for SecurityClassification {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some((*self as u8).cmp(&(*other as u8)))
    }
}

impl Ord for SecurityClassification {
    fn cmp(&self, other: &Self) -> Ordering {
        (*self as u8).cmp(&(*other as u8))
    }
}

impl std::str::FromStr for SecurityClassification {
    type Err = crate::error::CoreError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_uppercase().as_str() {
            "UNCLASSIFIED" => Ok(SecurityClassification::Unclassified),
            "CONFIDENTIAL" => Ok(SecurityClassification::Confidential),
            "SECRET" => Ok(SecurityClassification::Secret),
            "TOP_SECRET" => Ok(SecurityClassification::TopSecret),
            _ => Err(crate::error::CoreError::Validation(
                format!("Invalid security classification: {}", s).into()
            )),
        }
    }
}

impl std::fmt::Display for SecurityClassification {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SecurityClassification::Unclassified => write!(f, "UNCLASSIFIED"),
            SecurityClassification::Confidential => write!(f, "CONFIDENTIAL"),
            SecurityClassification::Secret => write!(f, "SECRET"),
            SecurityClassification::TopSecret => write!(f, "TOP_SECRET"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityContext {
    pub user_id: Uuid,
    pub classification: SecurityClassification,
    pub token: String,
    pub permissions: Vec<String>,
    pub session_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
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
            classification,
            token,
            permissions,
            session_id: Uuid::new_v4(),
            created_at: now,
            expires_at: now + chrono::Duration::hours(24),
        }
    }
}

impl Default for SecurityContext {
    fn default() -> Self {
        Self::new(
            SecurityClassification::Unclassified,
            Uuid::new_v4(),
            "default-token".to_string(),
            vec![],
        )
    }
}
