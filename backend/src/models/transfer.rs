// backend/src/models/transfer.rs
use uuid::Uuid;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use sha2::{Sha256, Digest};
use crate::models::signature::{SignatureType, CommandSignature};
use crate::core::SecurityClassification;

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
    Pending,
    InProgress,
    Completed,
    Failed,
    Confirmed,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum VerificationMethod {
    QRCode,
    RFID,
    Manual,
    Blockchain,
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
            // You'll need to get the classification from somewhere
            SecurityClassification::Unclassified,
        ));
    }
}
