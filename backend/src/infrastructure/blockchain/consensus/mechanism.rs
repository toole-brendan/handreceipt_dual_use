use std::sync::Arc;
use tokio::sync::RwLock;
use sha2::{Sha256, Digest};
use uuid::Uuid;
use chrono::Utc;
use async_trait::async_trait;

use crate::{
    error::blockchain::BlockchainError,
    types::{
        security::{SecurityContext, SecurityClassification},
        blockchain::{Block, Transaction, ValidationResult, ChainState},
        validation::{ValidationContext, ValidationRule, ValidationSeverity},
        signature::{SignatureMetadata, SignatureType, SignatureAlgorithm},
        audit::{AuditEvent, AuditEventType, AuditContext, AuditSeverity},
    },
};

use super::{ConsensusService, ValidatorInfo, ValidatorStatus, ValidationEngine};

#[async_trait]
pub trait AuditTrailHandler: Send + Sync {
    async fn log_event(&self, event: AuditEvent, context: &SecurityContext) -> Result<(), BlockchainError>;
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ConsensusConfig {
    pub min_validators: usize,
    pub max_validators: usize,
    pub block_time: u64,
    pub max_block_size: usize,
    pub min_difficulty: u32,
    pub max_difficulty: u32,
}

impl Default for ConsensusConfig {
    fn default() -> Self {
        Self {
            min_validators: 3,
            max_validators: 10,
            block_time: 15,
            max_block_size: 1024 * 1024, // 1MB
            min_difficulty: 1,
            max_difficulty: 32,
        }
    }
}

pub struct ConsensusMechanism {
    config: ConsensusConfig,
    validators: Arc<RwLock<Vec<ValidatorInfo>>>,
    audit_trail: Arc<dyn AuditTrailHandler>,
    chain_state: Arc<RwLock<ChainState>>,
    validation_engine: Arc<dyn ValidationEngine>,
}

impl ConsensusMechanism {
    pub fn new(
        config: ConsensusConfig,
        audit_trail: Arc<dyn AuditTrailHandler>,
        validation_engine: Arc<dyn ValidationEngine>,
    ) -> Self {
        Self {
            config,
            validators: Arc::new(RwLock::new(Vec::new())),
            audit_trail,
            chain_state: Arc::new(RwLock::new(ChainState {
                last_block_hash: String::new(),
                block_height: 0,
                total_transactions: 0,
                last_updated: Utc::now(),
                status: crate::types::blockchain::ChainStatus::Active,
            })),
            validation_engine,
        }
    }

    pub async fn add_validator(
        &self,
        validator: ValidatorInfo,
        context: &SecurityContext,
    ) -> Result<(), BlockchainError> {
        let mut validators = self.validators.write().await;
        
        // Check max validators
        if validators.len() >= self.config.max_validators {
            return Err(BlockchainError::ConsensusError(
                "Maximum validator count reached".to_string()
            ));
        }

        // Create audit event
        let audit_event = AuditEvent::new(
            AuditEventType::ConfigurationChange,
            serde_json::json!({
                "action": "add_validator",
                "validator_id": validator.id,
            }),
            AuditContext::new(
                "add_validator".to_string(),
                AuditSeverity::High,
                context.classification,
                Some(validator.id.to_string()),
            ),
            SignatureMetadata::new(
                Uuid::new_v4(),
                vec![],
                validator.id,
                context.classification,
                SignatureType::System,
                SignatureAlgorithm::Ed25519,
            ),
        );

        self.audit_trail.log_event(audit_event, context).await?;
        validators.push(validator);
        Ok(())
    }

    pub async fn remove_validator(
        &self,
        validator_id: Uuid,
        context: &SecurityContext,
    ) -> Result<(), BlockchainError> {
        let mut validators = self.validators.write().await;

        // Check min validators
        if validators.len() <= self.config.min_validators {
            return Err(BlockchainError::ConsensusError(
                "Minimum validator count reached".to_string()
            ));
        }

        // Log audit event
        let audit_event = AuditEvent::new(
            AuditEventType::SystemEvent,
            serde_json::json!({
                "action": "remove_validator",
                "validator_id": validator_id,
            }),
            AuditContext::new(
                "remove_validator".to_string(),
                AuditSeverity::Low,
                context.classification,
                Some(validator_id.to_string()),
            ),
            SignatureMetadata::new(
                Uuid::new_v4(),
                vec![],
                Uuid::new_v4(),
                context.classification,
                SignatureType::Message,
                SignatureAlgorithm::Ed25519,
            ),
        );
        self.audit_trail.log_event(audit_event, context).await?;

        validators.retain(|v| v.id != validator_id);
        Ok(())
    }

