use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::domain::models::location::Location;
use crate::domain::models::history::HistoryEntry;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PropertyCondition {
    Serviceable,
    Unserviceable,
    MaintenanceRequired,
}

impl std::fmt::Display for PropertyCondition {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PropertyCondition::Serviceable => write!(f, "serviceable"),
            PropertyCondition::Unserviceable => write!(f, "unserviceable"),
            PropertyCondition::MaintenanceRequired => write!(f, "maintenance_required"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Verification {
    pub verifier: String,
    pub timestamp: DateTime<Utc>,
    pub method: String,
    pub location: Option<Location>,
    pub condition_code: Option<PropertyCondition>,
    pub notes: Option<String>,
}

impl Verification {
    pub fn new(
        verifier: String,
        method: String,
        location: Option<Location>,
        condition_code: Option<PropertyCondition>,
        notes: Option<String>,
    ) -> Self {
        Self {
            verifier,
            timestamp: Utc::now(),
            method,
            location,
            condition_code,
            notes,
        }
    }

    pub fn verifier(&self) -> &str {
        &self.verifier
    }

    pub fn timestamp(&self) -> DateTime<Utc> {
        self.timestamp
    }

    pub fn method(&self) -> &str {
        &self.method
    }

    pub fn location(&self) -> Option<&Location> {
        self.location.as_ref()
    }

    pub fn condition_code(&self) -> Option<&PropertyCondition> {
        self.condition_code.as_ref()
    }

    pub fn notes(&self) -> Option<&str> {
        self.notes.as_deref()
    }
} 