use crate::{
    error::CoreError,
    types::security::SecurityContext,
};

use async_trait::async_trait;
use chrono::Utc;
use uuid::Uuid;
use tokio::sync::RwLock;
use std::sync::Arc;

pub mod consensus;
pub mod transaction;
pub mod types;

// Re-export core blockchain components but rename to avoid conflicts
pub use self::{
    types::{
        Block as BlockchainBlock,
        Transaction as BlockchainTransaction,
        TransactionData,
        ChainState,
    },
    consensus::{ConsensusEngine, ValidationEngine},
    transaction::{TransactionProcessor, TransactionValidator},
};

pub struct BlockchainManager {
    consensus: Arc<dyn ConsensusEngine>,
    processor: Arc<dyn TransactionProcessor>,
    validator: Arc<TransactionValidator>,
    chain_state: Arc<RwLock<ChainState>>,
}

impl BlockchainManager {
    pub fn new(
        consensus: Arc<dyn ConsensusEngine>,
        processor: Arc<dyn TransactionProcessor>,
        validator: Arc<TransactionValidator>,
    ) -> Self {
        Self {
            consensus,
            processor,
            validator,
            chain_state: Arc::new(RwLock::new(ChainState {
                last_block_hash: String::new(),
                block_height: 0,
                total_transactions: 0,
                last_updated: Utc::now(),
                status: types::ChainStatus::Active,
            })),
        }
    }
}
