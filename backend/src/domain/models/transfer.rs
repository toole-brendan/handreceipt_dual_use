// backend/src/models/transfer.rs
use uuid::Uuid;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use sha2::{Sha256, Digest};
use crate::domain::models::signature::{SignatureType, CommandSignature};
use crate::types::security::SecurityClassification;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetTransfer {
    pub id: Uuid,
    pub asset_id: Uuid,
    pub from_node: Uuid,
    pub to_node: Uuid,
    pub status: TransferStatus,
    pub timestamp: DateTime<Utc>,
    pub metadata: serde_json::Value,
    pub verification_method: Option<VerificationMethod>,
    pub signatures: Vec<CommandSignature>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Copy)]
pub enum TransferStatus {
    Pending,    // Transfer initiated
    InProgress, // QR code scanned, awaiting verification
    Completed,  // Transfer verified and completed
    Failed,     // Transfer failed (invalid QR, expired, etc)
    Confirmed,  // Transfer confirmed by blockchain
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum VerificationMethod {
    QRCode,     // QR code scan with digital signature
    Manual,     // Manual verification by authorized personnel
    Blockchain, // Blockchain verification of transfer
}

impl AssetTransfer {
    pub fn new(
        asset_id: Uuid,
        from_node: Uuid,
        to_node: Uuid,
        verification_method: Option<VerificationMethod>,
        metadata: serde_json::Value,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            asset_id,
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
        !self.asset_id.is_nil()
    }

    pub fn calculate_hash(&self) -> String {
        let mut hasher = Sha256::new();
        let data = format!("{}{}{}{}{}", 
            self.id,
            self.asset_id,
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

    /// Verifies if a transfer can be completed with the given verification method
    pub fn can_complete(&self, method: &VerificationMethod) -> bool {
        match (self.verification_method.as_ref(), method) {
            (Some(required), provided) if required == provided => true,
            (Some(VerificationMethod::Manual), _) => true, // Manual can override
            _ => false,
        }
    }

    /// Updates transfer status based on verification result
    pub fn update_verification_status(&mut self, success: bool) {
        self.status = if success {
            TransferStatus::Completed
        } else {
            TransferStatus::Failed
        };
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transfer_validation() {
        let transfer = AssetTransfer::new(
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
        let mut transfer = AssetTransfer::new(
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
    fn test_status_updates() {
        let mut transfer = AssetTransfer::new(
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
        assert_eq!(transfer.status, TransferStatus::Failed);
    }
}
