pub mod authority;
pub mod verification;
pub mod merkle;
pub mod consensus;
pub mod types;

pub use authority::{AuthorityNode, MilitaryCertificate, PropertyTransfer, TransferSignature, SignerRole};
pub use verification::{BlockchainVerification, TransferVerification, VerificationResult, TransactionBatch};
pub use merkle::{MerkleTree, MerkleProof, MerkleNode};
pub use consensus::{ConsensusEngine, ValidatorInfo, ValidatorStatus};

use crate::error::blockchain::BlockchainError;
use crate::types::security::SecurityContext;

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
}

impl Default for BlockchainConfig {
    fn default() -> Self {
        Self {
            node_id: uuid::Uuid::new_v4().to_string(),
            is_authority: false,
            batch_size: 100,
            batch_timeout: std::time::Duration::from_secs(30),
            min_validators: 1,
            max_validators: 10,
        }
    }
}

/// Creates a new blockchain service instance
pub fn create_blockchain_service(
    config: BlockchainConfig,
) -> Result<Box<dyn BlockchainService>, BlockchainError> {
    Err(BlockchainError::ServiceError("Blockchain service creation not implemented".to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::security::SecurityContext;
    use chrono::Utc;

    #[tokio::test]
    async fn test_blockchain_config() {
        let config = BlockchainConfig::default();
        assert!(!config.is_authority);
        assert_eq!(config.batch_size, 100);
        assert_eq!(config.batch_timeout, std::time::Duration::from_secs(30));
    }

    #[test]
    fn test_merkle_integration() {
        use crate::types::blockchain::BlockchainTransaction;
        
        // Create test transactions
        let transactions = vec![
            BlockchainTransaction {
                id: uuid::Uuid::new_v4(),
                transaction_type: crate::types::blockchain::TransactionType::AssetTransfer,
                data: crate::types::blockchain::TransactionData {
                    payload: "test1".as_bytes().to_vec(),
                    hash: "hash1".to_string(),
                    size: 5,
                },
                metadata: crate::types::blockchain::TransactionMetadata {
                    creator: "test".to_string(),
                    context: SecurityContext::new(uuid::Uuid::new_v4()),
                    audit_events: Vec::new(),
                    custom_fields: std::collections::HashMap::new(),
                },
                signatures: Vec::new(),
                timestamp: Utc::now(),
                status: crate::types::blockchain::TransactionStatus::Pending,
            },
            BlockchainTransaction {
                id: uuid::Uuid::new_v4(),
                transaction_type: crate::types::blockchain::TransactionType::AssetTransfer,
                data: crate::types::blockchain::TransactionData {
                    payload: "test2".as_bytes().to_vec(),
                    hash: "hash2".to_string(),
                    size: 5,
                },
                metadata: crate::types::blockchain::TransactionMetadata {
                    creator: "test".to_string(),
                    context: SecurityContext::new(uuid::Uuid::new_v4()),
                    audit_events: Vec::new(),
                    custom_fields: std::collections::HashMap::new(),
                },
                signatures: Vec::new(),
                timestamp: Utc::now(),
                status: crate::types::blockchain::TransactionStatus::Pending,
            },
        ];

        // Create merkle tree
        let tree = MerkleTree::new(&transactions).unwrap();
        assert!(tree.root_hash().is_some());

        // Generate and verify proof
        let proof = tree.generate_proof(&transactions[0]).unwrap();
        assert!(MerkleTree::verify_proof(&proof).unwrap());
    }
}
