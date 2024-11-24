use crate::{
    error::CoreError,
    types::security::SecurityContext,
    infrastructure::blockchain::types::{
        Block, Transaction, ValidationResult, ChainStatus,
    },
};

use async_trait::async_trait;
use chrono::Utc;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct ValidatorInfo {
    pub id: Uuid,
    pub status: ValidatorStatus,
    pub last_active: chrono::DateTime<Utc>,
    pub public_key: Vec<u8>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ValidatorStatus {
    Active,
    Inactive,
    Suspended,
}

#[async_trait]
pub trait ConsensusEngine: Send + Sync {
    async fn validate_block(
        &self,
        block: &Block,
        context: &SecurityContext,
    ) -> Result<ValidationResult, CoreError>;

    async fn create_block(
        &self,
        transactions: Vec<Transaction>,
        context: &SecurityContext,
    ) -> Result<Block, CoreError>;

    async fn get_validator_info(&self) -> Result<ValidatorInfo, CoreError>;
    
    async fn update_validator_status(
        &self,
        status: ValidatorStatus,
        context: &SecurityContext,
    ) -> Result<(), CoreError>;
}

pub struct ValidationEngine {
    min_difficulty: u32,
    max_block_size: usize,
}

impl ValidationEngine {
    pub fn new(min_difficulty: u32, max_block_size: usize) -> Self {
        Self {
            min_difficulty,
            max_block_size,
        }
    }

    pub fn validate_block_header(&self, block: &Block) -> Result<(), CoreError> {
        // Validate block header fields
        if block.header.difficulty < self.min_difficulty {
            return Err(CoreError::Blockchain(
                format!("Block difficulty too low: {}", block.header.difficulty).into()
            ));
        }

        // Validate block size
        if block.transactions.len() > self.max_block_size {
            return Err(CoreError::Blockchain(
                format!("Block size exceeds maximum: {}", block.transactions.len()).into()
            ));
        }

        Ok(())
    }
}
