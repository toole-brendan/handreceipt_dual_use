use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use async_trait::async_trait;
use uuid::Uuid;
use std::collections::HashMap;
use futures::future::try_join_all;
use parking_lot::RwLock as ParkingRwLock;
use sawtooth_sdk::signing::secp256k1::{Secp256k1Context, Secp256k1PrivateKey, Secp256k1PublicKey};

use crate::{
    domain::models::transfer::{PropertyTransferRecord, TransferStatus},
    error::CoreError,
    types::{
        security::SecurityContext,
        blockchain::{
            BlockchainTransaction, TransactionType, TransactionData, 
            TransactionMetadata, TransactionStatus,
        },
    },
    infrastructure::blockchain::{
        TransferVerification,
        merkle::{MerkleTree, MerkleProof},
        verification::VerificationResult,
    },
};

use super::{
    client::SawtoothClient,
    transaction::HandReceiptPayload,
};

const MAX_BATCH_SIZE: usize = 100;

pub struct SawtoothVerification {
    client: Arc<SawtoothClient>,
    current_batch_tree: Arc<RwLock<MerkleTree>>,
}

// Explicitly implement Send + Sync since all fields are Send + Sync
unsafe impl Send for SawtoothVerification {}
unsafe impl Sync for SawtoothVerification {}

impl SawtoothVerification {
    pub fn new(client: Arc<SawtoothClient>) -> Self {
        Self {
            client,
            current_batch_tree: Arc::new(RwLock::new(MerkleTree::new(&[]).unwrap())),
        }
    }

    fn create_blockchain_transaction(
        &self,
        transfer: &PropertyTransferRecord,
        context: &SecurityContext,
    ) -> Result<BlockchainTransaction, CoreError> {
        let payload = serde_json::to_vec(&transfer)
            .map_err(|e| CoreError::Serialization(e.to_string()))?;
        let payload_len = payload.len();

        Ok(BlockchainTransaction {
            id: Uuid::parse_str(&transfer.id.to_string())
                .map_err(|e| CoreError::Serialization(e.to_string()))?,
            transaction_type: TransactionType::AssetTransfer,
            data: TransactionData {
                payload,
                hash: format!("TRANSFER_{}", transfer.id),
                size: payload_len,
            },
            metadata: TransactionMetadata {
                creator: transfer.from_node.clone(),
                context: context.clone(),
                audit_events: Vec::new(),
                custom_fields: std::collections::HashMap::new(),
            },
            signatures: Vec::new(),
            timestamp: Utc::now(),
            status: match transfer.status {
                TransferStatus::Pending => TransactionStatus::Pending,
                TransferStatus::Completed => TransactionStatus::Confirmed,
                TransferStatus::Rejected => TransactionStatus::Failed,
                _ => TransactionStatus::Unknown,
            },
        })
    }

    async fn process_batch(
        &self,
        transfers: &[PropertyTransferRecord],
        context: &SecurityContext,
    ) -> Result<Vec<String>, CoreError> {
        // Create batch of transfer payloads
        let payloads: Vec<HandReceiptPayload> = transfers
            .iter()
            .map(|transfer| HandReceiptPayload::Transfer {
                property_id: transfer.id.to_string(),
                to_custodian: transfer.to_node.clone(),
                transfer_id: Uuid::new_v4().to_string(),
            })
            .collect();

        // Create blockchain transactions for Merkle tree
        let transactions: Vec<BlockchainTransaction> = transfers
            .iter()
            .map(|transfer| self.create_blockchain_transaction(transfer, context))
            .collect::<Result<Vec<_>, _>>()?;

        // Update Merkle tree with new transactions
        {
            let mut tree = self.current_batch_tree.write().await;
            *tree = MerkleTree::new(&transactions)
                .map_err(|e| CoreError::ValidationError(e.to_string()))?;
        }

        // Submit batch to Sawtooth
        let futures: Vec<_> = payloads
            .chunks(MAX_BATCH_SIZE)
            .map(|chunk| {
                let client = Arc::clone(&self.client);
                async move {
                    let mut batch_results = Vec::new();
                    for payload in chunk {
                        if let HandReceiptPayload::Transfer { property_id, to_custodian, transfer_id } = payload {
                            let result = client.transfer_property(
                                property_id.clone(),
                                to_custodian.clone(),
                            ).await?;
                            batch_results.push(result);
                        }
                    }
                    Ok::<Vec<String>, CoreError>(batch_results)
                }
            })
            .collect();

        // Wait for all batches to complete
        let results = try_join_all(futures).await?;
        
        // Flatten results
        Ok(results.into_iter().flatten().collect())
    }

