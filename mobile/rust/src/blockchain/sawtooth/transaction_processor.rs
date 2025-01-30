use crate::error::Error;
use crate::blockchain::sawtooth::state_tracker::StateTracker;
use parking_lot::Mutex;
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use uuid::Uuid;
use super::adapter::SawtoothAdapterImpl as SawtoothAdapter;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionPayload {
    pub action: String,
    pub data: Vec<u8>,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub payload: TransactionPayload,
    pub signature: Option<String>,
    pub status: TransactionStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TransactionStatus {
    Pending,
    Submitted,
    Committed,
    Failed(String),
}

pub struct TransactionProcessor {
    state_tracker: Arc<Mutex<StateTracker>>,
    pending_transactions: Arc<Mutex<Vec<Transaction>>>,
}

impl TransactionProcessor {
    pub fn new() -> Self {
        Self {
            state_tracker: Arc::new(Mutex::new(StateTracker::new())),
            pending_transactions: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn submit_transaction(&self, payload: TransactionPayload) -> Result<String, Error> {
        let transaction = Transaction {
            id: Uuid::new_v4().to_string(),
            payload,
            signature: None,
            status: TransactionStatus::Pending,
        };

        self.pending_transactions.lock().push(transaction.clone());
        Ok(transaction.id)
    }

    pub fn get_pending_transactions(&self) -> Vec<Transaction> {
        self.pending_transactions.lock().clone()
    }

    pub fn update_transaction_status(&self, id: &str, status: TransactionStatus) {
        let mut transactions = self.pending_transactions.lock();
        if let Some(transaction) = transactions.iter_mut().find(|t| t.id == id) {
            transaction.status = status;
        }
    }

    pub fn sign_transaction(&self, id: &str, signature: String) -> Result<(), Error> {
        let mut transactions = self.pending_transactions.lock();
        if let Some(transaction) = transactions.iter_mut().find(|t| t.id == id) {
            transaction.signature = Some(signature);
            Ok(())
        } else {
            Err(Error::TransactionNotFound)
        }
    }

    pub fn get_state_tracker(&self) -> Arc<Mutex<StateTracker>> {
        self.state_tracker.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn test_transaction_lifecycle() {
        let processor = TransactionProcessor::new();
        let payload = TransactionPayload {
            action: "test".to_string(),
            data: vec![1, 2, 3],
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        };

        let tx_id = processor.submit_transaction(payload).unwrap();
        assert!(!tx_id.is_empty());

        let pending = processor.get_pending_transactions();
        assert_eq!(pending.len(), 1);
        assert_eq!(pending[0].status, TransactionStatus::Pending);

        processor.sign_transaction(&tx_id, "test_signature".to_string()).unwrap();
        let pending = processor.get_pending_transactions();
        assert!(pending[0].signature.is_some());

        processor.update_transaction_status(&tx_id, TransactionStatus::Committed);
        let pending = processor.get_pending_transactions();
        assert_eq!(pending[0].status, TransactionStatus::Committed);
    }
} 