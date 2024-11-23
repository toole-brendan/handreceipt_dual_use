use async_trait::async_trait;
use crate::types::{
    error::CoreError,
    blockchain::{Block, Transaction, TransactionData},
};

#[async_trait]
pub trait BlockchainService: Send + Sync {
    async fn add_block(&self, block: Block) -> Result<(), CoreError>;
    async fn get_block(&self, hash: &str) -> Result<Option<Block>, CoreError>;
    async fn verify_transaction(&self, tx: &Transaction) -> Result<bool, CoreError>;
}

#[async_trait]
pub trait ConsensusService: Send + Sync {
    async fn validate_block(&self, block: &Block) -> Result<bool, CoreError>;
    async fn propose_block(&self, transactions: Vec<Transaction>) -> Result<Block, CoreError>;
} 