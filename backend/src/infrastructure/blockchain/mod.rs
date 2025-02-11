pub mod authority;
pub mod verification;
pub mod merkle;
pub mod consensus;
pub mod types;
pub mod sawtooth;
pub mod poet;

pub use authority::{AuthorityNode, MilitaryCertificate, PropertyTransfer, TransferSignature, SignerRole};
pub use verification::{BlockchainVerification, TransferVerification, VerificationResult, TransactionBatch};
pub use merkle::{MerkleTree, MerkleProof, MerkleNode};
pub use consensus::{ConsensusEngine, ValidatorInfo, ValidatorStatus};
pub use sawtooth::{
    HandReceiptTransactionHandler,
    PropertyState as SawtoothPropertyState,
    SawtoothClient,
};

use crate::error::blockchain::BlockchainError;
use crate::types::security::SecurityContext;
use crate::infrastructure::blockchain::consensus::poet::{PoETConfig, PoETConsensus};
use std::time::Duration;

/// Trait for blockchain operations
#[async_trait::async_trait]
pub trait BlockchainService: Send + Sync {
    /// Initializes the blockchain service
    async fn initialize(&self) -> Result<(), BlockchainError>;

    /// Shuts down the blockchain service
    async fn shutdown(&self) -> Result<(), BlockchainError>;

    /// Gets the current blockchain status
    async fn get_status(&self) -> Result<types::ChainStatus, BlockchainError>;

    /// Gets the verification service
    fn verification_service(&self) -> &dyn TransferVerification;

    /// Gets the merkle tree for the current batch
    async fn get_current_batch_merkle_tree(&self) -> Result<Option<MerkleTree>, BlockchainError>;

    /// Gets the merkle proof for a transaction
    async fn get_transaction_proof(&self, transaction_id: &str) -> Result<Option<MerkleProof>, BlockchainError>;
}

/// Configuration for blockchain services
#[derive(Debug, Clone)]
pub struct BlockchainConfig {
    pub node_id: String,
    pub is_authority: bool,
    pub batch_size: usize,
    pub batch_timeout: std::time::Duration,
    pub min_validators: usize,
    pub max_validators: usize,
    pub validator_url: String,
    pub validator_private_key: String,
    pub consensus: ConsensusEngine,
}

impl Default for BlockchainConfig {
    fn default() -> Self {
        let poet_config = PoETConfig {
            initial_wait_time: Duration::from_secs(10),
            target_wait_time: Duration::from_secs(20),
            wait_time_fluctuation: 0.1, // 10% fluctuation
        };

        Self {
            node_id: uuid::Uuid::new_v4().to_string(),
            is_authority: false,
            batch_size: 100,
            batch_timeout: std::time::Duration::from_secs(30),
            min_validators: 1,
            max_validators: 10,
            validator_url: "tcp://localhost:4004".to_string(), // Default Sawtooth URL
            validator_private_key: String::new(), // Should be provided
            consensus: ConsensusEngine::PoET(poet_config),
        }
    }
}

/// Creates a new blockchain service instance
pub fn create_blockchain_service(
    config: BlockchainConfig,
) -> Result<Box<dyn BlockchainService>, BlockchainError> {
    use sawtooth::service::SawtoothService;

    match config.consensus {
        ConsensusEngine::Sawtooth => {
            let validator_url = config.validator_url.clone();
            let validator_key = config.validator_private_key.clone();

            let service = SawtoothService::new(
                validator_url,
                validator_key,
                config.clone(), // Pass a clone of the config
            )?;

            Ok(Box::new(service))
        },
        ConsensusEngine::PoET(poet_config) => {
            // Placeholder for PoET service.  For now, return Sawtooth.
            let validator_url = config.validator_url.clone();
            let validator_key = config.validator_private_key.clone();

            let service = SawtoothService::new(
                validator_url,
                validator_key,
                config.clone(), // Pass a clone of the config
            )?;

            Ok(Box::new(service))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::security::SecurityContext;
    use chrono::Utc;

    #[test]
    fn test_merkle_tree() {
        let tree = MerkleTree::new(&[]).unwrap();
        assert!(tree.get_root().is_none());

        let proof = MerkleProof {
            root: "test".to_string(),
            proof: vec!["test".to_string()],
        };
        assert!(tree.verify_proof(&proof).unwrap());
    }

    #[test]
    fn test_blockchain_config() {
        let config = BlockchainConfig::default();
        assert!(!config.is_authority);
        assert_eq!(config.batch_size, 100);
        assert_eq!(config.batch_timeout, std::time::Duration::from_secs(30));
    }
}
