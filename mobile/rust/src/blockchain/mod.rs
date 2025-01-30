pub mod sawtooth;
pub mod adapter;

use crate::error::Error;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[async_trait]
pub trait BlockchainAdapter {
    async fn submit_transaction(&self, payload: TransactionPayload) -> Result<String, Error>;
    async fn verify_state(&self, proof: MerkleProof) -> Result<bool, Error>;
    async fn get_state(&self, address: &str) -> Result<Option<Vec<u8>>, Error>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionPayload {
    pub action: String,
    pub data: serde_json::Value,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MerkleProof {
    pub root_hash: String,
    pub proof_nodes: Vec<String>,
    pub leaf_hash: String,
}

pub use adapter::SawtoothAdapter; 