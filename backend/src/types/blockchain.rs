use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::security::SecurityClassification;

/// Represents a block in the blockchain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Block {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub transactions: Vec<Transaction>,
    pub previous_hash: String,
    pub hash: String,
    pub nonce: u64,
    pub classification: SecurityClassification,
}

/// Represents a transaction in the blockchain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub data: String,
    pub signature: String,
    pub classification: SecurityClassification,
}

/// Represents a blockchain transaction before it's included in a block
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockchainTransaction {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub data: String,
    pub signature: String,
    pub classification: SecurityClassification,
}

/// Represents a node in the blockchain network
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockchainNode {
    pub id: Uuid,
    pub address: String,
    pub status: NodeStatus,
    pub last_seen: DateTime<Utc>,
}

/// Represents the status of a blockchain node
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum NodeStatus {
    Active,
    Inactive,
    Syncing,
    Error,
}

impl Block {
    pub fn new(transactions: Vec<Transaction>, previous_hash: String, classification: SecurityClassification) -> Self {
        Self {
            id: Uuid::new_v4(),
            timestamp: Utc::now(),
            transactions,
            previous_hash,
            hash: String::new(), // Will be set during mining
            nonce: 0,            // Will be set during mining
            classification,
        }
    }

    pub fn calculate_hash(&self) -> String {
        use sha2::{Sha256, Digest};
        let mut hasher = Sha256::new();
        
        // Combine all fields into a single string
        let data = format!(
            "{}{}{}{}{}",
            self.id,
            self.timestamp,
            serde_json::to_string(&self.transactions).unwrap_or_default(),
            self.previous_hash,
            self.nonce
        );
        
        hasher.update(data.as_bytes());
        format!("{:x}", hasher.finalize())
    }
}

impl Transaction {
    pub fn new(data: String, signature: String, classification: SecurityClassification) -> Self {
        Self {
            id: Uuid::new_v4(),
            timestamp: Utc::now(),
            data,
            signature,
            classification,
        }
    }

    pub fn verify_signature(&self) -> bool {
        // TODO: Implement signature verification
        // This would typically involve:
        // 1. Extracting the public key from the signature
        // 2. Verifying the signature against the transaction data
        // 3. Checking if the signer had appropriate permissions
        true
    }
}

impl BlockchainNode {
    pub fn new(address: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            address,
            status: NodeStatus::Inactive,
            last_seen: Utc::now(),
        }
    }

    pub fn update_status(&mut self, status: NodeStatus) {
        self.status = status;
        self.last_seen = Utc::now();
    }

    pub fn is_active(&self) -> bool {
        self.status == NodeStatus::Active
    }

    pub fn is_syncing(&self) -> bool {
        self.status == NodeStatus::Syncing
    }

    pub fn has_error(&self) -> bool {
        self.status == NodeStatus::Error
    }
}
