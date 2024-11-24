use sha2::{Sha256, Digest};
use std::collections::HashMap;
use uuid::Uuid;

use crate::{
    error::blockchain::BlockchainError,
    types::blockchain::BlockchainTransaction,
};

/// Represents a node in the Merkle tree
#[derive(Debug, Clone)]
pub struct MerkleNode {
    hash: String,
    left: Option<Box<MerkleNode>>,
    right: Option<Box<MerkleNode>>,
}

/// Represents a Merkle tree for transaction verification
#[derive(Debug)]
pub struct MerkleTree {
    root: Option<MerkleNode>,
    leaves: HashMap<String, BlockchainTransaction>,
}

/// Represents a proof of inclusion in the Merkle tree
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MerkleProof {
    pub transaction_hash: String,
    pub proof_hashes: Vec<(String, bool)>, // (hash, is_left)
    pub root_hash: String,
}

impl MerkleTree {
    /// Creates a new Merkle tree from a list of transactions
    pub fn new(transactions: &[BlockchainTransaction]) -> Result<Self, BlockchainError> {
        if transactions.is_empty() {
            return Ok(Self {
                root: None,
                leaves: HashMap::new(),
            });
        }

        // Create leaf nodes
        let mut leaves = HashMap::new();
        let mut nodes: Vec<MerkleNode> = transactions
            .iter()
            .map(|tx| {
                let hash = Self::hash_transaction(tx)?;
                leaves.insert(hash.clone(), tx.clone());
                Ok(MerkleNode {
                    hash,
                    left: None,
                    right: None,
                })
            })
            .collect::<Result<Vec<_>, BlockchainError>>()?;

        // Build tree bottom-up
        while nodes.len() > 1 {
            let mut new_level = Vec::new();
            for chunk in nodes.chunks(2) {
                match chunk {
                    [left] => {
                        // Odd number of nodes, promote the single node
                        new_level.push(left.clone());
                    }
                    [left, right] => {
                        // Create parent node
                        let parent_hash = Self::hash_pair(&left.hash, &right.hash);
                        new_level.push(MerkleNode {
                            hash: parent_hash,
                            left: Some(Box::new(left.clone())),
                            right: Some(Box::new(right.clone())),
                        });
                    }
                    _ => unreachable!(),
                }
            }
            nodes = new_level;
        }

        Ok(Self {
            root: nodes.into_iter().next(),
            leaves,
        })
    }

    /// Generates a proof of inclusion for a transaction
    pub fn generate_proof(&self, transaction: &BlockchainTransaction) -> Result<MerkleProof, BlockchainError> {
        let tx_hash = Self::hash_transaction(transaction)?;
        let mut proof_hashes = Vec::new();
        let root = self.root.as_ref().ok_or_else(|| {
            BlockchainError::ValidationError("Merkle tree is empty".to_string())
        })?;

        self.build_proof(&tx_hash, root, &mut proof_hashes)?;

        Ok(MerkleProof {
            transaction_hash: tx_hash,
            proof_hashes,
            root_hash: root.hash.clone(),
        })
    }

    /// Verifies a Merkle proof
    pub fn verify_proof(proof: &MerkleProof) -> Result<bool, BlockchainError> {
        let mut current_hash = proof.transaction_hash.clone();

        // Reconstruct root hash using proof
        for (hash, is_left) in &proof.proof_hashes {
            current_hash = if *is_left {
                Self::hash_pair(hash, &current_hash)
            } else {
                Self::hash_pair(&current_hash, hash)
            };
        }

        Ok(current_hash == proof.root_hash)
    }

    /// Gets the root hash of the tree
    pub fn root_hash(&self) -> Option<String> {
        self.root.as_ref().map(|node| node.hash.clone())
    }

    /// Hashes a transaction
    fn hash_transaction(transaction: &BlockchainTransaction) -> Result<String, BlockchainError> {
        let tx_bytes = serde_json::to_vec(transaction)
            .map_err(|e| BlockchainError::SerializationError(e.to_string()))?;
        
        let mut hasher = Sha256::new();
        hasher.update(&tx_bytes);
        Ok(format!("{:x}", hasher.finalize()))
    }

    /// Hashes two child hashes together
    fn hash_pair(left: &str, right: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(left.as_bytes());
        hasher.update(right.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    /// Recursively builds a proof for a transaction
    fn build_proof(
        &self,
        tx_hash: &str,
        node: &MerkleNode,
        proof: &mut Vec<(String, bool)>,
    ) -> Result<bool, BlockchainError> {
        // Check if we're at a leaf
        if node.left.is_none() && node.right.is_none() {
            return Ok(node.hash == tx_hash);
        }

        // Check left subtree
        if let Some(left) = &node.left {
            if self.build_proof(tx_hash, left, proof)? {
                if let Some(right) = &node.right {
                    proof.push((right.hash.clone(), false));
                }
                return Ok(true);
            }
        }

        // Check right subtree
        if let Some(right) = &node.right {
            if self.build_proof(tx_hash, right, proof)? {
                if let Some(left) = &node.left {
                    proof.push((left.hash.clone(), true));
                }
                return Ok(true);
            }
        }

        Ok(false)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;
    use crate::types::blockchain::{TransactionType, TransactionData, TransactionMetadata, TransactionStatus};

    fn create_test_transaction(id: u32) -> BlockchainTransaction {
        BlockchainTransaction {
            id: Uuid::new_v4(),
            transaction_type: TransactionType::AssetTransfer,
            data: TransactionData {
                payload: format!("test_transaction_{}", id).into_bytes(),
                hash: format!("hash_{}", id),
                size: 100,
            },
            metadata: TransactionMetadata {
                creator: "test".to_string(),
                context: crate::types::security::SecurityContext::new(Uuid::new_v4()),
                audit_events: Vec::new(),
                custom_fields: HashMap::new(),
            },
            signatures: Vec::new(),
            timestamp: Utc::now(),
            status: TransactionStatus::Pending,
        }
    }

    #[test]
    fn test_merkle_tree_creation() {
        let transactions = vec![
            create_test_transaction(1),
            create_test_transaction(2),
            create_test_transaction(3),
        ];

        let tree = MerkleTree::new(&transactions).unwrap();
        assert!(tree.root.is_some());
        assert_eq!(tree.leaves.len(), 3);
    }

    #[test]
    fn test_proof_verification() {
        let transactions = vec![
            create_test_transaction(1),
            create_test_transaction(2),
            create_test_transaction(3),
        ];

        let tree = MerkleTree::new(&transactions).unwrap();
        let proof = tree.generate_proof(&transactions[1]).unwrap();
        
        assert!(MerkleTree::verify_proof(&proof).unwrap());
    }

    #[test]
    fn test_empty_tree() {
        let tree = MerkleTree::new(&[]).unwrap();
        assert!(tree.root.is_none());
        assert!(tree.leaves.is_empty());
    }

    #[test]
    fn test_single_transaction() {
        let transactions = vec![create_test_transaction(1)];
        let tree = MerkleTree::new(&transactions).unwrap();
        
        assert!(tree.root.is_some());
        assert_eq!(tree.leaves.len(), 1);
        
        let proof = tree.generate_proof(&transactions[0]).unwrap();
        assert!(MerkleTree::verify_proof(&proof).unwrap());
    }
}
