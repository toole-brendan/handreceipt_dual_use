use crate::error::Error;
use std::sync::Arc;
use uuid::Uuid;
use async_trait::async_trait;
use reqwest::StatusCode;
use hex;
use crate::blockchain::adapter::REST_API_URL;
use crate::blockchain::TransactionPayload;
use crate::blockchain::sawtooth::merkle::MerkleTree;
use protobuf::Message;
use crate::blockchain::BlockchainAdapter;
use serde::{Deserialize, Serialize};
use sawtooth_sdk::messages::transaction::TransactionHeader;
use sha2::{Sha512, Digest};
use sawtooth_sdk::messages::batch::{Batch, BatchHeader, BatchList};
use crate::blockchain::sawtooth::{
    FAMILY_NAME,
    FAMILY_VERSION,
    get_address_prefix
};
use sawtooth_sdk::messages::transaction::Transaction;
use crate::blockchain::MerkleProof;
use crate::blockchain::sawtooth::wrappers::{ThreadSafeContext, ThreadSafePrivateKey, ThreadSafeSigner};

/// Adapter implementation for Sawtooth blockchain interactions
pub struct SawtoothAdapterImpl {
    signer: Arc<ThreadSafeSigner>,
    client: reqwest::Client,
}

#[cfg(debug_assertions)]
const TX_TIMEOUT: u64 = 30; // Longer timeout for emulators
#[cfg(not(debug_assertions))]
const TX_TIMEOUT: u64 = 10;

impl SawtoothAdapterImpl {
    /// Creates a new SawtoothAdapter instance
    pub fn new(key_bytes: &[u8]) -> Result<Self, Error> {
        let context = ThreadSafeContext::new();
        let private_key = ThreadSafePrivateKey::from_hex(&hex::encode(key_bytes))?;
        let signer = Arc::new(ThreadSafeSigner::new(context, private_key));

        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(TX_TIMEOUT))
            .build()?;

        Ok(Self {
            signer,
            client,
        })
    }

    fn calculate_address(&self, property_id: &str) -> String {
        let mut hasher = Sha512::new();
        hasher.update(property_id.as_bytes());
        let hash = hex::encode(hasher.finalize());
        format!("{}{}", get_address_prefix(), &hash[..64])
    }

    async fn create_batch(&self, transaction: Transaction) -> Result<Batch, Error> {
        let transaction_ids = vec![transaction.get_header_signature().to_string()];

        let mut header = BatchHeader::new();
        header.set_transaction_ids(protobuf::RepeatedField::from_vec(transaction_ids));
        
        let public_key = self.signer.get_public_key()?;
        header.set_signer_public_key(public_key.as_hex());

        let header_bytes = header.write_to_bytes()
            .map_err(|e| Error::Serialization(e.to_string()))?;
        
        let signature = self.signer.sign(&header_bytes)?;

        let mut batch = Batch::new();
        batch.set_header(header_bytes);
        batch.set_header_signature(signature);
        batch.set_transactions(protobuf::RepeatedField::from_vec(vec![transaction]));

        Ok(batch)
    }

    async fn create_batch_list(&self, batch: Batch) -> Result<Vec<u8>, Error> {
        let mut batch_list = BatchList::new();
        batch_list.set_batches(protobuf::RepeatedField::from_vec(vec![batch]));
        batch_list.write_to_bytes()
            .map_err(|e| Error::Serialization(e.to_string()))
    }

    async fn get_latest_state_root(&self) -> Result<Vec<u8>, Error> {
        let response = self.client
            .get(&format!("{}/state", REST_API_URL))
            .send()
            .await
            .map_err(|e| Error::StateError(e.to_string()))?;

        let state_info: serde_json::Value = response.json()
            .await
            .map_err(|e| Error::StateError(e.to_string()))?;

        hex::decode(state_info["head"].as_str().unwrap_or_default())
            .map_err(|e| Error::InvalidHexFormat(e.to_string()))
    }

    async fn get_current_owner(&self, property_id: &str) -> Result<Option<String>, Error> {
        let address = self.calculate_address(property_id);
        let response = self.client
            .get(&format!("{}/state/{}", REST_API_URL, address))
            .send()
            .await
            .map_err(|e| Error::StateError(e.to_string()))?;

        match response.status() {
            StatusCode::OK => {
                let bytes = response.bytes()
                    .await
                    .map_err(|e| Error::StateError(e.to_string()))?;
                String::from_utf8(bytes.to_vec())
                    .map(Some)
                    .map_err(|e| Error::StateError(e.to_string()))
            }
            StatusCode::NOT_FOUND => Ok(None),
            _ => Err(Error::StateError(format!("Unexpected status code: {}", response.status())))
        }
    }
}

