use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::domain::models::location::Location;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Property {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub location: Option<Location>,
    pub status: PropertyStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PropertyStatus {
    Available,
    InUse,
    Maintenance,
    Retired,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyMetadata {
    pub serial_number: Option<String>,
    pub model: Option<String>,
    pub manufacturer: Option<String>,
    pub purchase_date: Option<DateTime<Utc>>,
    pub warranty_expiry: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PropertyType {
    Equipment,
    Vehicle,
    Weapon,
    Supply,
    Other(String),
}
