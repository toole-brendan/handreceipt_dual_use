use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use crate::domain::models::location::Location;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "transfer_status", rename_all = "snake_case")]
pub enum TransferStatus {
    Pending,
    Approved,
    Rejected,
    Completed,
    Cancelled,
}

impl std::fmt::Display for TransferStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TransferStatus::Pending => write!(f, "pending"),
            TransferStatus::Approved => write!(f, "approved"),
            TransferStatus::Rejected => write!(f, "rejected"),
            TransferStatus::Completed => write!(f, "completed"),
            TransferStatus::Cancelled => write!(f, "cancelled"),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Transfer {
    pub id: i32,
    pub property_id: i32,
    pub from_holder_id: i32,
    pub to_holder_id: i32,
    pub status: TransferStatus,
    pub location: Location,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub approved_at: Option<DateTime<Utc>>,
    pub approved_by_id: Option<i32>,
    pub notes: Option<String>,
    pub metadata: serde_json::Value,
}

impl Transfer {
    pub fn new(
        property_id: i32,
        from_holder_id: i32,
        to_holder_id: i32,
        location: Location,
        notes: Option<String>,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: 0,
            property_id,
            from_holder_id,
            to_holder_id,
            status: TransferStatus::Pending,
            location,
            created_at: now,
            updated_at: now,
            approved_at: None,
            approved_by_id: None,
            notes,
            metadata: serde_json::Value::Object(serde_json::Map::new()),
        }
    }

    pub fn approve(&mut self, approved_by_id: i32) {
        self.status = TransferStatus::Approved;
        self.approved_at = Some(Utc::now());
        self.approved_by_id = Some(approved_by_id);
        self.updated_at = Utc::now();
    }

    pub fn reject(&mut self, approved_by_id: i32) {
        self.status = TransferStatus::Rejected;
        self.approved_at = Some(Utc::now());
        self.approved_by_id = Some(approved_by_id);
        self.updated_at = Utc::now();
    }

    pub fn complete(&mut self) {
        self.status = TransferStatus::Completed;
        self.updated_at = Utc::now();
    }

    pub fn cancel(&mut self) {
        self.status = TransferStatus::Cancelled;
        self.updated_at = Utc::now();
    }

    pub fn is_valid(&self) -> bool {
        self.from_holder_id > 0 && self.to_holder_id > 0 && self.property_id > 0
    }

    pub fn requires_approval(&self) -> bool {
        // This should be determined by the property's requires_approval flag
        // For now, we'll return true to be safe
        true
    }
}
