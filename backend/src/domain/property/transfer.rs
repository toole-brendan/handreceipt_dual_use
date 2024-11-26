use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use uuid::Uuid;

use crate::domain::models::location::Location;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransferStatus {
    Pending,
    Completed,
    Rejected,
    RequiresApproval,
    Approved,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyTransfer {
    pub id: Uuid,
    pub property_id: Uuid,
    pub from_custodian: String,
    pub to_custodian: String,
    pub verifier: String,
    pub status: TransferStatus,
    pub initiated_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub location: Location,
    pub requires_approval: bool,
    pub commander_id: Option<String>,
    pub commander_notes: Option<String>,
    pub transfer_notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl PropertyTransfer {
    pub fn new(
        property_id: Uuid,
        from_custodian: String,
        to_custodian: String,
        verifier: String,
        location: Location,
        requires_approval: bool,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            property_id,
            from_custodian,
            to_custodian,
            verifier,
            status: TransferStatus::Pending,
            initiated_at: Utc::now(),
            completed_at: None,
            location,
            requires_approval,
            commander_id: None,
            commander_notes: None,
            transfer_notes: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }

    pub fn approve(&mut self, commander_id: String, notes: Option<String>) {
        self.status = TransferStatus::Approved;
        self.commander_id = Some(commander_id);
        self.commander_notes = notes;
        self.updated_at = Utc::now();
    }

    pub fn reject(&mut self, commander_id: String, notes: Option<String>) {
        self.status = TransferStatus::Rejected;
        self.commander_id = Some(commander_id);
        self.commander_notes = notes;
        self.updated_at = Utc::now();
    }

    pub fn complete(&mut self) {
        self.status = TransferStatus::Completed;
        self.completed_at = Some(Utc::now());
        self.updated_at = Utc::now();
    }

    pub fn cancel(&mut self, notes: Option<String>) {
        self.status = TransferStatus::Cancelled;
        self.transfer_notes = notes;
        self.updated_at = Utc::now();
    }
} 