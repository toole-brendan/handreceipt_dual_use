use async_trait::async_trait;
use uuid::Uuid;
use thiserror::Error;
use std::sync::Arc;

use super::entity::Transfer;
use crate::domain::models::transfer::PropertyTransfer;
use crate::domain::models::transfer::TransferStatus;

#[derive(Debug, Error)]
pub enum TransferError {
    #[error("Not found")]
    NotFound,
    #[error("Repository error: {0}")]
    Repository(String),
    // ... other variants
}

#[async_trait]
pub trait TransferRepository: Send + Sync {
    async fn create(&self, transfer: Transfer) -> Result<Transfer, TransferError>;
    async fn get_by_id(&self, id: Uuid) -> Result<Transfer, TransferError>;
    async fn update(&self, transfer: Transfer) -> Result<Transfer, TransferError>;
    async fn get_by_property(&self, property_id: Uuid) -> Result<Vec<Transfer>, TransferError>;
    async fn get_pending_approvals(&self, _approver: &str) -> Result<Vec<Transfer>, TransferError>;
    async fn get_pending_transfers(&self, _user_id: &str) -> Result<Vec<Transfer>, TransferError>;
    async fn get_by_custodian(&self, custodian: &str, limit: Option<i64>, offset: Option<i64>) -> Result<Vec<Transfer>, TransferError>;
    async fn begin_transaction(&self) -> Result<Box<dyn TransferTransaction>, TransferError>;
}

#[async_trait]
pub trait TransferTransaction: Send + Sync {
    async fn commit(self: Box<Self>) -> Result<(), TransferError>;
    async fn rollback(self: Box<Self>) -> Result<(), TransferError>;
    async fn create(&mut self, transfer: Transfer) -> Result<Transfer, TransferError>;
    async fn update(&mut self, transfer: Transfer) -> Result<Transfer, TransferError>;
}

#[cfg(test)]
pub mod mock {
    use super::*;
    use std::sync::Mutex;
    use std::collections::HashMap;

    pub struct MockTransferRepository {
        transfers: Mutex<HashMap<Uuid, Transfer>>,
        property_transfers: Mutex<HashMap<Uuid, Vec<PropertyTransfer>>>,
    }

    impl MockTransferRepository {
        pub fn new() -> Self {
            Self {
                transfers: Mutex::new(HashMap::new()),
                property_transfers: Mutex::new(HashMap::new()),
            }
        }
    }

    #[async_trait]
    impl TransferRepository for MockTransferRepository {
        async fn create(&self, transfer: Transfer) -> Result<Transfer, TransferError> {
            let mut transfers = self.transfers.lock().unwrap();
            let id = transfer.id();
            transfers.insert(id, transfer.clone());
            Ok(transfer)
        }

        async fn get_by_id(&self, id: Uuid) -> Result<Transfer, TransferError> {
            let transfers = self.transfers.lock().unwrap();
            transfers.get(&id)
                .cloned()
                .ok_or(TransferError::NotFound)
        }

        async fn update(&self, transfer: Transfer) -> Result<Transfer, TransferError> {
            let mut transfers = self.transfers.lock().unwrap();
            let id = transfer.id();
            if transfers.contains_key(&id) {
                transfers.insert(id, transfer.clone());
                Ok(transfer)
            } else {
                Err(TransferError::NotFound)
            }
        }

        async fn get_by_property(&self, property_id: Uuid) -> Result<Vec<Transfer>, TransferError> {
            let transfers = self.transfers.lock().unwrap();
            Ok(transfers.values()
                .filter(|t| t.property_id() == property_id)
                .cloned()
                .collect())
        }

        async fn get_pending_approvals(&self, _approver: &str) -> Result<Vec<Transfer>, TransferError> {
            let transfers = self.transfers.lock().unwrap();
            Ok(transfers.values()
                .filter(|t| *t.status() == TransferStatus::Pending)
                .cloned()
                .collect())
        }

        async fn get_pending_transfers(&self, _user_id: &str) -> Result<Vec<Transfer>, TransferError> {
            let transfers = self.transfers.lock().unwrap();
            Ok(transfers.values()
                .filter(|t| *t.status() == TransferStatus::Pending)
                .cloned()
                .collect())
        }

        async fn get_by_custodian(
            &self,
            custodian: &str,
            limit: Option<i64>,
            offset: Option<i64>
        ) -> Result<Vec<Transfer>, TransferError> {
            let transfers = self.transfers.lock().unwrap();
            let mut results: Vec<_> = transfers.values()
                .filter(|t| {
                    t.from_custodian().map(|s| s == custodian).unwrap_or(false) || 
                    t.to_custodian() == custodian
                })
                .cloned()
                .collect();

            let offset = offset.unwrap_or(0) as usize;
            let limit = limit.unwrap_or(100) as usize;
            
            Ok(results.into_iter()
                .skip(offset)
                .take(limit)
                .collect())
        }

        async fn begin_transaction(&self) -> Result<Box<dyn TransferTransaction>, TransferError> {
            // For mock, we can just clone the current state
            let transfers = self.transfers.lock().unwrap().clone();
            Ok(Box::new(MockTransferTransaction {
                transfers: Mutex::new(transfers)
            }))
        }
    }

    #[async_trait]
    impl TransferRepository for Arc<MockTransferRepository> {
        async fn create(&self, transfer: Transfer) -> Result<Transfer, TransferError> {
            self.as_ref().create(transfer).await
        }

        async fn get_by_id(&self, id: Uuid) -> Result<Transfer, TransferError> {
            self.as_ref().get_by_id(id).await
        }

        async fn update(&self, transfer: Transfer) -> Result<Transfer, TransferError> {
            self.as_ref().update(transfer).await
        }

        async fn get_by_property(&self, property_id: Uuid) -> Result<Vec<Transfer>, TransferError> {
            self.as_ref().get_by_property(property_id).await
        }

        async fn get_pending_approvals(&self, _approver: &str) -> Result<Vec<Transfer>, TransferError> {
            self.as_ref().get_pending_approvals(_approver).await
        }

        async fn get_pending_transfers(&self, _user_id: &str) -> Result<Vec<Transfer>, TransferError> {
            self.as_ref().get_pending_transfers(_user_id).await
        }

        async fn get_by_custodian(
            &self,
            custodian: &str,
            limit: Option<i64>,
            offset: Option<i64>
        ) -> Result<Vec<Transfer>, TransferError> {
            self.as_ref().get_by_custodian(custodian, limit, offset).await
        }

        async fn begin_transaction(&self) -> Result<Box<dyn TransferTransaction>, TransferError> {
            self.as_ref().begin_transaction().await
        }
    }

    pub struct MockTransferTransaction {
        transfers: Mutex<HashMap<Uuid, Transfer>>
    }

    #[async_trait]
    impl TransferTransaction for MockTransferTransaction {
        async fn commit(self: Box<Self>) -> Result<(), TransferError> {
            Ok(())
        }

        async fn rollback(self: Box<Self>) -> Result<(), TransferError> {
            Ok(())
        }

        async fn create(&mut self, transfer: Transfer) -> Result<Transfer, TransferError> {
            let mut transfers = self.transfers.lock().unwrap();
            let id = transfer.id();
            transfers.insert(id, transfer.clone());
            Ok(transfer)
        }

        async fn update(&mut self, transfer: Transfer) -> Result<Transfer, TransferError> {
            let mut transfers = self.transfers.lock().unwrap();
            let id = transfer.id();
            if transfers.contains_key(&id) {
                transfers.insert(id, transfer.clone());
                Ok(transfer)
            } else {
                Err(TransferError::NotFound)
            }
        }
    }
} 