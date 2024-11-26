use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use async_trait::async_trait;
use ed25519_dalek::SigningKey;
use rand::rngs::OsRng;
use std::collections::HashMap;
use futures::TryFutureExt;
use uuid::Uuid;

use crate::{
    domain::models::transfer::{PropertyTransferRecord, TransferStatus},
    error::CoreError,
    types::{
        security::SecurityContext,
        blockchain::{BlockchainTransaction, TransactionType, TransactionData, TransactionMetadata, TransactionStatus},
    },
    error::blockchain::BlockchainError,
};

use super::{
    authority::{
        AuthorityNode,
        PropertyTransfer,
        SignerRole,
        TransferSignature,
        AuthorityService,
        MilitaryCertificate,
    },
    merkle::{MerkleTree, MerkleProof},
};

const BATCH_SIZE: usize = 100;
const BATCH_TIMEOUT_SECS: i64 = 30;

#[derive(Debug, Serialize, Deserialize)]
pub struct VerificationResult {
    pub status: TransferStatus,
    pub blockchain_hash: Option<String>,
    pub merkle_proof: Option<MerkleProof>,
    pub verified_at: DateTime<Utc>,
    pub signatures: Vec<TransferSignature>,
}

#[derive(Debug)]
pub struct TransactionBatch {
    pub transactions: Vec<PropertyTransfer>,
    pub merkle_tree: MerkleTree,
    pub created_at: DateTime<Utc>,
}

impl TransactionBatch {
    fn to_blockchain_transactions(&self) -> Result<Vec<BlockchainTransaction>, BlockchainError> {
        self.transactions.iter()
            .map(|t| {
                let data = serde_json::to_vec(&t)
                    .map_err(|e| BlockchainError::SerializationError(e.to_string()))?;
                let data_len = data.len();
                
                Ok(BlockchainTransaction {
                    id: Uuid::new_v4(),
                    transaction_type: TransactionType::AssetTransfer,
                    data: TransactionData {
                        payload: data,
                        hash: format!("TRANSFER_{}", t.property_id),
                        size: data_len,
                    },
                    metadata: TransactionMetadata {
                        creator: t.initiated_by.clone(),
                        context: SecurityContext::default(),
                        audit_events: Vec::new(),
                        custom_fields: HashMap::new(),
                    },
                    signatures: Vec::new(),
                    timestamp: t.timestamp,
                    status: TransactionStatus::Pending,
                })
            })
            .collect()
    }
}

#[async_trait]
pub trait TransferVerification: Send + Sync {
    /// Verifies a transfer on the blockchain
    async fn verify_transfer(
        &self,
        transfer: &PropertyTransferRecord,
        context: &SecurityContext,
    ) -> Result<VerificationResult, CoreError>;

    /// Gets transfer status from blockchain
    async fn get_transfer_status(
        &self,
        transfer_id: i32,
        context: &SecurityContext,
    ) -> Result<TransferStatus, CoreError>;

    /// Records transfer on blockchain
    async fn record_transfer(
        &self,
        transfer: &PropertyTransferRecord,
        context: &SecurityContext,
    ) -> Result<String, CoreError>;

    /// Records a batch of transfers
    async fn record_batch(
        &self,
        transfers: &[PropertyTransferRecord],
        context: &SecurityContext,
    ) -> Result<Vec<String>, CoreError>;
}

pub struct BlockchainVerification {
    authority_node: Arc<AuthorityNode>,
    current_batch: Arc<RwLock<Option<TransactionBatch>>>,
}

impl BlockchainVerification {
    pub fn new(authority_node: Arc<AuthorityNode>) -> Self {
        Self {
            authority_node,
            current_batch: Arc::new(RwLock::new(None)),
        }
    }

    /// Converts domain transfer to blockchain transfer
    fn to_blockchain_transfer(&self, transfer: &PropertyTransferRecord) -> PropertyTransfer {
        PropertyTransfer {
            property_id: Uuid::new_v4(),
            from_custodian: Some(transfer.from_node.clone()),
            to_custodian: transfer.to_node.clone(),
            initiated_by: transfer.id.to_string(),
            requires_approval: transfer.status == TransferStatus::Pending,
            timestamp: transfer.timestamp,
            signatures: Vec::new(),
        }
    }

    /// Gets signer role based on security context
    fn get_signer_role(&self, context: &SecurityContext) -> SignerRole {
        if context.is_officer() {
            SignerRole::Commander
        } else if context.can_handle_sensitive_items() {
            SignerRole::SupplyOfficer
        } else {
            SignerRole::Custodian
        }
    }

