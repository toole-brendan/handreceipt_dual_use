use chrono::{DateTime, Utc};
use uuid::Uuid;
use serde::{Serialize, Deserialize};

use crate::domain::models::location::Location;

/// Status of a property transfer
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum TransferStatus {
    Pending,           // Transfer initiated
    PendingApproval,   // Awaiting officer approval
    Approved,          // Officer approved
    Rejected,          // Officer rejected
    Completed,         // Transfer completed
    Cancelled,         // Transfer cancelled
}

/// Information about the scanning device
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub device_type: String,
    pub os_version: String,
    pub app_version: String,
    pub device_id: String,
}

/// QR code scan record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QRScan {
    pub scanned_by: String,
    pub scanned_at: DateTime<Utc>,
    pub location: Option<Location>,
    pub device_info: Option<DeviceInfo>,
    pub scan_notes: Option<String>,
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
    
    // QR Scan Information
    initiating_scan: Option<QRScan>,
    completing_scan: Option<QRScan>,
    
    // Approval Information
    officer_id: Option<String>,
    officer_notes: Option<String>,
    
    // Hand Receipt Information
    hand_receipt_number: Option<String>,
    sub_hand_receipt_number: Option<String>,
    
    // Timestamps
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
        initiating_scan: Option<QRScan>,
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
            initiating_scan,
            completing_scan: None,
            officer_id: None,
            officer_notes: None,
            hand_receipt_number: None,
            sub_hand_receipt_number: None,
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
    pub fn hand_receipt_number(&self) -> Option<&String> { self.hand_receipt_number.as_ref() }
    pub fn sub_hand_receipt_number(&self) -> Option<&String> { self.sub_hand_receipt_number.as_ref() }

    /// Approves the transfer
    pub fn approve(
        &mut self,
        officer_id: String,
        notes: Option<String>,
    ) -> Result<(), String> {
        match self.status {
            TransferStatus::PendingApproval => {
                self.status = TransferStatus::Approved;
                self.officer_id = Some(officer_id);
                self.officer_notes = notes;
                self.updated_at = Utc::now();
                Ok(())
            }
            _ => Err("Transfer is not pending approval".to_string()),
        }
    }

    /// Rejects the transfer
    pub fn reject(
        &mut self,
        officer_id: String,
        notes: Option<String>,
    ) -> Result<(), String> {
        match self.status {
            TransferStatus::PendingApproval => {
                self.status = TransferStatus::Rejected;
                self.officer_id = Some(officer_id);
                self.officer_notes = notes;
                self.updated_at = Utc::now();
                Ok(())
            }
            _ => Err("Transfer is not pending approval".to_string()),
        }
    }

    /// Completes the transfer
    pub fn complete(
        &mut self,
        blockchain_verification: String,
        completing_scan: Option<QRScan>,
    ) -> Result<(), String> {
        match self.status {
            TransferStatus::Pending | TransferStatus::Approved => {
                self.status = TransferStatus::Completed;
                self.blockchain_verification = Some(blockchain_verification);
                self.completing_scan = completing_scan;
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

    /// Sets hand receipt information
    pub fn set_hand_receipt(
        &mut self,
        number: String,
        sub_number: Option<String>,
    ) {
        self.hand_receipt_number = Some(number);
        self.sub_hand_receipt_number = sub_number;
        self.updated_at = Utc::now();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_scan() -> QRScan {
        QRScan {
            scanned_by: "TEST_USER".to_string(),
            scanned_at: Utc::now(),
            location: Some(Location {
                building: "HQ".to_string(),
                room: Some("Armory".to_string()),
                notes: None,
                grid_coordinates: None,
            }),
            device_info: Some(DeviceInfo {
                device_type: "iPhone".to_string(),
                os_version: "iOS 15.0".to_string(),
                app_version: "1.0.0".to_string(),
                device_id: "TEST123".to_string(),
            }),
            scan_notes: None,
        }
    }

    #[test]
    fn test_transfer_workflow() {
        let mut transfer = Transfer::new(
            Uuid::new_v4(),
            Some("OLD_CUSTODIAN".to_string()),
            "NEW_CUSTODIAN".to_string(),
            true,
            Some(create_test_scan()),
            None,
            None,
        );

        // Initial state
        assert_eq!(transfer.status(), &TransferStatus::PendingApproval);

        // Approve
        transfer.approve(
            "OFFICER_ID".to_string(),
            Some("Approved".to_string()),
        ).unwrap();
        assert_eq!(transfer.status(), &TransferStatus::Approved);

        // Complete with QR scan
        transfer.complete(
            "BLOCKCHAIN_HASH".to_string(),
            Some(create_test_scan()),
        ).unwrap();
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
            Some(create_test_scan()),
            None,
            None,
        );

        // Reject
        transfer.reject(
            "OFFICER_ID".to_string(),
            Some("Rejected".to_string()),
        ).unwrap();
        assert_eq!(transfer.status(), &TransferStatus::Rejected);

        // Cannot complete after rejection
        assert!(transfer.complete(
            "HASH".to_string(),
            Some(create_test_scan()),
        ).is_err());
    }

    #[test]
    fn test_hand_receipt() {
        let mut transfer = Transfer::new(
            Uuid::new_v4(),
            Some("OLD_CUSTODIAN".to_string()),
            "NEW_CUSTODIAN".to_string(),
            true,
            Some(create_test_scan()),
            None,
            None,
        );

        transfer.set_hand_receipt(
            "HR-123".to_string(),
            Some("SUB-456".to_string()),
        );

        assert_eq!(transfer.hand_receipt_number().unwrap(), "HR-123");
        assert_eq!(transfer.sub_hand_receipt_number().unwrap(), "SUB-456");
    }
}
