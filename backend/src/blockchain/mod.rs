use std::time::Duration;
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use crate::types::{
    error::CoreError,
    security::SecurityContext,
};

pub mod consensus;
pub mod network;
pub mod transaction;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Block {
    pub id: Uuid,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub previous_hash: String,
    pub hash: String,
    pub transactions: Vec<Transaction>,
    pub validator_id: ValidatorId,
    pub signature: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: Uuid,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub data: TransactionData,
    pub signature: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransactionData {
    AssetTransfer {
        asset_id: Uuid,
        from: String,
        to: String,
        metadata: serde_json::Value,
    },
    AssetVerification {
        asset_id: Uuid,
        verifier: String,
        result: bool,
        metadata: serde_json::Value,
    },
}

pub type ValidatorId = Uuid;

#[async_trait::async_trait]
pub trait BlockchainService: Send + Sync {
    async fn add_block(&self, block: Block, context: &SecurityContext) -> Result<(), CoreError>;
    async fn get_block(&self, id: Uuid, context: &SecurityContext) -> Result<Option<Block>, CoreError>;
    async fn add_transaction(&self, tx: Transaction, context: &SecurityContext) -> Result<(), CoreError>;
    async fn get_transaction(&self, id: Uuid, context: &SecurityContext) -> Result<Option<Transaction>, CoreError>;
}

#[async_trait::async_trait]
pub trait ConsensusService: Send + Sync {
    async fn validate_block(&self, block: &Block, context: &SecurityContext) -> Result<bool, CoreError>;
    async fn validate_transaction(&self, tx: &Transaction, context: &SecurityContext) -> Result<bool, CoreError>;
}

pub struct BlockchainConfig {
    pub block_time: Duration,
    pub max_transactions: usize,
    pub consensus_threshold: f64,
}

impl Default for BlockchainConfig {
    fn default() -> Self {
        Self {
            block_time: Duration::from_secs(60),
            max_transactions: 1000,
            consensus_threshold: 0.67,
        }
    }
}
