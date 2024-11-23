use crate::{
    error::{
        core::CoreError,
        blockchain::BlockchainError,
    },
    types::{
        security::{SecurityContext, SecurityClassification},
        mesh::{PeerInfo, Message},
    },
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkState {
    pub connected_peers: Vec<PeerInfo>,
    pub pending_messages: Vec<Message>,
    pub sync_status: NetworkSyncStatus,
    pub last_activity: DateTime<Utc>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum NetworkSyncStatus {
    Active,
    Syncing,
    Disconnected,
    Failed,
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

#[async_trait::async_trait]
pub trait NetworkService: Send + Sync {
    async fn broadcast_transaction(
        &self,
        transaction: Transaction,
        context: &SecurityContext,
    ) -> Result<(), CoreError>;

    async fn broadcast_block(
        &self,
        block: Block,
        context: &SecurityContext,
    ) -> Result<(), CoreError>;

    async fn get_network_state(
        &self,
        context: &SecurityContext,
    ) -> Result<NetworkState, CoreError>;

    async fn connect_peer(
        &self,
        peer: PeerInfo,
        context: &SecurityContext,
    ) -> Result<(), CoreError>;

    async fn disconnect_peer(
        &self,
        peer_id: &str,
        context: &SecurityContext,
    ) -> Result<(), CoreError>;
}

impl std::fmt::Display for ChainStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Active => write!(f, "ACTIVE"),
            Self::Syncing => write!(f, "SYNCING"),
            Self::Halted => write!(f, "HALTED"),
            Self::Failed => write!(f, "FAILED"),
        }
    }
}

impl std::fmt::Display for NetworkSyncStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Active => write!(f, "ACTIVE"),
            Self::Syncing => write!(f, "SYNCING"),
            Self::Disconnected => write!(f, "DISCONNECTED"),
            Self::Failed => write!(f, "FAILED"),
        }
    }
}

impl std::fmt::Display for TransactionType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::AssetTransfer => write!(f, "ASSET_TRANSFER"),
            Self::AssetCreation => write!(f, "ASSET_CREATION"),
            Self::AssetUpdate => write!(f, "ASSET_UPDATE"),
            Self::AssetDeletion => write!(f, "ASSET_DELETION"),
            Self::NetworkSync => write!(f, "NETWORK_SYNC"),
            Self::PeerDiscovery => write!(f, "PEER_DISCOVERY"),
        }
    }
}