    pub async fn get_validators(&self) -> Result<Vec<ValidatorInfo>, BlockchainError> {
        Ok(self.validators.read().await.clone())
    }

    pub async fn get_active_validators(&self) -> Result<Vec<ValidatorInfo>, BlockchainError> {
        Ok(self.validators.read().await
            .iter()
            .filter(|v| matches!(v.status, ValidatorStatus::Active))
            .cloned()
            .collect())
    }

    async fn create_block(
        &self,
        transactions: Vec<Transaction>,
        previous_hash: &str,
        block_height: u64,
        classification: SecurityClassification,
    ) -> Result<Block, BlockchainError> {
        // Validate block size
        let block_size = transactions.iter()
            .map(|tx| tx.data.as_bytes().len())
            .sum::<usize>();
        if block_size > self.config.max_block_size {
            return Err(BlockchainError::InvalidBlock(
                "Block size exceeds maximum".to_string()
            ));
        }

        // Create merkle root
        let merkle_root = self.create_merkle_root(&transactions)?;

        // Create block
        let now = Utc::now();
        let block = Block {
            height: block_height,
            metadata: serde_json::json!({
                "version": 1,
                "previous_hash": previous_hash,
                "merkle_root": merkle_root,
                "timestamp": now,
                "difficulty": self.config.min_difficulty,
                "nonce": 0,
                "transactions": transactions,
                "created_at": now,
                "confirmed_at": None,
                "classification": classification,
            }),
        };

        Ok(block)
    }

    fn create_merkle_root(&self, transactions: &[Transaction]) -> Result<String, BlockchainError> {
        let mut hasher = Sha256::new();
        for tx in transactions {
            hasher.update(tx.data.as_bytes());
        }
        Ok(format!("{:x}", hasher.finalize()))
    }

    fn calculate_block_hash(&self, block: &Block) -> Result<String, BlockchainError> {
        let mut hasher = Sha256::new();
        hasher.update(serde_json::to_vec(&block.metadata).map_err(|e| BlockchainError::SerializationError(e.to_string()))?);
        Ok(format!("{:x}", hasher.finalize()))
    }
}

#[async_trait]
impl ConsensusService for ConsensusMechanism {
    async fn validate_block(
        &self,
        block: &Block,
        context: &SecurityContext,
    ) -> Result<ValidationResult, BlockchainError> {
        // Create validation context
        let validation_context = ValidationContext::new(context.classification);

        // Basic validation rules
        let rules = vec![
            ValidationRule::new(
                "block_size".to_string(),
                "Block size within limits".to_string(),
                ValidationSeverity::Critical,
            ),
            ValidationRule::new(
                "transaction_count".to_string(),
                "Transaction count within limits".to_string(),
                ValidationSeverity::High,
            ),
            ValidationRule::new(
                "block_hash".to_string(),
                "Block hash is valid".to_string(),
                ValidationSeverity::Critical,
            ),
        ];

        self.validation_engine.validate_block(block, &validation_context, &rules).await
    }

    async fn propose_block(
        &self,
        transactions: Vec<Transaction>,
        context: &SecurityContext,
    ) -> Result<Block, BlockchainError> {
        let chain_state = self.chain_state.read().await;
        self.create_block(
            transactions,
            &chain_state.last_block_hash,
            chain_state.block_height + 1,
            context.classification,
        ).await
    }

    async fn get_validator_info(&self) -> Result<ValidatorInfo, BlockchainError> {
        let validators = self.validators.read().await;
        validators.first()
            .cloned()
            .ok_or_else(|| BlockchainError::ConsensusError("No validators found".to_string()))
    }

    async fn update_validator_status(
        &self,
        status: ValidatorStatus,
        context: &SecurityContext,
    ) -> Result<(), BlockchainError> {
        let mut validators = self.validators.write().await;
        if let Some(validator) = validators.first_mut() {
            validator.status = status;
            validator.last_active = Utc::now();
        }
        Ok(())
    }
}
