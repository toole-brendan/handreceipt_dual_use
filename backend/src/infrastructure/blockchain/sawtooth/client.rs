use std::time::Duration;
use std::sync::Arc;
use std::ops::Deref;
use parking_lot::Mutex;
use uuid::Uuid;
use sawtooth_sdk::signing::secp256k1::{Secp256k1Context, Secp256k1PrivateKey};

use sawtooth_sdk::{
    messages::{
        batch::{Batch, BatchHeader, BatchList},
        transaction::{Transaction, TransactionHeader},
    },
    signing::{create_context, Context, PrivateKey, Signer},
};
use protobuf::Message;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use hex;
use openssl;

use super::{FAMILY_NAME, FAMILY_VERSION};
use super::state::PropertyMetadata;
use super::transaction::HandReceiptPayload;
use crate::error::blockchain::BlockchainError;

const BATCH_STATUS_TIMEOUT: Duration = Duration::from_secs(300);

pub struct SawtoothClient {
    url: String,
    context: Arc<Mutex<Secp256k1Context>>,
    private_key: Arc<Mutex<Secp256k1PrivateKey>>,
    client: Client,
}

impl SawtoothClient {
    pub fn new(url: String, private_key_hex: String) -> Result<Self, BlockchainError> {
        let context = Arc::new(Mutex::new(
            Secp256k1Context::new()
        ));
        
        let private_key = Arc::new(Mutex::new(
            Secp256k1PrivateKey::from_hex(&private_key_hex)
                .map_err(|e| BlockchainError::ServiceError(e.to_string()))?
        ));

        Ok(Self {
            url,
            context,
            private_key,
            client: Client::new(),
        })
    }

    fn create_signer_owned(&self) -> Result<(Box<dyn Context>, Box<dyn PrivateKey>), BlockchainError> {
        // Create owned copies of the context and private key
        let context = Box::new(Secp256k1Context::new());
        let private_key = {
            let key_guard = self.private_key.lock();
            Box::new(Secp256k1PrivateKey::from_hex(&key_guard.as_hex())?)
        };
        
        Ok((context, private_key))
    }

    pub async fn create_property(
        &self,
        property_id: String,
        initial_custodian: String,
        metadata: PropertyMetadata,
    ) -> Result<String, BlockchainError> {
        let payload = HandReceiptPayload::Create {
            property_id,
            initial_custodian,
            metadata,
        };

        self.submit_transaction(payload).await
    }

    pub async fn transfer_property(
        &self,
        property_id: String,
        to_custodian: String,
    ) -> Result<String, BlockchainError> {
        let transfer_id = Uuid::new_v4().to_string();
        
        let payload = HandReceiptPayload::Transfer {
            property_id,
            to_custodian,
            transfer_id: transfer_id.clone(),
        };

        self.submit_transaction(payload).await?;
        Ok(transfer_id)
    }

    async fn submit_transaction(
        &self,
        payload: HandReceiptPayload,
    ) -> Result<String, BlockchainError> {
        // Serialize the payload
        let payload_bytes = serde_json::to_vec(&payload)
            .map_err(|err| BlockchainError::SerializationError(format!("Failed to serialize payload: {}", err)))?;

        // Create all transaction data synchronously before any async operations
        let batch_list = {
            // Create owned signer components
            let (context, private_key) = self.create_signer_owned()?;
            let signer = Signer::new(&*context, &*private_key);
            
            // Create transaction header
            let mut txn_header = TransactionHeader::new();
            txn_header.set_family_name(FAMILY_NAME.to_string());
            txn_header.set_family_version(FAMILY_VERSION.to_string());
            txn_header.set_nonce(Uuid::new_v4().to_string());
            txn_header.set_signer_public_key(signer.get_public_key()?.as_hex());
            txn_header.set_batcher_public_key(signer.get_public_key()?.as_hex());
            txn_header.set_payload_sha512(hex::encode(openssl::sha::sha512(&payload_bytes)));

            // Create Transaction
            let mut txn = Transaction::new();
            txn.set_header(txn_header.write_to_bytes().map_err(|e| e.to_string())?);
            txn.set_header_signature(signer.sign(&txn.get_header()).map_err(|e| e.to_string())?);
            txn.set_payload(payload_bytes);

            // Create batch header
            let mut batch_header = BatchHeader::new();
            batch_header.set_signer_public_key(signer.get_public_key()?.as_hex());
            batch_header.set_transaction_ids(protobuf::RepeatedField::from_vec(vec![txn.get_header_signature().to_string()]));

            // Create batch
            let mut batch = Batch::new();
            batch.set_header(batch_header.write_to_bytes().map_err(|e| e.to_string())?);
            batch.set_header_signature(signer.sign(&batch.get_header()).map_err(|e| e.to_string())?);
            batch.set_transactions(protobuf::RepeatedField::from_vec(vec![txn]));

            // Create batch list
            let mut batch_list = BatchList::new();
            batch_list.set_batches(protobuf::RepeatedField::from_vec(vec![batch]));
            
            // Convert to bytes before leaving the synchronous block
            batch_list.write_to_bytes().map_err(|e| e.to_string())?
        };

        // Now do the async network call with the prepared batch list
        let response = self.client
            .post(&format!("{}/batches", self.url))
            .header("Content-Type", "application/octet-stream")
            .body(batch_list)
            .send()
            .await
            .map_err(|e| BlockchainError::ServiceError(format!("Failed to submit batch: {}", e.to_string())))?;

        if !response.status().is_success() {
            return Err(BlockchainError::ServiceError(format!("Failed to submit batch: {}", response.status())));
        }

        let batch_id = response
            .headers()
            .get("Location")
            .and_then(|h| h.to_str().ok())
            .ok_or_else(|| BlockchainError::ServiceError("No batch ID returned".to_string()))?
            .split("/")
            .last()
            .ok_or_else(|| BlockchainError::ServiceError("Invalid batch ID format".to_string()))?
            .to_string();

        Ok(batch_id)
    }

    pub async fn get_transaction_status(&self, transaction_id: &str) -> Result<String, BlockchainError> {
        let url = format!("{}/transactions/{}", self.url, transaction_id);
        let response = self.client.get(&url)
            .send()
            .await?;

        if response.status().is_success() {
            let status = response.json::<serde_json::Value>()
                .await?;

            Ok(status["data"]["status"]
                .as_str()
                .unwrap_or("UNKNOWN")
                .to_string())
        } else {
            Err(BlockchainError::NetworkError(format!(
                "Failed to get transaction status: {}",
                response.status()
            )))
        }
    }
} 