use sha2::{Sha256, Digest};
use std::collections::HashMap;
use uuid::Uuid;

use crate::{
    error::blockchain::BlockchainError,
    types::blockchain::BlockchainTransaction,
};

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Side {
    Left,
    Right,
}

/// Represents a node in the Merkle tree
#[derive(Debug, Clone)]
pub struct MerkleNode {
    hash: String,
    left: Option<Box<MerkleNode>>,
    right: Option<Box<MerkleNode>>,
}

impl MerkleNode {
    fn new(hash: String) -> Self {
        Self {
            hash,
            left: None,
            right: None,
        }
    }

    fn leaf(transaction: &BlockchainTransaction) -> Result<Self, BlockchainError> {
        Ok(Self::new(MerkleTree::hash_transaction(transaction)?))
    }

    fn parent(left: MerkleNode, right_opt: Option<&MerkleNode>) -> Result<Self, BlockchainError> {
        let right_hash = right_opt.map(|r| r.hash.clone())
            .unwrap_or_else(|| left.hash.clone());
        
        let parent_hash = MerkleTree::hash_pair(&left.hash, &right_hash);
        let mut parent = Self::new(parent_hash);
        
        parent.left = Some(Box::new(left));
        parent.right = right_opt.cloned().map(Box::new);
        
        Ok(parent)
    }
}

/// Represents a Merkle tree for transaction verification
#[derive(Debug, Clone)]
pub struct MerkleTree {
    transactions: Vec<BlockchainTransaction>,
    cached_hashes: Vec<String>,
    tree_levels: Vec<Vec<String>>,
    root: Option<MerkleNode>,
}

/// Represents a proof of inclusion in the Merkle tree
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MerkleProof {
    pub leaf_hash: String,
    pub sibling_hashes: Vec<(String, Side)>,
    pub root_hash: String,
}

impl MerkleTree {
    /// Creates a new Merkle tree from a list of transactions
    pub fn new(transactions: &[BlockchainTransaction]) -> Result<Self, BlockchainError> {
        let mut tree = Self {
            transactions: transactions.to_vec(),
            cached_hashes: Vec::new(),
            tree_levels: Vec::new(),
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
        self.root.as_ref().map(|node| node.hash.as_str())
    }

    /// Generates a proof of inclusion for a transaction
    pub fn generate_proof(&self, transaction: &BlockchainTransaction) -> Result<MerkleProof, BlockchainError> {
        let tx_hash = Self::hash_transaction(transaction)?;
        let mut current_hash = tx_hash.clone();
        let mut sibling_hashes = Vec::new();
        
        for level in &self.tree_levels {
            let pos = level.iter().position(|h| h == &current_hash)
                .ok_or_else(|| BlockchainError::ValidationError("Transaction not found in tree".into()))?;
            
            if pos % 2 == 0 {
                if let Some(sibling) = level.get(pos + 1) {
                    sibling_hashes.push((sibling.clone(), Side::Right));
                    current_hash = Self::hash_pair(&current_hash, sibling);
                } else {
                    current_hash = Self::hash_pair(&current_hash, &current_hash);
                }
            } else {
                let sibling = &level[pos - 1];
                sibling_hashes.push((sibling.clone(), Side::Left));
                current_hash = Self::hash_pair(sibling, &current_hash);
            }
        }
        
        Ok(MerkleProof {
            leaf_hash: tx_hash,
            sibling_hashes,
            root_hash: self.get_root().unwrap_or_default().to_string(),
        })
    }

    /// Verifies a Merkle proof
    pub fn verify_proof(&self, proof: &MerkleProof) -> Result<bool, BlockchainError> {
        let mut current_hash = proof.leaf_hash.clone();
        
        for (sibling_hash, side) in &proof.sibling_hashes {
            current_hash = match side {
                Side::Left => Self::hash_pair(sibling_hash, &current_hash),
                Side::Right => Self::hash_pair(&current_hash, sibling_hash),
            };
        }
        
        Ok(current_hash == proof.root_hash)
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

    fn build(&mut self) -> Result<(), BlockchainError> {
        if self.transactions.is_empty() {
            return Ok(());
        }

        // Create leaf nodes
        let mut current_level: Vec<MerkleNode> = self.transactions
            .iter()
            .map(|tx| MerkleNode::leaf(tx))
            .collect::<Result<Vec<_>, _>>()?;

        // Store leaf hashes
        self.cached_hashes = current_level.iter()
            .map(|node| node.hash.clone())
            .collect();
        self.tree_levels.push(self.cached_hashes.clone());

        // Build tree levels
        while current_level.len() > 1 {
            let mut next_level = Vec::new();
            let mut next_hashes = Vec::new();

            for chunk in current_level.chunks(2) {
                let node = if chunk.len() == 2 {
                    MerkleNode::parent(chunk[0].clone(), Some(&chunk[1]))?
                } else {
                    MerkleNode::parent(chunk[0].clone(), None)?
                };
                next_hashes.push(node.hash.clone());
                next_level.push(node);
            }

            self.tree_levels.push(next_hashes);
            current_level = next_level;
        }

        self.root = current_level.pop();
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
    fn test_tampered_transaction() {
        let tx = create_test_transaction(1);
        let tree = MerkleTree::new(&[tx.clone()]).unwrap();
        
        let mut tampered_tx = tx;
        tampered_tx.data.payload = b"tampered_data".to_vec();
        
        let proof = tree.generate_proof(&tampered_tx);
        assert!(proof.is_err());
    }

    #[test]
    fn test_incorrect_proof_order() {
        let transactions = vec![
            create_test_transaction(1),
            create_test_transaction(2),
        ];

        let tree = MerkleTree::new(&transactions).unwrap();
        let mut proof = tree.generate_proof(&transactions[0]).unwrap();
        proof.sibling_hashes.reverse();
        
        assert!(!tree.verify_proof(&proof).unwrap());
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
