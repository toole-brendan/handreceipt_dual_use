use crate::{
    error::CoreError,
    types::security::{SecurityContext, SecurityClassification},
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Block {
    pub id: Uuid,
    pub header: BlockHeader,
    pub transactions: Vec<Transaction>,
    pub block_height: u64,
    pub total_transactions: u64,
    pub created_at: DateTime<Utc>,
    pub confirmed_at: Option<DateTime<Utc>>,
    pub classification: SecurityClassification,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockHeader {
    pub version: u32,
    pub previous_hash: String,
    pub merkle_root: String,
    pub timestamp: DateTime<Utc>,
    pub difficulty: u32,
    pub nonce: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: Uuid,
    pub transaction_type: TransactionType,
    pub data: TransactionData,
    pub timestamp: DateTime<Utc>,
    pub signature: Option<String>,
    pub classification: SecurityClassification,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum TransactionType {
    AssetTransfer,
    AssetCreation,
    AssetUpdate,
    AssetDeletion,
    NetworkSync,
    PeerDiscovery,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionData {
    pub asset_id: String,
    pub metadata: serde_json::Value,
    pub operation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChainState {
    pub last_block_hash: String,
    pub block_height: u64,
    pub total_transactions: u64,
    pub last_updated: DateTime<Utc>,
    pub status: ChainStatus,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ChainStatus {
    Active,
    Syncing,
    Halted,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub reason: Option<String>,
    pub classification: SecurityClassification,
}

#[async_trait::async_trait]
pub trait BlockchainService: Send + Sync {
    async fn submit_transaction(
        &self,
        transaction: Transaction,
        context: &SecurityContext,
    ) -> Result<Uuid, CoreError>;

    async fn get_transaction(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<Option<Transaction>, CoreError>;

    async fn get_block(
        &self,
        hash: &str,
        context: &SecurityContext,
    ) -> Result<Option<Block>, CoreError>;

    async fn get_chain_state(
        &self,
        context: &SecurityContext,
    ) -> Result<ChainState, CoreError>;
}

#[async_trait::async_trait]
pub trait ConsensusService: Send + Sync {
    async fn validate_block(
        &self,
        block: &Block,
        context: &SecurityContext,
    ) -> Result<ValidationResult, CoreError>;

    async fn propose_block(
        &self,
        transactions: Vec<Transaction>,
        context: &SecurityContext,
    ) -> Result<Block, CoreError>;
}