    async fn verify_transfer_internal(
        &self,
        transfer: &PropertyTransferRecord,
        context: &SecurityContext,
    ) -> Result<VerificationResult, CoreError> {
        let blockchain_tx = self.create_blockchain_transaction(transfer, context)?;
        let merkle_proof = self.current_batch_tree.read().await.generate_proof(&blockchain_tx)?;
        
        let transfer_id = self.client.transfer_property(
            transfer.id.to_string(),
            transfer.to_node.clone(),
        ).await
        .map_err(|e| CoreError::Blockchain(e))?;

        Ok(VerificationResult {
            status: TransferStatus::Completed,
            blockchain_hash: Some(transfer_id),
            merkle_proof: Some(merkle_proof),
            verified_at: Utc::now(),
            signatures: Vec::new(),
        })
    }
}

#[async_trait]
impl TransferVerification for SawtoothVerification {
    async fn verify_transfer(
        &self,
        transfer: &PropertyTransferRecord,
        context: &SecurityContext,
    ) -> Result<VerificationResult, CoreError> {
        // Create all non-async data first
        let blockchain_tx = self.create_blockchain_transaction(transfer, context)?;
        
        // Clone Arc fields before async operations
        let client = Arc::clone(&self.client);
        let batch_tree = Arc::clone(&self.current_batch_tree);
        
        // Drop any references to non-Send types before async operations
        let transfer_data = (transfer.id.to_string(), transfer.to_node.clone());
        
        // Create transfer on blockchain in a separate scope
        let transfer_id = {
            let result = client.transfer_property(
                transfer_data.0,
                transfer_data.1,
            ).await;
            result.map_err(|e| CoreError::Blockchain(e))?
        };

        // Generate merkle proof in a separate scope
        let merkle_proof = {
            let tree = batch_tree.read().await;
            tree.generate_proof(&blockchain_tx)?
        };

        Ok(VerificationResult {
            status: TransferStatus::Completed,
            blockchain_hash: Some(transfer_id),
            merkle_proof: Some(merkle_proof),
            verified_at: Utc::now(),
            signatures: Vec::new(),
        })
    }

    async fn get_transfer_status(
        &self,
        _transfer_id: i32,
        _context: &SecurityContext,
    ) -> Result<TransferStatus, CoreError> {
        Ok(TransferStatus::Completed)
    }

    async fn record_transfer(
        &self,
        transfer: &PropertyTransferRecord,
        _context: &SecurityContext,
    ) -> Result<String, CoreError> {
        // Clone Arc and extract data before async operations
        let client = Arc::clone(&self.client);
        let transfer_data = (transfer.id.to_string(), transfer.to_node.clone());
        
        // Perform async operation with cloned client in a separate scope
        let result = {
            client.transfer_property(
                transfer_data.0,
                transfer_data.1,
            ).await
        };
        
        result.map_err(|e| CoreError::Blockchain(e))
    }

    async fn record_batch(
        &self,
        transfers: &[PropertyTransferRecord],
        context: &SecurityContext,
    ) -> Result<Vec<String>, CoreError> {
        let mut results = Vec::new();
        for transfer in transfers {
            let result = self.record_transfer(transfer, context).await?;
            results.push(result);
        }
        Ok(results)
    }
} 
