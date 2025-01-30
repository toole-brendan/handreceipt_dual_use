use crate::error::Error;
use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use sha2::{Sha512, Digest};
use crate::blockchain::sawtooth::merkle::MerkleTree;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateEntry {
    pub address: String,
    pub data: Vec<u8>,
    pub version: u64,
}

pub struct StateTracker {
    states: HashMap<String, StateEntry>,
    root_hash: Option<String>,
}

impl StateTracker {
    pub fn new() -> Self {
        Self {
            states: HashMap::new(),
            root_hash: None,
        }
    }

    pub fn set_state(&mut self, address: &str, data: Vec<u8>, version: u64) {
        self.states.insert(
            address.to_string(),
            StateEntry {
                address: address.to_string(),
                data,
                version,
            },
        );
        self.update_root_hash();
    }

    pub fn get_state(&self, address: &str) -> Option<&StateEntry> {
        self.states.get(address)
    }

    pub fn get_root_hash(&self) -> Option<&String> {
        self.root_hash.as_ref()
    }

    fn update_root_hash(&mut self) {
        let mut entries: Vec<Vec<u8>> = self.states
            .values()
            .map(|e| e.data.clone())
            .collect();
        
        entries.sort();  // Ensure consistent ordering
        
        let merkle_tree = MerkleTree::new(entries);
        self.root_hash = merkle_tree.root_hash().map(|s| s.to_string());
    }

    pub fn verify_state_version(&self, address: &str, version: u64) -> bool {
        self.states
            .get(address)
            .map(|entry| entry.version == version)
            .unwrap_or(false)
    }

    pub fn batch_update(&mut self, updates: Vec<(String, Vec<u8>, u64)>) {
        for (address, data, version) in updates {
            self.set_state(&address, data, version);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_state_tracking() {
        let mut tracker = StateTracker::new();
        let address = "test_address";
        let data = vec![1, 2, 3];
        let version = 1;

        tracker.set_state(address, data.clone(), version);

        let entry = tracker.get_state(address).unwrap();
        assert_eq!(entry.data, data);
        assert_eq!(entry.version, version);
        assert!(tracker.verify_state_version(address, version));
        assert!(tracker.get_root_hash().is_some());
    }
} 