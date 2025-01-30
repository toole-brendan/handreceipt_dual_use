use crate::error::Error;
use crate::blockchain::{BlockchainAdapter, TransactionPayload};
use sawtooth_sdk::signing::Signer;
use sha2::{Sha512, Digest};
use std::sync::Arc;

pub mod processor;
pub mod batch_builder;
pub mod merkle;
pub mod merkle_proof;
pub mod state_tracker;
pub mod transaction_processor;
pub mod adapter;
pub mod wrappers;

pub use processor::{TransferPayload, TransactionProcessor, HandReceiptTransactionHandler};
pub use batch_builder::BatchBuilder;
pub use self::merkle::MerkleTree;
pub use state_tracker::StateTracker;
pub use self::adapter::SawtoothAdapterImpl as SawtoothAdapter;

use sawtooth_sdk::messages::batch::Batch;
use sawtooth_sdk::messages::transaction::Transaction;
use sawtooth_sdk::messages::batch::BatchHeader;
use sawtooth_sdk::signing::secp256k1::Secp256k1PrivateKey;

const FAMILY_NAME: &str = "handreceipt";
const FAMILY_VERSION: &str = "1.0";
const NAMESPACE: &str = "handreceipt";

pub fn get_address_prefix() -> String {
    let mut hasher = Sha512::new();
    hasher.update(FAMILY_NAME.as_bytes());
    hex::encode(&hasher.finalize())[..6].to_string()
}

#[derive(Debug, Clone)]
pub struct TransactionFamily {
    name: String,
    version: String,
    prefix: String,
}

impl Default for TransactionFamily {
    fn default() -> Self {
        Self {
            name: FAMILY_NAME.to_string(),
            version: FAMILY_VERSION.to_string(),
            prefix: get_address_prefix(),
        }
    }
}

impl TransactionFamily {
    pub fn calculate_address(&self, name: &str) -> String {
        let mut hasher = Sha512::new();
        hasher.update(name.as_bytes());
        format!("{}{}", 
            self.prefix,
            hex::encode(&hasher.finalize())[..64].to_string()
        )
    }
}

pub type Result<T> = std::result::Result<T, Error>; 