use crate::error::Error;
use sha2::{Sha512, Digest};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct MerkleProofVerifier {
    known_roots: HashMap<String, Vec<String>>, // Maps root hash to known valid hashes
}

#[derive(Debug, PartialEq)]
pub enum Consistency {
    Valid,
    Invalid,
    Unknown,
}

impl MerkleProofVerifier {
    pub fn new() -> Self {
        Self {
            known_roots: HashMap::new(),
        }
    }

    pub fn verify_proof(
        &self,
        proof: &[String],
        leaf_hash: &str,
        root_hash: &str,
    ) -> Result<Consistency, Error> {
        // Validate hex format first
        for node in proof {
            hex::decode(node).map_err(|_| Error::InvalidHexFormat(node.clone()))?;
        }
        hex::decode(leaf_hash).map_err(|_| Error::InvalidHexFormat(leaf_hash.to_string()))?;
        hex::decode(root_hash).map_err(|_| Error::InvalidHexFormat(root_hash.to_string()))?;

        // Verify the proof path
        let mut current = leaf_hash.to_string();
        
        for node in proof {
            let mut hasher = Sha512::new();
            
            // Sort hashes to ensure consistent ordering
            let mut pair = vec![current.clone(), node.clone()];
            pair.sort();
            
            for hash in pair {
                hasher.update(hex::decode(&hash)?);
            }
            
            current = hex::encode(&hasher.finalize()[..]);
        }
        
        // Check if computed root matches claimed root
        if current == root_hash {
            Ok(Consistency::Valid)
        } else if let Some(known_hashes) = self.known_roots.get(root_hash) {
            if known_hashes.contains(&current) {
                Ok(Consistency::Valid)
            } else {
                Ok(Consistency::Invalid)
            }
        } else {
            Ok(Consistency::Unknown)
        }
    }

    pub fn add_known_root(&mut self, root_hash: String, valid_hashes: Vec<String>) {
        self.known_roots.insert(root_hash, valid_hashes);
    }

    pub fn verify_state_update(
        &self,
        old_root: &str,
        new_root: &str,
        proof: &[String],
    ) -> Result<bool, Error> {
        // First verify the proof connects old_root to new_root
        match self.verify_proof(proof, old_root, new_root)? {
            Consistency::Valid => Ok(true),
            _ => {
                // If direct verification fails, check against known valid states
                if let Some(known_hashes) = self.known_roots.get(new_root) {
                    Ok(known_hashes.contains(&old_root.to_string()))
                } else {
                    Ok(false)
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_proof() -> (Vec<String>, String, String) {
        // Create a simple test proof
        let leaf = "1234";
        let node1 = "5678";
        let root = "abcd";
        
        let mut hasher = Sha512::new();
        hasher.update(hex::decode(leaf).unwrap());
        hasher.update(hex::decode(node1).unwrap());
        let root_hash = hex::encode(&hasher.finalize()[..]);
        
        (vec![node1.to_string()], leaf.to_string(), root_hash)
    }

    #[test]
    fn test_proof_verification() -> Result<(), Error> {
        let verifier = MerkleProofVerifier::new();
        let (proof, leaf, root) = create_test_proof();
        
        assert_eq!(
            verifier.verify_proof(&proof, &leaf, &root)?,
            Consistency::Valid
        );
        
        // Test invalid proof
        assert_eq!(
            verifier.verify_proof(&proof, &leaf, "invalid_root")?,
            Consistency::Unknown
        );
        
        Ok(())
    }

    #[test]
    fn test_state_update_verification() -> Result<(), Error> {
        let mut verifier = MerkleProofVerifier::new();
        let old_root = "old_root";
        let new_root = "new_root";
        
        // Add known valid state transition
        verifier.add_known_root(
            new_root.to_string(),
            vec![old_root.to_string()]
        );
        
        assert!(verifier.verify_state_update(
            old_root,
            new_root,
            &[]
        )?);
        
        Ok(())
    }
} 