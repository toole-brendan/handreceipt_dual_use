use chrono::{DateTime, Utc};
use uuid::Uuid;
use serde::{Serialize, Deserialize};

use super::property::Location;

/// Status of a property transfer
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum TransferStatus {
    Pending,
    Completed,
    Rejected,
    RequiresApproval,
    Approved,
    Cancelled,
}

/// Represents a property transfer transaction
#[derive(Debug, Clone)]
pub struct PropertyTransfer {
    id: Uuid,
    property_id: Uuid,
    from_custodian: Option<String>,
    to_custodian: String,
    verifier: String,
    status: TransferStatus,
    initiated_at: DateTime<Utc>,
    completed_at: Option<DateTime<Utc>>,
    scan_location: Option<Location>,
    building: Option<String>,
    room: Option<String>,
    hand_receipt_number: Option<String>,
    requires_approval: bool,
    commander_id: Option<String>,
    commander_notes: Option<String>,
    transfer_notes: Option<String>,
}

/// Represents a QR code scan event
#[derive(Debug, Clone)]
pub struct QRCodeScan {
    id: Uuid,
    property_id: Uuid,
    scanned_by: String,
    scanned_at: DateTime<Utc>,
    scan_location: Option<Location>,
    building: Option<String>,
    room: Option<String>,
    scan_type: ScanType,
    transfer_id: Option<Uuid>,
    device_info: Option<DeviceInfo>,
    scan_notes: Option<String>,
}

/// Type of QR code scan
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ScanType {
    Transfer,
    Inventory,
    Verification,
}

/// Information about the scanning device
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub device_type: String,
    pub os_version: String,
    pub app_version: String,
    pub device_id: String,
}

/// Represents a transfer approval
#[derive(Debug, Clone)]
pub struct TransferApproval {
    id: Uuid,
    transfer_id: Uuid,
    approver_id: String,
    approved_at: DateTime<Utc>,
    approval_type: ApprovalType,
    approved: bool,
    notes: Option<String>,
    location: Option<Location>,
    device_info: Option<DeviceInfo>,
}

/// Type of approval
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ApprovalType {
    Commander,
    Supply,
    Other,
}

/// Represents a period of custody for a property item
#[derive(Debug, Clone)]
pub struct PropertyCustody {
    id: Uuid,
    property_id: Uuid,
    custodian: String,
    assigned_at: DateTime<Utc>,
    released_at: Option<DateTime<Utc>>,
    assigned_by: String,
    hand_receipt_number: Option<String>,
    transfer_id: Option<Uuid>,
    notes: Option<String>,
}

impl PropertyTransfer {
    /// Creates a new property transfer
    pub fn new(
        property_id: Uuid,
        from_custodian: Option<String>,
        to_custodian: String,
        verifier: String,
        requires_approval: bool,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            property_id,
            from_custodian,
            to_custodian,
            verifier,
            status: if requires_approval {
                TransferStatus::RequiresApproval
            } else {
                TransferStatus::Pending
            },
            initiated_at: Utc::now(),
            completed_at: None,
            scan_location: None,
            building: None,
            room: None,
            hand_receipt_number: None,
            requires_approval,
            commander_id: None,
            commander_notes: None,
            transfer_notes: None,
        }
    }

    // Getters
    pub fn id(&self) -> Uuid { self.id }
    pub fn property_id(&self) -> Uuid { self.property_id }
    pub fn from_custodian(&self) -> Option<&String> { self.from_custodian.as_ref() }
    pub fn to_custodian(&self) -> &str { &self.to_custodian }
    pub fn verifier(&self) -> &str { &self.verifier }
    pub fn status(&self) -> &TransferStatus { &self.status }
    pub fn initiated_at(&self) -> DateTime<Utc> { self.initiated_at }
    pub fn completed_at(&self) -> Option<DateTime<Utc>> { self.completed_at }
    pub fn requires_approval(&self) -> bool { self.requires_approval }

    /// Sets the scan location
    pub fn set_location(&mut self, location: Location, building: Option<String>, room: Option<String>) {
        self.scan_location = Some(location);
        self.building = building;
        self.room = room;
    }

    /// Completes the transfer
    pub fn complete(&mut self) -> Result<(), String> {
        if self.requires_approval && !matches!(self.status, TransferStatus::Approved) {
            return Err("Transfer requires approval before completion".to_string());
        }
        self.status = TransferStatus::Completed;
        self.completed_at = Some(Utc::now());
        Ok(())
    }

    /// Processes commander approval
    pub fn process_approval(
        &mut self,
        commander_id: String,
        approved: bool,
        notes: Option<String>,
    ) -> Result<(), String> {
        if !self.requires_approval {
            return Err("Transfer does not require approval".to_string());
        }

        self.commander_id = Some(commander_id);
        self.commander_notes = notes;
        self.status = if approved {
            TransferStatus::Approved
        } else {
            TransferStatus::Rejected
        };
        Ok(())
    }

    /// Cancels the transfer
    pub fn cancel(&mut self) -> Result<(), String> {
        if matches!(self.status, TransferStatus::Completed) {
            return Err("Cannot cancel completed transfer".to_string());
        }
        self.status = TransferStatus::Cancelled;
        Ok(())
    }
}

