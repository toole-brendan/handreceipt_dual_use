use sawtooth_sdk::processor::handler::{ApplyError, TransactionContext};
use serde::{Deserialize, Serialize};
use sha2::{Sha512, Digest};
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::domain::models::transfer::TransferStatus;

const NAMESPACE: &str = "handreceipt";

#[derive(Debug, Serialize, Deserialize)]
pub struct PropertyState {
    pub id: String,
    pub owner: String,
    pub custodian: String,
    pub status: String,
    pub timestamp: i64,
}

impl PropertyState {
    pub fn new(
        id: String,
        owner: String,
        custodian: String,
        status: String,
        timestamp: i64,
    ) -> Self {
        Self {
            id,
            owner,
            custodian,
            status,
            timestamp,
        }
    }

    pub fn get_address(property_id: &str) -> String {
        let mut hasher = Sha512::new();
        hasher.update(property_id.as_bytes());
        let hash = hasher.finalize();
        
        // Sawtooth requires 70-char hex addresses
        // First 6 chars for namespace prefix
        let namespace = &hash[..3];
        let property_hash = &hash[3..35];
        
        format!(
            "{}{}",
            hex::encode(namespace),
            hex::encode(property_hash)
        )
    }

    pub fn serialize(&self) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
        serde_json::to_vec(self).map_err(|e| e.into())
    }

    pub fn deserialize(bytes: &[u8]) -> Result<Self, Box<dyn std::error::Error>> {
        serde_json::from_slice(bytes).map_err(|e| e.into())
    }
}

pub trait StateReader {
    fn get_state_entry(&self, address: &str) -> Result<Option<Vec<u8>>, ApplyError>;
}

pub trait StateWriter {
    fn set_state_entries(&self, entries: Vec<(String, Vec<u8>)>) -> Result<(), ApplyError>;
    fn delete_state_entries(&self, addresses: &[String]) -> Result<(), ApplyError>;
}

impl<T> StateReader for T
where
    T: TransactionContext,
{
    fn get_state_entry(&self, address: &str) -> Result<Option<Vec<u8>>, ApplyError> {
        TransactionContext::get_state_entry(self, address)
            .map_err(|err| ApplyError::InvalidTransaction(format!("Failed to get state: {}", err)))
    }
}

impl<T> StateWriter for T
where
    T: TransactionContext,
{
    fn set_state_entries(&self, entries: Vec<(String, Vec<u8>)>) -> Result<(), ApplyError> {
        TransactionContext::set_state_entries(self, entries)
            .map_err(|err| ApplyError::InvalidTransaction(format!("Failed to set state: {}", err)))
    }

    fn delete_state_entries(&self, addresses: &[String]) -> Result<(), ApplyError> {
        TransactionContext::delete_state_entries(self, addresses)
            .map(|_| ())
            .map_err(|err| ApplyError::InvalidTransaction(format!("Failed to delete state: {}", err)))
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TransferRecord {
    pub transfer_id: Uuid,
    pub from_custodian: String,
    pub to_custodian: String,
    pub timestamp: DateTime<Utc>,
    pub status: TransferStatus,
    pub signatures: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PropertyMetadata {
    pub name: String,
    pub description: String,
    pub category: String,
    pub serial_number: Option<String>,
    pub is_sensitive_item: bool,
    pub created_at: DateTime<Utc>,
} 