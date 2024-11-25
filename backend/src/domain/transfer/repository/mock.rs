use async_trait::async_trait;
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

    async fn get_by_property(&self, property_id: Uuid) -> Result<Vec<Transfer>, TransferError> {
        let transfers = self.transfers.lock().unwrap();
        Ok(transfers.values()
            .filter(|t| t.property_id() == property_id)
            .cloned()
            .collect())
    }

    async fn get_pending_approvals(&self, approver: &str) -> Result<Vec<Transfer>, TransferError> {
        let transfers = self.transfers.lock().unwrap();
        Ok(transfers.values()
            .filter(|t| t.status() == &TransferStatus::Pending)
            .cloned()
            .collect())
    }

    async fn get_pending_transfers(&self, user_id: &str) -> Result<Vec<Transfer>, TransferError> {
        let transfers = self.transfers.lock().unwrap();
        Ok(transfers.values()
            .filter(|t| t.status() == &TransferStatus::Pending)
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
                t.from_custodian().map(|c| c == custodian).unwrap_or(false) || 
                t.to_custodian().map(|c| c == custodian).unwrap_or(false)
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
        let transfers = self.transfers.lock().unwrap().clone();
        Ok(Box::new(MockTransferTransaction {
            transfers: Mutex::new(transfers)
        }))
    }
}

pub struct MockTransferTransaction {
    transfers: Mutex<HashMap<Uuid, Transfer>>,
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