    /// Creates a new transaction batch
    async fn create_batch(&self, transfers: Vec<PropertyTransfer>) -> Result<TransactionBatch, CoreError> {
        let batch = TransactionBatch {
            transactions: transfers,
            merkle_tree: MerkleTree::new(&[])?, // Empty tree initially
            created_at: Utc::now(),
        };

        // Convert to blockchain transactions and create merkle tree
        let blockchain_txs = batch.to_blockchain_transactions()?;
        let merkle_tree = MerkleTree::new(&blockchain_txs)?;

        Ok(TransactionBatch {
            transactions: batch.transactions,
            merkle_tree,
            created_at: batch.created_at,
        })
    }

    /// Checks if current batch should be processed
    async fn should_process_batch(&self) -> bool {
        let batch = self.current_batch.read().await;
        if let Some(batch) = batch.as_ref() {
            // Process if batch is full or timeout reached
            batch.transactions.len() >= BATCH_SIZE ||
            (Utc::now() - batch.created_at).num_seconds() >= BATCH_TIMEOUT_SECS
        } else {
            false
        }
    }

    /// Processes the current batch
    async fn process_batch(&self) -> Result<(), CoreError> {
        let mut batch_lock = self.current_batch.write().await;
        if let Some(batch) = batch_lock.take() {
            // Record all transfers in batch
            for transfer in &batch.transactions {
                self.authority_node
                    .record_transfer(transfer)
                    .await
                    .map_err(|e| BlockchainError::ValidationError(e.to_string()))?;
            }
        }
        Ok(())
    }
}

#[async_trait]
impl TransferVerification for BlockchainVerification {
    async fn verify_transfer(
        &self,
        transfer: &PropertyTransferRecord,
        context: &SecurityContext,
    ) -> Result<VerificationResult, CoreError> {
        // Convert to blockchain transfer
        let mut blockchain_transfer = self.to_blockchain_transfer(transfer);

        // Sign transfer with current authority
        let role = self.get_signer_role(context);
        self.authority_node
            .sign_transfer(&mut blockchain_transfer, role.clone())
            .await
            .map_err(|e| BlockchainError::ValidationError(e.to_string()))?;

        // Validate transfer
        self.authority_node
            .validate_transfer(&blockchain_transfer)
            .await
            .map_err(|e| BlockchainError::ValidationError(e.to_string()))?;

        // Add to current batch or create new batch
        let mut batch_lock = self.current_batch.write().await;
        let batch = if let Some(batch) = batch_lock.as_mut() {
            batch.transactions.push(blockchain_transfer.clone());
            batch
        } else {
            let new_batch = self.create_batch(vec![blockchain_transfer.clone()]).await?;
            *batch_lock = Some(new_batch);
            batch_lock.as_ref().unwrap()
        };

        // Convert to blockchain transaction for merkle proof
        let blockchain_tx = BlockchainTransaction {
            id: Uuid::new_v4(),
            transaction_type: TransactionType::AssetTransfer,
            data: TransactionData {
                payload: serde_json::to_vec(&blockchain_transfer)
                    .map_err(|e| BlockchainError::SerializationError(e.to_string()))?,
                hash: format!("TRANSFER_{}", blockchain_transfer.property_id),
                size: 0,
            },
            metadata: TransactionMetadata {
                creator: blockchain_transfer.initiated_by.clone(),
                context: context.clone(),
                audit_events: Vec::new(),
                custom_fields: HashMap::new(),
            },
            signatures: Vec::new(),
            timestamp: blockchain_transfer.timestamp,
            status: TransactionStatus::Pending,
        };

        let merkle_proof = batch.merkle_tree.generate_proof(&blockchain_tx)?;
        let blockchain_hash = blockchain_tx.data.hash.clone();

        Ok(VerificationResult {
            status: transfer.status,
            blockchain_hash: Some(blockchain_hash),
            merkle_proof: Some(merkle_proof),
            verified_at: Utc::now(),
            signatures: blockchain_transfer.signatures,
        })
    }

    async fn get_transfer_status(
        &self,
        transfer_id: i32,
        _context: &SecurityContext,
    ) -> Result<TransferStatus, CoreError> {
        // For now, just return pending status
        // TODO: Implement actual blockchain status check
        Ok(TransferStatus::Pending)
    }

    async fn record_transfer(
        &self,
        transfer: &PropertyTransferRecord,
        context: &SecurityContext,
    ) -> Result<String, CoreError> {
        let blockchain_transfer = self.to_blockchain_transfer(transfer);
        
        // Record transfer on authority node
        self.authority_node
            .record_transfer(&blockchain_transfer)
            .await
            .map_err(|e| BlockchainError::ValidationError(e.to_string()))?;

        Ok(format!("TRANSFER_{}", blockchain_transfer.property_id))
    }

    async fn record_batch(
        &self,
        transfers: &[PropertyTransferRecord],
        context: &SecurityContext,
    ) -> Result<Vec<String>, CoreError> {
        let mut hashes = Vec::new();
        
        for transfer in transfers {
            let hash = self.record_transfer(transfer, context).await?;
            hashes.push(hash);
        }

        Ok(hashes)
    }
}
