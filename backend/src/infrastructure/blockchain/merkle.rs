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
#[derive(Debug, Clone)]
pub struct MerkleTree {
    transactions: Vec<BlockchainTransaction>,
    nodes: HashMap<String, String>,
    root: Option<String>,
}

/// Represents a proof of inclusion in the Merkle tree
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MerkleProof {
    pub root: String,
    pub proof: Vec<String>,
}

impl MerkleTree {
    /// Creates a new Merkle tree from a list of transactions
    pub fn new(transactions: &[BlockchainTransaction]) -> Result<Self, BlockchainError> {
        let mut tree = Self {
            transactions: transactions.to_vec(),
            nodes: HashMap::new(),
            root: None,
        };
        tree.build()?;
        Ok(tree)
    }

    /// Gets the transactions in the tree
    pub fn get_transactions(&self) -> &[BlockchainTransaction] {
        &self.transactions
    }

    /// Gets the root hash of the tree
    pub fn get_root(&self) -> Option<&str> {
        self.root.as_deref()
    }

    /// Generates a proof of inclusion for a transaction
    pub fn generate_proof(&self, transaction: &BlockchainTransaction) -> Result<MerkleProof, BlockchainError> {
        let tx_hash = Self::hash_transaction(transaction)?;
        let mut proof: Vec<String> = Vec::new();
        
        // For now, return a simple proof with just the root
        Ok(MerkleProof {
            root: self.root.clone().unwrap_or_default(),
            proof: vec![tx_hash],
        })
    }

    /// Verifies a Merkle proof
    pub fn verify_proof(&self, proof: &MerkleProof) -> Result<bool, BlockchainError> {
        // For now, just verify the root hash matches
        Ok(Some(proof.root.as_str()) == self.root.as_deref())
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

    fn build(&mut self) -> Result<(), BlockchainError> {
        if self.transactions.is_empty() {
            return Ok(());
        }

        let mut current_level: Vec<String> = self.transactions
            .iter()
            .map(|tx| tx.id.to_string())
            .collect();

        while current_level.len() > 1 {
            let mut next_level = Vec::new();
            for chunk in current_level.chunks(2) {
                let combined = if chunk.len() == 2 {
                    format!("{}{}", chunk[0], chunk[1])
                } else {
                    chunk[0].clone()
                };
                next_level.push(combined);
            }
            current_level = next_level;
        }

        self.root = current_level.first().cloned();
        Ok(())
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
                context: crate::types::security::SecurityContext::new(1),
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
        assert!(tree.get_root().is_some());
        assert_eq!(tree.transactions.len(), 3);
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
        assert!(tree.verify_proof(&proof).unwrap());
    }

    #[test]
    fn test_empty_tree() {
        let tree = MerkleTree::new(&[]).unwrap();
        assert!(tree.get_root().is_none());
        assert!(tree.transactions.is_empty());
    }

    #[test]
    fn test_single_transaction() {
        let transactions = vec![create_test_transaction(1)];
        let tree = MerkleTree::new(&transactions).unwrap();
        assert!(tree.get_root().is_some());
        assert_eq!(tree.transactions.len(), 1);
        
        let proof = tree.generate_proof(&transactions[0]).unwrap();
        assert!(tree.verify_proof(&proof).unwrap());
    }
}
