use crate::error::Error;
use crate::blockchain::sawtooth::merkle_proof::MerkleProofVerifier;
use serde::{Deserialize, Serialize};
use std::collections::{VecDeque, HashMap};
use std::sync::Arc;
use parking_lot::RwLock;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PendingTransaction {
    pub id: String,
    pub payload: Vec<u8>,
    pub timestamp: DateTime<Utc>,
    pub merkle_proof: Option<Vec<String>>,
    pub status: TransactionStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TransactionStatus {
    Pending,
    Submitted,
    Confirmed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NetworkStatus {
    HighThroughput,
    Metered,
    Offline,
}

pub struct OfflineQueue {
    pending_transactions: RwLock<VecDeque<PendingTransaction>>,
    merkle_proofs: RwLock<HashMap<String, Vec<String>>>,
    verifier: Arc<MerkleProofVerifier>,
    max_queue_size: usize,
}

impl OfflineQueue {
    pub fn new(verifier: Arc<MerkleProofVerifier>, max_queue_size: usize) -> Self {
        Self {
            pending_transactions: RwLock::new(VecDeque::new()),
            merkle_proofs: RwLock::new(HashMap::new()),
            verifier,
            max_queue_size,
        }
    }

    pub fn add_transaction(
        &self,
        payload: Vec<u8>,
        merkle_proof: Option<Vec<String>>,
    ) -> Result<String, Error> {
        let mut queue = self.pending_transactions.write();
        
        if queue.len() >= self.max_queue_size {
            return Err(Error::QueueFull);
        }

        let tx = PendingTransaction {
            id: uuid::Uuid::new_v4().to_string(),
            payload,
            timestamp: Utc::now(),
            merkle_proof,
            status: TransactionStatus::Pending,
        };

        if let Some(proof) = merkle_proof {
            self.merkle_proofs.write().insert(tx.id.clone(), proof);
        }

        queue.push_back(tx.clone());
        Ok(tx.id)
    }

    pub fn get_pending_transactions(&self) -> Vec<PendingTransaction> {
        self.pending_transactions.read().iter().cloned().collect()
    }

    pub fn update_transaction_status(
        &self,
        tx_id: &str,
        status: TransactionStatus,
    ) -> Result<(), Error> {
        let mut queue = self.pending_transactions.write();
        
        if let Some(tx) = queue.iter_mut().find(|tx| tx.id == tx_id) {
            tx.status = status;
            Ok(())
        } else {
            Err(Error::TransactionNotFound)
        }
    }

    pub fn sync_flush(&self, network: &NetworkStatus) -> Result<Vec<String>, Error> {
        let mut submitted = Vec::new();
        let queue = self.pending_transactions.read();

        match network {
            NetworkStatus::HighThroughput => {
                // Submit all pending transactions
                for tx in queue.iter().filter(|tx| tx.status == TransactionStatus::Pending) {
                    submitted.push(tx.id.clone());
                }
            }
            NetworkStatus::Metered => {
                // Submit only high-priority transactions
                for tx in queue.iter()
                    .filter(|tx| tx.status == TransactionStatus::Pending)
                    .take(5) {
                    submitted.push(tx.id.clone());
                }
            }
            NetworkStatus::Offline => {
                // Sign queue but don't submit
                return Ok(Vec::new());
            }
        }

        Ok(submitted)
    }

    pub fn cleanup_confirmed(&self) -> usize {
        let mut queue = self.pending_transactions.write();
        let initial_len = queue.len();
        
        queue.retain(|tx| tx.status != TransactionStatus::Confirmed);
        
        initial_len - queue.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_queue_operations() -> Result<(), Error> {
        let verifier = Arc::new(MerkleProofVerifier::new());
        let queue = OfflineQueue::new(verifier, 100);

        // Add transaction
        let tx_id = queue.add_transaction(
            vec![1, 2, 3],
            Some(vec!["proof".to_string()])
        )?;

        // Check pending transactions
        let pending = queue.get_pending_transactions();
        assert_eq!(pending.len(), 1);
        assert_eq!(pending[0].id, tx_id);

        // Update status
        queue.update_transaction_status(&tx_id, TransactionStatus::Confirmed)?;
        
        // Cleanup
        let cleaned = queue.cleanup_confirmed();
        assert_eq!(cleaned, 1);
        assert_eq!(queue.get_pending_transactions().len(), 0);

        Ok(())
    }

    #[test]
    fn test_network_modes() -> Result<(), Error> {
        let verifier = Arc::new(MerkleProofVerifier::new());
        let queue = OfflineQueue::new(verifier, 100);

        // Add multiple transactions
        for _ in 0..10 {
            queue.add_transaction(vec![1, 2, 3], None)?;
        }

        // Test high throughput
        let submitted = queue.sync_flush(&NetworkStatus::HighThroughput)?;
        assert_eq!(submitted.len(), 10);

        // Test metered
        let submitted = queue.sync_flush(&NetworkStatus::Metered)?;
        assert_eq!(submitted.len(), 5);

        // Test offline
        let submitted = queue.sync_flush(&NetworkStatus::Offline)?;
        assert_eq!(submitted.len(), 0);

        Ok(())
    }
} 