use std::sync::Arc;
use async_trait::async_trait;
use tokio::sync::RwLock;
use chrono::Utc;
use uuid::Uuid;

pub mod consensus;
pub mod network;
pub mod transaction;
pub mod types;

use crate::{
    error::{
        core::CoreError,
        blockchain::BlockchainError,
    },
    types::{
        security::{SecurityContext, SecurityClassification},
        validation::{ValidationContext, ValidationResult},
        audit::{
            AuditEvent, AuditTrail, AuditEventType, AuditContext, AuditSeverity,
        },
        signature::{SignatureMetadata, SignatureType, SignatureAlgorithm}, // Updated import path
        sync::{SyncStatus, SyncType, Change},
        mesh::NodeInfo,
        blockchain::ChainStatus,
    },
};

// Re-export core blockchain components
pub use self::{
    types::{Block, Transaction, TransactionData, ChainState},
    network::{
        NetworkManager, NetworkService, MeshNetworkService,
        core::{NetworkCore, SyncService},
        mesh::MeshService,
        p2p::P2PService,
    },
    consensus::{ConsensusEngine, ValidationEngine},
    transaction::{TransactionProcessor, TransactionValidator},
};

#[async_trait]
pub trait BlockchainService: Send + Sync {
    async fn submit_transaction(
        &self,
        transaction: Transaction,
        context: &SecurityContext,
    ) -> Result<(), CoreError>;

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

#[async_trait]
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

pub struct BlockchainManager {
    consensus: Arc<ConsensusEngine>,
    network: Arc<NetworkManager>,
    processor: Arc<TransactionProcessor>,
    validator: Arc<TransactionValidator>,
    audit_trail: Arc<AuditTrail>,
    chain_state: Arc<RwLock<ChainState>>,
}

impl BlockchainManager {
    pub fn new(
        consensus: ConsensusEngine,
        network: NetworkManager,
        processor: TransactionProcessor,
        validator: TransactionValidator,
        audit_trail: Arc<AuditTrail>,
    ) -> Self {
        Self {
            consensus: Arc::new(consensus),
            network: Arc::new(network),
            processor: Arc::new(processor),
            validator: Arc::new(validator),
            audit_trail,
            chain_state: Arc::new(RwLock::new(ChainState {
                last_block_hash: String::new(),
                block_height: 0,
                total_transactions: 0,
                last_updated: Utc::now(),
                status: ChainStatus::Active,
            })),
        }
    }

    pub async fn submit_transaction(
        &self,
        transaction: Transaction,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        // Validate transaction
        let validation_context = ValidationContext::new(context.classification);
        if !self.validator.validate_transaction(&transaction, &validation_context).await? {
            return Err(CoreError::Blockchain(BlockchainError::InvalidTransaction("Validation failed".to_string())));
        }

        // Log audit event
        let audit_event = AuditEvent::new(
            AuditEventType::TransactionSubmitted,
            serde_json::json!({
                "transaction_id": transaction.id,
                "transaction_type": transaction.transaction_type,
            }),
            AuditContext::new(
                "submit_transaction".to_string(),
                AuditSeverity::Low,
                context.classification,
            ),
            SignatureMetadata::new(
                Uuid::new_v4(),
                vec![],
                Uuid::new_v4(),
                context.classification,
                SignatureType::Transaction,
                SignatureAlgorithm::Ed25519,
            ),
        );
        self.audit_trail.log_event(audit_event, context).await?;

        // Process transaction
        self.processor.process_transaction(&mut transaction.clone(), context).await?;

        Ok(())
    }

    pub async fn create_block(
        &self,
        transactions: Vec<Transaction>,
        context: &SecurityContext,
    ) -> Result<Block, CoreError> {
        // Create block
        let block = self.consensus.create_block(transactions, context).await?;

        // Log audit event
        let audit_event = AuditEvent::new(
            AuditEventType::BlockCreated,
            serde_json::json!({
                "block_id": block.id,
                "block_height": block.block_height,
                "transaction_count": block.transactions.len(),
            }),
            AuditContext::new(
                "create_block".to_string(),
                AuditSeverity::Low,
                context.classification,
            ),
            SignatureMetadata::new(
                Uuid::new_v4(),
                vec![],
                Uuid::new_v4(),
                context.classification,
                SignatureType::Block,
                SignatureAlgorithm::Ed25519,
            ),
        );
        self.audit_trail.log_event(audit_event, context).await?;

        Ok(block)
    }

    pub async fn get_chain_state(&self) -> Result<ChainState, CoreError> {
        Ok(self.chain_state.read().await.clone())
    }

    pub async fn update_chain_state(&self, state: ChainState) -> Result<(), CoreError> {
        *self.chain_state.write().await = state;
        Ok(())
    }
}

#[async_trait]
impl BlockchainService for BlockchainManager {
    async fn submit_transaction(
        &self,
        transaction: Transaction,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        self.submit_transaction(transaction, context).await
    }

    async fn get_transaction(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<Option<Transaction>, CoreError> {
        // Implementation here
        Ok(None)
    }

    async fn get_block(
        &self,
        hash: &str,
        context: &SecurityContext,
    ) -> Result<Option<Block>, CoreError> {
        // Implementation here
        Ok(None)
    }

    async fn get_chain_state(
        &self,
        _context: &SecurityContext,
    ) -> Result<ChainState, CoreError> {
        self.get_chain_state().await
    }
}

#[async_trait]
impl ConsensusService for BlockchainManager {
    async fn validate_block(
        &self,
        block: &Block,
        context: &SecurityContext,
    ) -> Result<ValidationResult, CoreError> {
        let validation_context = ValidationContext::new(context.classification);
        self.consensus.validate_block(block, &validation_context).await
    }

    async fn propose_block(
        &self,
        transactions: Vec<Transaction>,
        context: &SecurityContext,
    ) -> Result<Block, CoreError> {
        self.create_block(transactions, context).await
    }
}
