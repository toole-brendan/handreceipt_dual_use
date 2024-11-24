use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::types::security::SecurityClassification;

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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub data: String,
    pub signature: String,
    pub classification: SecurityClassification,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockchainTransaction {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub data: String,
    pub signature: String,
    pub classification: SecurityClassification,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockchainNode {
    pub id: Uuid,
    pub address: String,
    pub status: NodeStatus,
    pub last_seen: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NodeStatus {
    Active,
    Inactive,
    Syncing,
    Error,
} 