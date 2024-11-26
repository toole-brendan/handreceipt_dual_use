use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::postgres::Postgres;
use sqlx::{Decode, Encode, Type};
use std::fmt;
use crate::domain::models::location::Location;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, sqlx::Type)]
#[sqlx(type_name = "property_category", rename_all = "snake_case")]
pub enum PropertyCategory {
    Equipment,
    Vehicle,
    Weapon,
    Ammunition,
    Supply,
    Other,
}

impl fmt::Display for PropertyCategory {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            PropertyCategory::Equipment => write!(f, "equipment"),
            PropertyCategory::Vehicle => write!(f, "vehicle"),
            PropertyCategory::Weapon => write!(f, "weapon"),
            PropertyCategory::Ammunition => write!(f, "ammunition"),
            PropertyCategory::Supply => write!(f, "supply"),
            PropertyCategory::Other => write!(f, "other"),
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, sqlx::Type)]
#[sqlx(type_name = "property_status", rename_all = "snake_case")]
pub enum PropertyStatus {
    Available,
    InUse,
    Maintenance,
    Lost,
    Destroyed,
}

impl fmt::Display for PropertyStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            PropertyStatus::Available => write!(f, "available"),
            PropertyStatus::InUse => write!(f, "in_use"),
            PropertyStatus::Maintenance => write!(f, "maintenance"),
            PropertyStatus::Lost => write!(f, "lost"),
            PropertyStatus::Destroyed => write!(f, "destroyed"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Property {
    pub id: i32,
    pub name: String,
    pub description: String,
    pub category: PropertyCategory,
    pub status: PropertyStatus,
    pub current_holder_id: i32,
    pub location: Location,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub is_sensitive: bool,
    pub quantity: i32,
    pub notes: Option<String>,
    pub serial_number: Option<String>,
    pub nsn: Option<String>,
    pub hand_receipt_number: Option<String>,
    pub requires_approval: bool,
}

impl Property {
    pub fn new(
        name: String,
        description: String,
        category: PropertyCategory,
        current_holder_id: i32,
        location: Location,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: 0,
            name,
            description,
            category,
            status: PropertyStatus::Available,
            current_holder_id,
            location,
            metadata: serde_json::Value::Object(serde_json::Map::new()),
            created_at: now,
            updated_at: now,
            is_sensitive: false,
            quantity: 1,
            notes: None,
            serial_number: None,
            nsn: None,
            hand_receipt_number: None,
            requires_approval: false,
        }
    }
}
