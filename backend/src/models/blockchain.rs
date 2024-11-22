use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::core::SecurityClassification;

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