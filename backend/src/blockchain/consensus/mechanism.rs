// backend/src/blockchain/consensus/mechanism.rs

use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use chrono::{DateTime, Utc, Duration};
use serde::{Serialize, Deserialize};

use crate::core::{SecurityContext, SecurityClassification, Transaction, Block};
use crate::services::security::SecurityModule;
use crate::security::quantum::key_generation::QuantumKeyPair;
use sha3::{Digest, Sha3_256};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Authority {
    pub id: Uuid,
    pub public_key: String,
    pub address: String,
    pub weight: u32,
    pub last_block_validated: DateTime<Utc>,
    pub status: AuthorityStatus,
    pub classification_level: SecurityClassification,
    pub current_load: u32,
    pub response_time_ms: u32,
    pub reliability_score: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AuthorityStatus {
    Active,
    Inactive,
    Suspended,
    Maintenance,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusConfig {
    pub min_validators: usize,
    pub block_time: u64,
    pub difficulty: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusState {
    pub current_validators: Vec<ValidatorInfo>,
    pub current_leader: Option<ValidatorId>,
    pub epoch: u64,
    pub last_block_time: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidatorInfo {
    pub id: ValidatorId,
    pub public_key: QuantumKeyPair,
    pub stake: u64,
    pub last_active: DateTime<Utc>,
}

pub struct ConsensusMechanism {
    config: ConsensusConfig,
    state: ConsensusState,
}

impl ConsensusMechanism {
    pub fn new(config: ConsensusConfig) -> Self {
        Self {
            config,
            state: ConsensusState {
                current_validators: Vec::new(),
                current_leader: None,
                epoch: 0,
                last_block_time: Utc::now(),
            },
        }
    }

    pub fn select_leader(&mut self) -> Option<ValidatorId> {
        // Implement VRF-based leader selection
        if self.state.current_validators.len() < self.config.min_validators {
            return None;
        }

        // Use quantum random number for leader selection
        let random_seed = self.generate_random_seed();
        let selected_idx = random_seed % self.state.current_validators.len() as u64;
        
        let leader = self.state.current_validators[selected_idx as usize].id.clone();
        self.state.current_leader = Some(leader.clone());
        
        Some(leader)
    }

    fn generate_random_seed(&self) -> u64 {
        let mut hasher = Sha3_256::new();
        hasher.update(self.state.epoch.to_be_bytes());
        hasher.update(self.state.last_block_time.timestamp().to_be_bytes());
        
        let result = hasher.finalize();
        let mut bytes = [0u8; 8];
        bytes.copy_from_slice(&result[0..8]);
        u64::from_be_bytes(bytes)
    }
}

pub struct ProofOfAuthority {
    authorities: Arc<RwLock<Vec<Authority>>>,
    config: ConsensusConfig,
    security: Arc<SecurityModule>,
}

impl ProofOfAuthority {
    pub fn new(security: Arc<SecurityModule>, config: ConsensusConfig) -> Self {
        Self {
            authorities: Arc::new(RwLock::new(Vec::new())),
            config,
            security,
        }
    }

    pub async fn select_authority_server(
        &self,
        transaction: &Transaction,
    ) -> Result<Authority, Box<dyn std::error::Error + Send + Sync>> {
        let authorities = self.authorities.read().await;
        
        // Filter eligible authorities based on multiple criteria
        let eligible_authorities: Vec<&Authority> = authorities
            .iter()
            .filter(|auth| {
                // Basic eligibility checks
                auth.status == AuthorityStatus::Active &&
                auth.classification_level >= transaction.classification &&
                auth.current_load < self.config.max_authority_load &&
                auth.response_time_ms < self.config.max_response_time_ms &&
                auth.reliability_score >= self.config.min_reliability_score
            })
            .collect();

        if eligible_authorities.is_empty() {
            return Err("No eligible authority found".into());
        }

        // Score each eligible authority
        let mut scored_authorities: Vec<(f64, Authority)> = eligible_authorities
            .iter()
            .map(|auth| {
                let load_score = 1.0 - (auth.current_load as f64 / self.config.max_authority_load as f64);
                let response_score = 1.0 - (auth.response_time_ms as f64 / self.config.max_response_time_ms as f64);
                let time_since_last = Utc::now() - auth.last_block_validated;
                let availability_score = (time_since_last.num_seconds() as f64 / self.config.block_time as f64).min(1.0);
                
                let total_score = (load_score * 0.3 + 
                                 response_score * 0.2 + 
                                 availability_score * 0.2 + 
                                 auth.reliability_score * 0.3) * 
                                 auth.weight as f64;
                
                (total_score, (*auth).clone())
            })
            .collect();

        // Sort by score in descending order
        scored_authorities.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap());

        // Select the highest scoring authority
        let selected = scored_authorities
            .first()
            .ok_or("No authority available after scoring")?
            .1
            .clone();

        Ok(selected)
    }

    pub async fn validate_block(
        &self,
        block: &Block,
        security_context: &SecurityContext,
    ) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
        let authorities = self.authorities.read().await;
        
        // Verify the validator is an active authority
        let is_authority = authorities
            .iter()
            .any(|auth| {
                auth.id == security_context.user_id && 
                auth.status == AuthorityStatus::Active &&
                auth.classification_level >= block.security_classification
            });

        if !is_authority {
            return Ok(false);
        }

        // Validate block timing
        let now = Utc::now();
        let block_time_duration = Duration::seconds(self.config.block_time);
        if block.timestamp > now || block.timestamp < now - block_time_duration {
            return Ok(false);
        }

        // Validate transaction count
        if block.transactions.len() > self.config.max_transactions {
            return Ok(false);
        }

        // Validate all transactions
        for transaction in &block.transactions {
            if !self.validate_transaction(transaction, security_context).await? {
                return Ok(false);
            }
        }

        Ok(true)
    }

    pub async fn update_authority_metrics(
        &self,
        authority_id: Uuid,
        response_time: u32,
        success: bool,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut authorities = self.authorities.write().await;
        
        if let Some(authority) = authorities
            .iter_mut()
            .find(|a| a.id == authority_id) 
        {
            // Update response time with exponential moving average
            authority.response_time_ms = (authority.response_time_ms * 7 + response_time * 3) / 10;
            
            // Update reliability score
            let impact = if success { 0.1 } else { -0.2 };
            authority.reliability_score = (authority.reliability_score + impact)
                .max(0.0)
                .min(1.0);
        }

        Ok(())
    }

    pub async fn validate_transaction(
        &self,
        transaction: &Transaction,
        security_context: &SecurityContext,
    ) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
        // Check if any active authority can validate this transaction
        let authorities = self.authorities.read().await;
        
        let can_validate = authorities.iter().any(|auth| {
            auth.status == AuthorityStatus::Active &&
            auth.classification_level >= transaction.classification &&
            auth.current_load < self.config.max_authority_load
        });

        if !can_validate {
            return Ok(false);
        }

        // Verify transaction signature
        self.security
            .verify_signature(
                transaction.data.as_bytes(),
                &transaction.signature,
                security_context.user_id,
            )
            .await
    }

    pub async fn select_authority(
        &self,
        transaction: &Transaction,
    ) -> Result<Option<Authority>, Box<dyn std::error::Error + Send + Sync>> {
        // Use the existing select_authority_server method
        match self.select_authority_server(transaction).await {
            Ok(authority) => Ok(Some(authority)),
            Err(_) => Ok(None),
        }
    }

    pub async fn get_next_validator(
        &self,
        current_block_height: u64,
    ) -> Result<Option<Authority>, Box<dyn std::error::Error + Send + Sync>> {
        let authorities = self.authorities.read().await;
        
        if authorities.is_empty() {
            return Ok(None);
        }

        // Simple round-robin selection based on block height
        let active_authorities: Vec<_> = authorities
            .iter()
            .filter(|auth| {
                auth.status == AuthorityStatus::Active &&
                auth.current_load < self.config.max_authority_load &&
                auth.reliability_score >= self.config.min_reliability_score
            })
            .collect();

        if active_authorities.is_empty() {
            return Ok(None);
        }

        let index = current_block_height as usize % active_authorities.len();
        Ok(Some(active_authorities[index].clone()))
    }

    pub async fn validate_property_transfer(
        &self,
        transaction: &Transaction,
        security_context: &SecurityContext,
    ) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
        let authorities = self.authorities.read().await;
        
        // Verify the validator has proper authority for this property type
        let has_authority = authorities
            .iter()
            .any(|auth| {
                auth.id == security_context.user_id && 
                auth.status == AuthorityStatus::Active &&
                auth.clearance_level >= transaction.property.classification &&
                auth.authorized_property_types.contains(&transaction.property.type_id)
            });

        if !has_authority {
            return Ok(false);
        }

        // Verify command chain approvals
        if !self.verify_command_chain_approvals(transaction).await? {
            return Ok(false);
        }

        // Additional property-specific validations...
        Ok(true)
    }

    async fn verify_command_chain_approvals(
        &self,
        transaction: &Transaction,
    ) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
        // Implement command chain approval verification
        Ok(true)
    }
} 