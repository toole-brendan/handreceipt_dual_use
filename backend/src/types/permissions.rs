use serde::{Deserialize, Serialize};
use std::fmt;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::types::security::SecurityClassification;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Permission {
    pub id: Uuid,
    pub resource_type: ResourceType,
    pub action: Action,
    pub granted_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
    pub granted_by: String,
    pub classification: SecurityClassification,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ResourceType {
    Asset,
    User,
    Group,
    Role,
    Policy,
    Key,
    Certificate,
    Audit,
    System,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum Action {
    Create,
    Read,
    Update,
    Delete,
    List,
    Execute,
    Grant,
    Revoke,
}

impl Permission {
    pub fn new(
        resource_type: ResourceType,
        action: Action,
        granted_by: String,
        classification: SecurityClassification,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            resource_type,
            action,
            granted_at: Utc::now(),
            expires_at: None,
            granted_by,
            classification,
        }
    }

    pub fn with_expiry(mut self, expires_at: DateTime<Utc>) -> Self {
        self.expires_at = Some(expires_at);
        self
    }

    pub fn is_expired(&self) -> bool {
        self.expires_at.map_or(false, |exp| exp < Utc::now())
    }

    pub fn to_string(&self) -> String {
        format!("{}:{}", self.resource_type, self.action)
    }
}

impl fmt::Display for ResourceType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Asset => write!(f, "asset"),
            Self::User => write!(f, "user"),
            Self::Group => write!(f, "group"),
            Self::Role => write!(f, "role"),
            Self::Policy => write!(f, "policy"),
            Self::Key => write!(f, "key"),
            Self::Certificate => write!(f, "certificate"),
            Self::Audit => write!(f, "audit"),
            Self::System => write!(f, "system"),
        }
    }
}

impl fmt::Display for Action {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Create => write!(f, "create"),
            Self::Read => write!(f, "read"),
            Self::Update => write!(f, "update"),
            Self::Delete => write!(f, "delete"),
            Self::List => write!(f, "list"),
            Self::Execute => write!(f, "execute"),
            Self::Grant => write!(f, "grant"),
            Self::Revoke => write!(f, "revoke"),
        }
    }
}
