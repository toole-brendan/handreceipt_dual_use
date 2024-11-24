use uuid::Uuid;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use sha2::{Sha256, Digest};
use crate::domain::models::signature::{SignatureType, CommandSignature};
use crate::types::security::SecurityClassification;
use crate::domain::models::location::Location;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum TransferStatus {
    Pending,
    PendingApproval,
    Approved,
    Rejected,
    Completed,
    Cancelled,
    InProgress,
    Confirmed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyTransferRecord {
    pub id: Uuid,
    pub property_id: Uuid,
    pub from_node: Uuid,
    pub to_node: Uuid,
    pub status: TransferStatus,
    pub timestamp: DateTime<Utc>,
    pub metadata: serde_json::Value,
    pub verification_method: Option<VerificationMethod>,
    pub signatures: Vec<CommandSignature>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyTransfer {
    pub id: i64,
    pub property_id: Uuid,
    pub from_custodian: Option<String>,
    pub to_custodian: String,
    pub verifier: String,
    pub transfer_date: DateTime<Utc>,
    pub reason: Option<String>,
    pub hand_receipt_number: Option<String>,
    pub location: Option<Location>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum VerificationMethod {
    QRCode,     // QR code scan with digital signature
    Manual,     // Manual verification by authorized personnel
    Blockchain, // Blockchain verification of transfer
}

impl PropertyTransferRecord {
    pub fn new(
        property_id: Uuid,
        from_node: Uuid,
        to_node: Uuid,
        verification_method: Option<VerificationMethod>,
        metadata: serde_json::Value,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            property_id,
            from_node,
            to_node,
            status: TransferStatus::Pending,
            timestamp: Utc::now(),
            metadata,
            verification_method,
            signatures: Vec::new(),
        }
    }

    pub fn is_valid(&self) -> bool {
        // Basic validation rules
        self.from_node != self.to_node && 
        self.timestamp <= Utc::now() &&
        !self.property_id.is_nil()
    }

    pub fn calculate_hash(&self) -> String {
        let mut hasher = Sha256::new();
        let data = format!("{}{}{}{}{}", 
            self.id,
            self.property_id,
            self.from_node,
            self.to_node,
            self.timestamp
        );
        hasher.update(data.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    pub fn add_signature(&mut self, user_id: Uuid, signature: String, device_id: String) {
        self.signatures.push(CommandSignature::new(
            user_id,
            SignatureType::Transfer,
            signature,
            device_id,
            SecurityClassification::Unclassified,
        ));
    }

    pub fn can_complete(&self, method: &VerificationMethod) -> bool {
        match (self.verification_method.as_ref(), method) {
            (Some(required), provided) if required == provided => true,
            (Some(VerificationMethod::Manual), _) => true, // Manual can override
            _ => false,
        }
    }

    pub fn update_verification_status(&mut self, success: bool) {
        self.status = if success {
            TransferStatus::Completed
        } else {
            TransferStatus::Rejected
        };
    }
}

impl PropertyTransfer {
    pub fn new(
        property_id: Uuid,
        to_custodian: String,
        verifier: String,
        hand_receipt_number: Option<String>,
        location: Option<Location>,
    ) -> Self {
        Self {
            id: 0, // Will be set by database
            property_id,
            from_custodian: None,
            to_custodian,
            verifier,
            transfer_date: Utc::now(),
            reason: None,
            hand_receipt_number,
            location,
            notes: None,
        }
    }

    pub fn with_reason(mut self, reason: String) -> Self {
        self.reason = Some(reason);
        self
    }

    pub fn with_notes(mut self, notes: String) -> Self {
        self.notes = Some(notes);
        self
    }

    pub fn with_from_custodian(mut self, from_custodian: String) -> Self {
        self.from_custodian = Some(from_custodian);
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transfer_validation() {
        let transfer = PropertyTransferRecord::new(
            Uuid::new_v4(),
            Uuid::new_v4(),
            Uuid::new_v4(),
            Some(VerificationMethod::QRCode),
            serde_json::json!({}),
        );

        assert!(transfer.is_valid());
    }

    #[test]
    fn test_verification_methods() {
        let mut transfer = PropertyTransferRecord::new(
            Uuid::new_v4(),
            Uuid::new_v4(),
            Uuid::new_v4(),
            Some(VerificationMethod::QRCode),
            serde_json::json!({}),
        );

        // Test QR code verification
        assert!(transfer.can_complete(&VerificationMethod::QRCode));
        assert!(!transfer.can_complete(&VerificationMethod::Blockchain));

        // Test manual override
        transfer.verification_method = Some(VerificationMethod::Manual);
        assert!(transfer.can_complete(&VerificationMethod::QRCode));
        assert!(transfer.can_complete(&VerificationMethod::Manual));
        assert!(transfer.can_complete(&VerificationMethod::Blockchain));
    }

    #[test]
    fn test_verification_status() {
        let mut transfer = PropertyTransferRecord::new(
            Uuid::new_v4(),
            Uuid::new_v4(),
            Uuid::new_v4(),
            Some(VerificationMethod::QRCode),
            serde_json::json!({}),
        );

        assert_eq!(transfer.status, TransferStatus::Pending);

        transfer.update_verification_status(true);
        assert_eq!(transfer.status, TransferStatus::Completed);

        transfer.update_verification_status(false);
        assert_eq!(transfer.status, TransferStatus::Rejected);
    }
}
