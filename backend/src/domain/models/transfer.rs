use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use crate::domain::models::location::Location;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
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
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyTransferRecord {
    pub id: i32,
    pub property_id: i32,
    pub from_holder_id: i32,
    pub to_holder_id: i32,
    pub status: TransferStatus,
    pub location: Location,
    pub timestamp: DateTime<Utc>,
    pub blockchain_hash: String,
    pub signature: String,
    pub metadata: serde_json::Value,
    pub from_node: String,
    pub to_node: String,
}

impl PropertyTransferRecord {
    pub fn new(
        property_id: i32,
        from_holder_id: i32,
        to_holder_id: i32,
        location: Location,
        blockchain_hash: String,
        signature: String,
        from_node: String,
        to_node: String,
    ) -> Self {
        Self {
            id: 0,
            property_id,
            from_holder_id,
            to_holder_id,
            status: TransferStatus::Pending,
            location,
            timestamp: Utc::now(),
            blockchain_hash,
            signature,
            metadata: serde_json::Value::Object(serde_json::Map::new()),
            from_node,
            to_node,
        }
    }

    pub fn from_transfer(transfer: &Transfer, blockchain_hash: String, signature: String, from_node: String, to_node: String) -> Self {
        Self {
            id: transfer.id,
            property_id: transfer.property_id,
            from_holder_id: transfer.from_holder_id,
            to_holder_id: transfer.to_holder_id,
            status: transfer.status,
            location: transfer.location.clone(),
            timestamp: transfer.created_at,
            blockchain_hash,
            signature,
            metadata: transfer.metadata.clone(),
            from_node,
            to_node,
        }
    }
}