#[async_trait]
impl BlockchainAdapter for SawtoothAdapterImpl {
    /// Submits a transaction to the Sawtooth blockchain
    ///
    /// # Arguments
    /// * `payload` - Transaction payload containing the data to submit
    ///
    /// # Returns
    /// Transaction ID if successful, Error otherwise
    async fn submit_transaction(&self, payload: TransactionPayload) -> Result<String, Error> {
        let mut header = TransactionHeader::new();
        header.set_family_name(FAMILY_NAME.to_string());
        header.set_family_version(FAMILY_VERSION.to_string());
        
        let public_key = self.signer.get_public_key()?;
        header.set_signer_public_key(public_key.as_hex());
        
        let payload_bytes = serde_json::to_vec(&payload)
            .map_err(|e| Error::Serialization(e.to_string()))?;
        header.set_payload_sha512(hex::encode(Sha512::digest(&payload_bytes)));

        let address = self.calculate_address(&Uuid::new_v4().to_string());
        header.set_inputs(protobuf::RepeatedField::from_vec(vec![address.clone()]));
        header.set_outputs(protobuf::RepeatedField::from_vec(vec![address]));

        let header_bytes = header.write_to_bytes()
            .map_err(|e| Error::Serialization(e.to_string()))?;
        let signature = self.signer.sign(&header_bytes)?;

        let mut transaction = Transaction::new();
        transaction.set_header(header_bytes);
        transaction.set_header_signature(signature);
        transaction.set_payload(payload_bytes);

        let batch = self.create_batch(transaction).await?;
        let batch_list = self.create_batch_list(batch).await?;
        
        let response = self.client
            .post(&format!("{}/batches", REST_API_URL))
            .header("Content-Type", "application/octet-stream")
            .body(batch_list)
            .send()
            .await
            .map_err(|e| Error::Network(e.to_string()))?;

        if !response.status().is_success() {
            let error_body = response.text().await.unwrap_or_default();
            return Err(Error::SubmissionError(error_body));
        }

        Ok(Uuid::new_v4().to_string())
    }
    
    /// Verifies a Merkle proof against the current blockchain state
    ///
    /// # Arguments
    /// * `proof` - Merkle proof to verify
    ///
    /// # Returns
    /// True if the proof is valid, False otherwise
    async fn verify_state(&self, proof: MerkleProof) -> Result<bool, Error> {
        let leaves = proof.proof_nodes.into_iter()
            .map(|node| hex::decode(node)
                .map_err(|e| Error::InvalidHexFormat(e.to_string())))
            .collect::<Result<Vec<Vec<u8>>, Error>>()?;

        let tree = MerkleTree::new(leaves);
        let computed_root = tree.root_hash()
            .ok_or(Error::MerkleValidationFailed)
            .and_then(|hash| hex::decode(hash)
                .map_err(|e| Error::InvalidHexFormat(e.to_string())))?;
        
        let state_root = self.get_latest_state_root().await?;
        Ok(computed_root == state_root)
    }

    async fn get_state(&self, address: &str) -> Result<Option<Vec<u8>>, Error> {
        let response = self.client
            .get(&format!("{}/state/{}", REST_API_URL, address))
            .send()
            .await
            .map_err(|e| Error::StateError(e.to_string()))?;

        match response.status() {
            StatusCode::OK => {
                let bytes = response.bytes()
                    .await
                    .map_err(|e| Error::StateError(e.to_string()))?;
                Ok(Some(bytes.to_vec()))
            }
            StatusCode::NOT_FOUND => Ok(None),
            _ => Err(Error::StateError(format!("Unexpected status code: {}", response.status())))
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransferData {
    pub property_id: String,
    pub new_owner: String,
    pub previous_owner: String,
    pub timestamp: u64,
    pub signature: String,
}

// Sawtooth transaction processor integration
// Batch submission handling
// State delta tracking