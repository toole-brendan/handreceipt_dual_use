use async_trait::async_trait;
use uuid::Uuid;

use crate::{
    error::{
        CoreError,
        blockchain::BlockchainError,  // Updated to use correct error path
    },
    types::{
        security::SecurityContext,
        validation::ValidationContext,
        blockchain::{Block, Transaction, ValidationResult},
    },
};

pub mod mechanism;
pub mod validator;

pub use mechanism::ConsensusMechanism;
pub use validator::ValidationEngine;

#[derive(Debug, Clone)]
pub struct ValidatorInfo {
    pub id: Uuid,
    pub status: ValidatorStatus,
    pub last_active: chrono::DateTime<chrono::Utc>,
    pub public_key: Vec<u8>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ValidatorStatus {
    Active,
    Inactive,
    Suspended,
}

#[async_trait]
pub trait ConsensusService: Send + Sync {
    async fn validate_block(
        &self,
        block: &Block,
        context: &SecurityContext,
    ) -> Result<ValidationResult, BlockchainError>;

    async fn create_block(
        &self,
        transactions: Vec<Transaction>,
        context: &SecurityContext,
    ) -> Result<Block, BlockchainError>;

    async fn get_validator_info(&self) -> Result<ValidatorInfo, BlockchainError>;
    
    async fn update_validator_status(
        &self,
        status: ValidatorStatus,
        context: &SecurityContext,
    ) -> Result<(), BlockchainError>;
}
