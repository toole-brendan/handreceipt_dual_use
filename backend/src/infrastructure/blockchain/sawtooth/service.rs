use std::sync::Arc;
use async_trait::async_trait;
use parking_lot::RwLock;

use crate::{
    error::blockchain::BlockchainError,
    infrastructure::blockchain::{
        BlockchainService,
        BlockchainConfig,
        merkle::{MerkleTree, MerkleProof},
        types::ChainStatus,
        verification::{TransferVerification, VerificationService},
    },
};

use super::{
    client::SawtoothClient,
    handler::HandReceiptTransactionHandler,
    verification::SawtoothVerification,
};

pub struct SawtoothService {
    client: Arc<SawtoothClient>,
    config: BlockchainConfig,
    handler: Arc<HandReceiptTransactionHandler>,
    current_batch: Arc<RwLock<Option<MerkleTree>>>,
    verification_service: Arc<VerificationService>,
}

impl SawtoothService {
    pub fn new(
        validator_url: String,
        private_key: String,
        config: BlockchainConfig,
    ) -> Result<Self, BlockchainError> {
        let client = Arc::new(
            SawtoothClient::new(validator_url.clone(), private_key)?
        );

        let handler = Arc::new(HandReceiptTransactionHandler::new());
        let current_batch = Arc::new(RwLock::new(None));
        let verification = Arc::new(SawtoothVerification::new(client.clone()));
        let verification_service = Arc::new(VerificationService::new(verification));

        Ok(Self {
            client,
            config,
            handler,
            current_batch,
            verification_service,
        })
    }

    async fn update_batch_tree(&self, transactions: &[crate::types::blockchain::BlockchainTransaction]) -> Result<(), BlockchainError> {
        let new_tree = MerkleTree::new(transactions)
            .map_err(|e| BlockchainError::ValidationError(e.to_string()))?;
        
        *self.current_batch.write() = Some(new_tree);
        Ok(())
    }
}

#[async_trait]
impl BlockchainService for SawtoothService {
    async fn initialize(&self) -> Result<(), BlockchainError> {
        // TODO: Implement initialization logic
        Ok(())
    }

    async fn shutdown(&self) -> Result<(), BlockchainError> {
        // TODO: Implement shutdown logic
        Ok(())
    }

    async fn get_status(&self) -> Result<ChainStatus, BlockchainError> {
        // TODO: Implement status check
        Ok(ChainStatus::Active)
    }

    fn verification_service(&self) -> &dyn TransferVerification {
        &*self.verification_service
    }

    async fn get_current_batch_merkle_tree(&self) -> Result<Option<MerkleTree>, BlockchainError> {
        Ok((*self.current_batch.read()).clone())
    }

    async fn get_transaction_proof(&self, transaction_id: &str) -> Result<Option<MerkleProof>, BlockchainError> {
        if let Some(tree) = self.current_batch.read().as_ref() {
            // Find transaction in current batch
            let transactions = tree.get_transactions();
            if let Some(tx) = transactions.iter().find(|tx| tx.id.to_string() == transaction_id) {
                return Ok(Some(tree.generate_proof(tx)?));
            }
        }
        Ok(None)
    }
}

// Configuration for Sawtooth validator
#[derive(Debug, Clone)]
pub struct ValidatorConfig {
    pub url: String,
    pub private_key: String,
    pub bind: String,
    pub peering: PeeringMode,
    pub seeds: Vec<String>,
    pub network_public_key: Option<String>,
    pub network_private_key: Option<String>,
    pub minimum_peer_connectivity: usize,
    pub maximum_peer_connectivity: usize,
    pub scheduler: SchedulerType,
}

#[derive(Debug, Clone)]
pub enum PeeringMode {
    Static,
    Dynamic,
}

#[derive(Debug, Clone)]
pub enum SchedulerType {
    Serial,
    Parallel,
}

impl Default for ValidatorConfig {
    fn default() -> Self {
        Self {
            url: "tcp://localhost:4004".to_string(),
            private_key: String::new(), // Should be provided
            bind: "tcp://127.0.0.1:8800".to_string(),
            peering: PeeringMode::Dynamic,
            seeds: Vec::new(),
            network_public_key: None,
            network_private_key: None,
            minimum_peer_connectivity: 3,
            maximum_peer_connectivity: 10,
            scheduler: SchedulerType::Parallel,
        }
    }
}

impl ValidatorConfig {
    pub fn to_toml(&self) -> String {
        format!(
            r#"# Sawtooth Validator Configuration File
bind = [
    "network:{}",
    "component:tcp://127.0.0.1:4004",
    "consensus:tcp://127.0.0.1:5050"
]

peering = "{}"

endpoint = "tcp://127.0.0.1:8800"

peers = {}

scheduler = "{}"

network_public_key = "{}"
network_private_key = "{}"

minimum_peer_connectivity = {}
maximum_peer_connectivity = {}

# The following is for the HandReceipt transaction processor
tp_handreceipt = "tcp://localhost:4004"
"#,
            self.bind,
            match self.peering {
                PeeringMode::Static => "static",
                PeeringMode::Dynamic => "dynamic",
            },
            self.seeds.join(","),
            match self.scheduler {
                SchedulerType::Serial => "serial",
                SchedulerType::Parallel => "parallel",
            },
            self.network_public_key.as_deref().unwrap_or(""),
            self.network_private_key.as_deref().unwrap_or(""),
            self.minimum_peer_connectivity,
            self.maximum_peer_connectivity,
        )
    }
} 