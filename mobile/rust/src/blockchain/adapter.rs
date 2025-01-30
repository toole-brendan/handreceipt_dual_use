use crate::error::Error;
use crate::blockchain::MerkleProof;
use async_trait::async_trait;
use sawtooth_sdk::messages::transaction::{Transaction, TransactionHeader};
use sawtooth_sdk::messages::batch::{Batch, BatchHeader, BatchList};
use sha2::{Sha512, Digest};
use std::sync::Arc;
use reqwest;
use std::time::Duration;
use protobuf::Message;
use crate::blockchain::sawtooth::merkle::MerkleTree;
use crate::blockchain::sawtooth::wrappers::{ThreadSafeContext, ThreadSafePrivateKey, ThreadSafeSigner};

const FAMILY_NAME: &str = "handreceipt";
const FAMILY_VERSION: &str = "1.0";
pub const REST_API_URL: &str = "http://localhost:8008";

#[async_trait]
pub trait BlockchainAdapter: Send + Sync {
    async fn submit_transaction(&self, payload: Vec<u8>) -> Result<String, Error>;
    async fn verify_state(&self, proof: MerkleProof) -> Result<bool, Error>;
    async fn get_state(&self, address: &str) -> Result<Option<Vec<u8>>, Error>;
}

pub struct SawtoothAdapter {
    signer: Arc<ThreadSafeSigner>,
    client: reqwest::Client,
}

impl SawtoothAdapter {
    pub fn new(key_bytes: &[u8]) -> Result<Self, Error> {
        let context = ThreadSafeContext::new();
        let private_key = ThreadSafePrivateKey::from_hex(&hex::encode(key_bytes))?;
        let signer = Arc::new(ThreadSafeSigner::new(context, private_key));

        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(10))
            .build()?;

        Ok(Self { 
            signer,
            client,
        })
    }

    fn compute_namespace() -> String {
        let mut hasher = Sha512::new();
        hasher.update(FAMILY_NAME.as_bytes());
        let hash = hex::encode(&hasher.finalize());
        hash[..6].to_string()
    }

    fn compute_address(&self, payload: &[u8]) -> String {
        let namespace = Self::compute_namespace();
        let mut hasher = Sha512::new();
        hasher.update(payload);
        let hash = hex::encode(&hasher.finalize());
        format!("{}{}", namespace, &hash[..64])
    }

    fn create_transaction_header(&self, payload: &[u8]) -> Result<TransactionHeader, Error> {
        let mut header = TransactionHeader::new();
        header.set_family_name(FAMILY_NAME.to_string());
        header.set_family_version(FAMILY_VERSION.to_string());
        
        let address = self.compute_address(payload);
        let inputs = protobuf::RepeatedField::from_vec(vec![address.clone()]);
        let outputs = protobuf::RepeatedField::from_vec(vec![address]);
        
        header.set_inputs(inputs);
        header.set_outputs(outputs);
        header.set_payload_sha512(hex::encode(Sha512::digest(payload)));
        
        let public_key = self.signer.get_public_key()?;
        header.set_signer_public_key(public_key.as_hex());
        
        Ok(header)
    }

    async fn submit_batch(&self, batch: &Batch) -> Result<String, Error> {
        let mut batch_list = BatchList::new();
        batch_list.set_batches(protobuf::RepeatedField::from_vec(vec![batch.clone()]));
        
        let batch_list_bytes = batch_list.write_to_bytes()
            .map_err(|e| Error::Serialization(e.to_string()))?;

        let response = self.client
            .post(&format!("{}/batches", REST_API_URL))
            .header("Content-Type", "application/octet-stream")
            .body(batch_list_bytes)
            .send()
            .await
            .map_err(|e| Error::Network(e.to_string()))?;

        if !response.status().is_success() {
            let error_msg = response.text().await
                .unwrap_or_else(|_| "Unknown error".to_string());
            return Err(Error::Network(error_msg));
        }

        Ok(batch.get_header_signature().to_string())
    }
}

unsafe impl Send for SawtoothAdapter {}
unsafe impl Sync for SawtoothAdapter {}

#[async_trait]
impl BlockchainAdapter for SawtoothAdapter {
    async fn submit_transaction(&self, payload: Vec<u8>) -> Result<String, Error> {
        let header = self.create_transaction_header(&payload)?;
        let header_bytes = header.write_to_bytes()
            .map_err(|e| Error::Serialization(e.to_string()))?;

        let signature = self.signer.sign(&header_bytes)?;

        let mut transaction = Transaction::new();
        transaction.set_header(header_bytes);
        transaction.set_header_signature(signature);
        transaction.set_payload(payload);

        let mut batch_header = BatchHeader::new();
        batch_header.set_transaction_ids(protobuf::RepeatedField::from_vec(
            vec![transaction.get_header_signature().to_string()]
        ));

        let public_key = self.signer.get_public_key()?;
        batch_header.set_signer_public_key(public_key.as_hex());

        let batch_header_bytes = batch_header.write_to_bytes()
            .map_err(|e| Error::Serialization(e.to_string()))?;

        let batch_signature = self.signer.sign(&batch_header_bytes)?;

        let mut batch = Batch::new();
        batch.set_header(batch_header_bytes);
        batch.set_header_signature(batch_signature);
        batch.set_transactions(protobuf::RepeatedField::from_vec(vec![transaction]));

        self.submit_batch(&batch).await
    }

    async fn verify_state(&self, proof: MerkleProof) -> Result<bool, Error> {
        let leaves: Vec<Vec<u8>> = proof.proof_nodes
            .iter()
            .map(|n| hex::decode(n).map_err(|_| Error::InvalidHexFormat(n.clone())))
            .collect::<Result<Vec<Vec<u8>>, Error>>()?;
        
        let tree = MerkleTree::new(leaves);
        Ok(tree.root_hash() == Some(&proof.root_hash))
    }

    async fn get_state(&self, address: &str) -> Result<Option<Vec<u8>>, Error> {
        let response = self.client
            .get(&format!("{}/state/{}", REST_API_URL, address))
            .send()
            .await
            .map_err(|e| Error::Network(e.to_string()))?;

        if response.status() == reqwest::StatusCode::NOT_FOUND {
            return Ok(None);
        }

        if !response.status().is_success() {
            return Err(Error::Network("Failed to fetch state".to_string()));
        }

        let state_data = response.bytes().await
            .map_err(|e| Error::Network(e.to_string()))?;
        
        Ok(Some(state_data.to_vec()))
    }
} 