impl QRCodeScan {
    /// Creates a new QR code scan record
    pub fn new(
        property_id: Uuid,
        scanned_by: String,
        scan_type: ScanType,
        device_info: Option<DeviceInfo>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            property_id,
            scanned_by,
            scanned_at: Utc::now(),
            scan_location: None,
            building: None,
            room: None,
            scan_type,
            transfer_id: None,
            device_info,
            scan_notes: None,
        }
    }

    // Getters
    pub fn id(&self) -> Uuid { self.id }
    pub fn property_id(&self) -> Uuid { self.property_id }
    pub fn scanned_by(&self) -> &str { &self.scanned_by }
    pub fn scanned_at(&self) -> DateTime<Utc> { self.scanned_at }
    pub fn scan_type(&self) -> &ScanType { &self.scan_type }

    /// Sets the scan location
    pub fn set_location(&mut self, location: Location, building: Option<String>, room: Option<String>) {
        self.scan_location = Some(location);
        self.building = building;
        self.room = room;
    }

    /// Associates the scan with a transfer
    pub fn associate_transfer(&mut self, transfer_id: Uuid) {
        self.transfer_id = Some(transfer_id);
    }

    /// Adds notes to the scan
    pub fn add_notes(&mut self, notes: String) {
        self.scan_notes = Some(notes);
    }
}

impl PropertyCustody {
    /// Creates a new custody record
    pub fn new(
        property_id: Uuid,
        custodian: String,
        assigned_by: String,
        hand_receipt_number: Option<String>,
        transfer_id: Option<Uuid>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            property_id,
            custodian,
            assigned_at: Utc::now(),
            released_at: None,
            assigned_by,
            hand_receipt_number,
            transfer_id,
            notes: None,
        }
    }

    // Getters
    pub fn id(&self) -> Uuid { self.id }
    pub fn property_id(&self) -> Uuid { self.property_id }
    pub fn custodian(&self) -> &str { &self.custodian }
    pub fn assigned_at(&self) -> DateTime<Utc> { self.assigned_at }
    pub fn released_at(&self) -> Option<DateTime<Utc>> { self.released_at }

    /// Releases custody
    pub fn release(&mut self) {
        if self.released_at.is_none() {
            self.released_at = Some(Utc::now());
        }
    }

    /// Adds notes to the custody record
    pub fn add_notes(&mut self, notes: String) {
        self.notes = Some(notes);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transfer_approval_flow() {
        let mut transfer = PropertyTransfer::new(
            Uuid::new_v4(),
            Some("OLD_USER".to_string()),
            "NEW_USER".to_string(),
            "VERIFIER".to_string(),
            true,
        );

        assert_eq!(transfer.status(), &TransferStatus::RequiresApproval);

        // Process approval
        transfer.process_approval(
            "COMMANDER".to_string(),
            true,
            Some("Approved".to_string()),
        ).unwrap();

        assert_eq!(transfer.status(), &TransferStatus::Approved);

        // Complete transfer
        transfer.complete().unwrap();
        assert_eq!(transfer.status(), &TransferStatus::Completed);
    }

    #[test]
    fn test_qr_scan_creation() {
        let device_info = DeviceInfo {
            device_type: "iPhone".to_string(),
            os_version: "iOS 15.0".to_string(),
            app_version: "1.0.0".to_string(),
            device_id: "TEST123".to_string(),
        };

        let mut scan = QRCodeScan::new(
            Uuid::new_v4(),
            "USER".to_string(),
            ScanType::Transfer,
            Some(device_info),
        );

        scan.set_location(
            Location {
                latitude: 34.0,
                longitude: -118.0,
                altitude: Some(100.0),
                accuracy: Some(10.0),
                timestamp: Utc::now(),
                building: Some("HQ".to_string()),
                room: Some("101".to_string()),
            },
            Some("HQ".to_string()),
            Some("101".to_string()),
        );

        assert_eq!(scan.scan_type(), &ScanType::Transfer);
        assert!(scan.scan_location.is_some());
    }
}
