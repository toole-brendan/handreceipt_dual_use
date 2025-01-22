use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::collections::HashMap;

use crate::{
    error::CoreError,
    types::{
        security::SecurityContext,
        audit::AuditEvent,
    },
};

#[async_trait]
pub trait BlockchainService: Send + Sync {
    async fn submit_transaction(&self, tx: BlockchainTransaction) -> Result<(), CoreError>;
    async fn get_transaction(&self, id: Uuid) -> Result<Option<BlockchainTransaction>, CoreError>;
    async fn verify_transaction(&self, tx: &BlockchainTransaction) -> Result<bool, CoreError>;
    async fn get_block(&self, height: u64) -> Result<Option<Block>, CoreError>;
    async fn get_latest_block(&self) -> Result<Block, CoreError>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockchainTransaction {
    pub id: Uuid,
    pub transaction_type: TransactionType,
    pub data: TransactionData,
    pub metadata: TransactionMetadata,
    pub signatures: Vec<TransactionSignature>,
    pub timestamp: DateTime<Utc>,
    pub status: TransactionStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Block {
    pub height: u64,
    pub hash: String,
    pub previous_hash: String,
    pub transactions: Vec<BlockchainTransaction>,
    pub timestamp: DateTime<Utc>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionData {
    pub payload: Vec<u8>,
    pub hash: String,
    pub size: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionMetadata {
    pub creator: String,
    pub context: SecurityContext,
    pub audit_events: Vec<AuditEvent>,
    pub custom_fields: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionSignature {
    pub signer: String,
    pub signature: Vec<u8>,
    pub timestamp: DateTime<Utc>,
    pub valid: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum TransactionType {
    AssetCreation,
    AssetTransfer,
    AssetUpdate,
    AssetDeletion,
    AuditRecord,
    SystemEvent,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum TransactionStatus {
    Pending,
    Confirmed,
    Failed,
    Unknown,
}

impl std::fmt::Display for TransactionType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TransactionType::AssetCreation => write!(f, "ASSET_CREATION"),
            TransactionType::AssetTransfer => write!(f, "ASSET_TRANSFER"),
            TransactionType::AssetUpdate => write!(f, "ASSET_UPDATE"),
            TransactionType::AssetDeletion => write!(f, "ASSET_DELETION"),
            TransactionType::AuditRecord => write!(f, "AUDIT_RECORD"),
            TransactionType::SystemEvent => write!(f, "SYSTEM_EVENT"),
        }
    }
}

impl std::str::FromStr for TransactionType {
    type Err = CoreError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_uppercase().as_str() {
            "ASSET_CREATION" => Ok(TransactionType::AssetCreation),
            "ASSET_TRANSFER" => Ok(TransactionType::AssetTransfer),
            "ASSET_UPDATE" => Ok(TransactionType::AssetUpdate),
            "ASSET_DELETION" => Ok(TransactionType::AssetDeletion),
            "AUDIT_RECORD" => Ok(TransactionType::AuditRecord),
            "SYSTEM_EVENT" => Ok(TransactionType::SystemEvent),
            _ => Err(CoreError::Validation(
                format!("Invalid transaction type: {}", s).into()
            )),
        }
    }
}

impl std::fmt::Display for TransactionStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TransactionStatus::Pending => write!(f, "PENDING"),
            TransactionStatus::Confirmed => write!(f, "CONFIRMED"),
            TransactionStatus::Failed => write!(f, "FAILED"),
            TransactionStatus::Unknown => write!(f, "UNKNOWN"),
        }
    }
}

impl std::str::FromStr for TransactionStatus {
    type Err = CoreError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_uppercase().as_str() {
            "PENDING" => Ok(TransactionStatus::Pending),
            "CONFIRMED" => Ok(TransactionStatus::Confirmed),
            "FAILED" => Ok(TransactionStatus::Failed),
            "UNKNOWN" => Ok(TransactionStatus::Unknown),
            _ => Err(CoreError::Validation(
                format!("Invalid transaction status: {}", s).into()
            )),
        }
    }
}
