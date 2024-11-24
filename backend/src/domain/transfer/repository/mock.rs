use std::sync::Mutex;
use std::collections::HashMap;
use async_trait::async_trait;
use uuid::Uuid;
use chrono::Utc;

use super::super::entity::{Transfer, TransferStatus};
use super::repository::{TransferRepository, TransferError};
use crate::domain::models::transfer::PropertyTransfer;

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

    async fn get_pending_approvals(&self, approver: &str) -> Result<Vec<Transfer>, TransferError> {
        let transfers = self.transfers.lock().unwrap();
        Ok(transfers.values()
            .filter(|t| t.status() == TransferStatus::Pending)
            .cloned()
            .collect())
    }

    async fn get_by_property(&self, property_id: Uuid) -> Result<Vec<Transfer>, TransferError> {
        let transfers = self.transfers.lock().unwrap();
        Ok(transfers.values()
            .filter(|t| t.property_id() == property_id)
            .cloned()
            .collect())
    }

    async fn get_by_custodian(&self, custodian: &str) -> Result<Vec<Transfer>, TransferError> {
        let transfers = self.transfers.lock().unwrap();
        Ok(transfers.values()
            .filter(|t| t.from_custodian() == Some(custodian) || t.to_custodian() == custodian)
            .cloned()
            .collect())
    }

    async fn get_by_command(&self, command_id: &str) -> Result<Vec<Transfer>, TransferError> {
        let transfers = self.transfers.lock().unwrap();
        Ok(transfers.values()
            .filter(|t| t.command_id() == Some(command_id))
            .cloned()
            .collect())
    }

    async fn get_latest_transfer(&self, property_id: Uuid) -> Result<Option<PropertyTransfer>, TransferError> {
        let property_transfers = self.property_transfers.lock().unwrap();
        Ok(property_transfers.get(&property_id)
            .and_then(|transfers| transfers.last().cloned()))
    }
} 