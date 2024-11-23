use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use thiserror::Error;

use crate::domain::property::{Property, Location};

/// Transfer status in the system
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum TransferStatus {
    Pending,           // Transfer initiated
    PendingApproval,   // Awaiting commander approval
    Approved,          // Commander approved
    Rejected,          // Commander rejected
    Completed,         // Transfer completed
    Cancelled,         // Transfer cancelled
}

/// Transfer errors
#[derive(Debug, Error)]
pub enum TransferError {
    #[error("Repository error: {0}")]
    Repository(String),

    #[error("Invalid QR code: {0}")]
    InvalidQRCode(String),

    #[error("Authorization error: {0}")]
    Authorization(String),

    #[error("Business rule violation: {0}")]
    BusinessRule(String),

    #[error("Blockchain error: {0}")]
    Blockchain(String),
}

/// Transfer record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transfer {
    id: Uuid,
    property_id: Uuid,
    from_custodian: Option<String>,
    to_custodian: String,
    status: TransferStatus,
    requires_approval: bool,
    location: Option<Location>,
    notes: Option<String>,
    blockchain_verification: Option<String>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    completed_at: Option<DateTime<Utc>>,
}

impl Transfer {
    /// Creates a new transfer
    pub fn new(
        property_id: Uuid,
        from_custodian: Option<String>,
        to_custodian: String,
        requires_approval: bool,
        location: Option<Location>,
        notes: Option<String>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            property_id,
            from_custodian,
            to_custodian,
            status: if requires_approval {
                TransferStatus::PendingApproval
            } else {
                TransferStatus::Pending
            },
            requires_approval,
            location,
            notes,
            blockchain_verification: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            completed_at: None,
        }
    }

    // Getters
    pub fn id(&self) -> Uuid { self.id }
    pub fn property_id(&self) -> Uuid { self.property_id }
    pub fn from_custodian(&self) -> Option<&String> { self.from_custodian.as_ref() }
    pub fn to_custodian(&self) -> &str { &self.to_custodian }
    pub fn status(&self) -> &TransferStatus { &self.status }
    pub fn requires_approval(&self) -> bool { self.requires_approval }
    pub fn location(&self) -> Option<&Location> { self.location.as_ref() }
    pub fn notes(&self) -> Option<&String> { self.notes.as_ref() }
    pub fn blockchain_verification(&self) -> Option<&String> { self.blockchain_verification.as_ref() }
    pub fn created_at(&self) -> DateTime<Utc> { self.created_at }
    pub fn completed_at(&self) -> Option<DateTime<Utc>> { self.completed_at }

    /// Approves the transfer
    pub fn approve(&mut self) -> Result<(), String> {
        match self.status {
            TransferStatus::PendingApproval => {
                self.status = TransferStatus::Approved;
                self.updated_at = Utc::now();
                Ok(())
            }
            _ => Err("Transfer is not pending approval".to_string()),
        }
    }

    /// Rejects the transfer
    pub fn reject(&mut self) -> Result<(), String> {
        match self.status {
            TransferStatus::PendingApproval => {
                self.status = TransferStatus::Rejected;
                self.updated_at = Utc::now();
                Ok(())
            }
            _ => Err("Transfer is not pending approval".to_string()),
        }
    }

    /// Completes the transfer
    pub fn complete(&mut self, blockchain_verification: String) -> Result<(), String> {
        match self.status {
            TransferStatus::Pending | TransferStatus::Approved => {
                self.status = TransferStatus::Completed;
                self.blockchain_verification = Some(blockchain_verification);
                self.completed_at = Some(Utc::now());
                self.updated_at = Utc::now();
                Ok(())
            }
            _ => Err("Transfer cannot be completed in current status".to_string()),
        }
    }

    /// Cancels the transfer
    pub fn cancel(&mut self) -> Result<(), String> {
        match self.status {
            TransferStatus::Pending | TransferStatus::PendingApproval => {
                self.status = TransferStatus::Cancelled;
                self.updated_at = Utc::now();
                Ok(())
            }
            _ => Err("Transfer cannot be cancelled in current status".to_string()),
        }
    }
}

/// Repository interface for transfers
#[async_trait]
pub trait TransferRepository: Send + Sync {
    /// Creates a new transfer
    async fn create(&self, transfer: Transfer) -> Result<Transfer, TransferError>;

    /// Gets a transfer by ID
    async fn get_by_id(&self, id: Uuid) -> Result<Transfer, TransferError>;

    /// Updates a transfer
    async fn update(&self, transfer: Transfer) -> Result<Transfer, TransferError>;

    /// Gets transfers for a custodian
    async fn get_by_custodian(
        &self,
        custodian: &str,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<Transfer>, TransferError>;

    /// Gets pending approvals for a commander
    async fn get_pending_approvals(
        &self,
        commander_id: &str,
    ) -> Result<Vec<Transfer>, TransferError>;

    /// Gets transfers for a property
    async fn get_by_property(
        &self,
        property_id: Uuid,
    ) -> Result<Vec<Transfer>, TransferError>;

    /// Begins a new transaction
    async fn begin_transaction(&self) -> Result<Box<dyn TransferTransaction>, TransferError>;
}

/// Transaction interface for transfers
#[async_trait]
pub trait TransferTransaction: Send + Sync {
    /// Commits the transaction
    async fn commit(self: Box<Self>) -> Result<(), TransferError>;

    /// Rolls back the transaction
    async fn rollback(self: Box<Self>) -> Result<(), TransferError>;

    /// Creates a transfer within the transaction
    async fn create(&mut self, transfer: Transfer) -> Result<Transfer, TransferError>;

    /// Updates a transfer within the transaction
    async fn update(&mut self, transfer: Transfer) -> Result<Transfer, TransferError>;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transfer_workflow() {
        let mut transfer = Transfer::new(
            Uuid::new_v4(),
            Some("OLD_CUSTODIAN".to_string()),
            "NEW_CUSTODIAN".to_string(),
            true,
            None,
            None,
        );

        // Initial state
        assert_eq!(transfer.status(), &TransferStatus::PendingApproval);

        // Approve
        transfer.approve().unwrap();
        assert_eq!(transfer.status(), &TransferStatus::Approved);

        // Complete
        transfer.complete("BLOCKCHAIN_HASH".to_string()).unwrap();
        assert_eq!(transfer.status(), &TransferStatus::Completed);
        assert!(transfer.completed_at.is_some());
        assert_eq!(
            transfer.blockchain_verification().unwrap(),
            "BLOCKCHAIN_HASH"
        );
    }

    #[test]
    fn test_transfer_rejection() {
        let mut transfer = Transfer::new(
            Uuid::new_v4(),
            Some("OLD_CUSTODIAN".to_string()),
            "NEW_CUSTODIAN".to_string(),
            true,
            None,
            None,
        );

        // Reject
        transfer.reject().unwrap();
        assert_eq!(transfer.status(), &TransferStatus::Rejected);

        // Cannot complete after rejection
        assert!(transfer.complete("HASH".to_string()).is_err());
    }
}
