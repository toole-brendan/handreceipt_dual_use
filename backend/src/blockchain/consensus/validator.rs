// backend/src/blockchain/consensus/validator.rs

use super::mechanism::ConsensusConfig;
use crate::security::audit::chain::AuditChain;
use async_trait::async_trait;
use chrono::{DateTime, Duration, Utc};
use sha3::{Digest, Sha3_256};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ValidationError {
    #[error("Invalid block signature")]
    InvalidSignature,
    #[error("Invalid block hash")]
    InvalidHash,
    #[error("Invalid timestamp")]
    InvalidTimestamp,
    #[error("Invalid block link")]
    InvalidBlockLink,
    #[error("Missing authority")]
    MissingAuthority,
}

#[async_trait]
pub trait ChainValidator {
    async fn validate_block(&self, block: &Block) -> Result<(), ValidationError>;
    async fn validate_chain(&self, chain: &[Block]) -> Result<(), ValidationError>;
}

pub struct DefaultValidator {
    config: ConsensusConfig,
    audit_chain: AuditChain,
}

impl DefaultValidator {
    pub fn new(config: ConsensusConfig, audit_chain: AuditChain) -> Self {
        Self { config, audit_chain }
    }

    async fn verify_block_signature(&self, block: &Block) -> Result<(), ValidationError> {
        // Get block authority
        let authority = self.get_block_authority(block).await?;

        // Verify using authority's public key
        let signature_valid = self.security_module
            .verify_signature(
                &self.calculate_block_hash(block),
                &block.signature,
                &authority.public_key,
            )
            .await
            .map_err(|_| ValidationError::InvalidSignature)?;

        if !signature_valid {
            return Err(ValidationError::InvalidSignature);
        }

        Ok(())
    }

    async fn verify_block_hash(&self, block: &Block) -> Result<(), ValidationError> {
        let calculated_hash = self.calculate_block_hash(block);
        
        // Verify hash meets difficulty requirement
        if !self.meets_difficulty(&calculated_hash, block.difficulty) {
            return Err(ValidationError::InvalidHash);
        }

        // Verify hash matches block's hash
        if calculated_hash != block.hash {
            return Err(ValidationError::InvalidHash);
        }

        Ok(())
    }

    async fn verify_timestamps(&self, block: &Block) -> Result<(), ValidationError> {
        let now = Utc::now();
        let max_future = Duration::seconds(self.config.max_future_seconds);
        let min_interval = Duration::seconds(self.config.min_block_interval);

        // Check block is not too far in future
        if block.timestamp > now + max_future {
            return Err(ValidationError::InvalidTimestamp);
        }

        // Check minimum interval from previous block
        if let Some(prev_timestamp) = self.get_previous_timestamp(block).await {
            if block.timestamp < prev_timestamp + min_interval {
                return Err(ValidationError::InvalidTimestamp);
            }
        }

        Ok(())
    }

    fn calculate_block_hash(&self, block: &Block) -> Vec<u8> {
        let mut hasher = Sha3_256::new();
        hasher.update(block.height.to_be_bytes());
        hasher.update(block.previous_hash.as_slice());
        hasher.update(block.timestamp.timestamp().to_be_bytes());
        
        // Hash all transactions
        for transaction in &block.transactions {
            hasher.update(transaction.id.as_bytes());
        }
        
        hasher.finalize().to_vec()
    }

    fn meets_difficulty(&self, hash: &[u8], difficulty: u32) -> bool {
        // Check if required number of leading zeros are present
        let required_zeros = (difficulty / 8) as usize;
        let remainder_bits = (difficulty % 8) as u32;

        // Check full bytes
        if !hash.iter().take(required_zeros).all(|&b| b == 0) {
            return false;
        }

        // Check remaining bits
        if remainder_bits > 0 {
            let mask = 0xff >> remainder_bits;
            if hash[required_zeros] & mask != 0 {
                return false;
            }
        }

        true
    }

    async fn verify_block_links(
        &self,
        prev_block: &Block,
        curr_block: &Block,
    ) -> Result<(), ValidationError> {
        // Verify block sequence
        if curr_block.height != prev_block.height + 1 {
            return Err(ValidationError::InvalidBlockLink);
        }

        // Verify previous block hash
        if curr_block.previous_hash != self.calculate_block_hash(prev_block) {
            return Err(ValidationError::InvalidBlockLink);
        }

        // Verify authority transitions
        if !self.verify_authority_transition(prev_block, curr_block).await? {
            return Err(ValidationError::InvalidBlockLink);
        }

        Ok(())
    }
}

#[async_trait]
impl ChainValidator for DefaultValidator {
    async fn validate_block(&self, block: &Block) -> Result<(), ValidationError> {
        self.verify_block_signature(block).await?;
        self.verify_block_hash(block).await?;
        self.verify_timestamps(block).await?;
        Ok(())
    }

    async fn validate_chain(&self, chain: &[Block]) -> Result<(), ValidationError> {
        for window in chain.windows(2) {
            let prev_block = &window[0];
            let curr_block = &window[1];
            
            self.validate_block(curr_block).await?;
            self.verify_block_links(prev_block, curr_block).await?;
        }
        Ok(())
    }
}
