// backend/src/blockchain/transaction/mod.rs

use crate::{
    error::CoreError,
    types::security::SecurityContext,
    infrastructure::blockchain::types::{Transaction, TransactionType},
};

use async_trait::async_trait;
use uuid::Uuid;

#[async_trait]
pub trait TransactionProcessor: Send + Sync {
    async fn process_transaction(
        &self,
        transaction: &mut Transaction,
        context: &SecurityContext,
    ) -> Result<(), CoreError>;

    async fn validate_transaction(
        &self,
        transaction: &Transaction,
        context: &SecurityContext,
    ) -> Result<bool, CoreError>;
}

pub struct TransactionValidator {
    min_signature_length: usize,
    required_fields: Vec<String>,
}

impl TransactionValidator {
    pub fn new(min_signature_length: usize, required_fields: Vec<String>) -> Self {
        Self {
            min_signature_length,
            required_fields,
        }
    }

    pub fn validate_signature(&self, transaction: &Transaction) -> Result<bool, CoreError> {
        if let Some(signature) = &transaction.signature {
            if signature.len() < self.min_signature_length {
                return Ok(false);
            }
        }
        Ok(true)
    }

    pub fn validate_metadata(&self, transaction: &Transaction) -> Result<bool, CoreError> {
        for field in &self.required_fields {
            if !transaction.data.metadata.get(field).is_some() {
                return Ok(false);
            }
        }
        Ok(true)
    }
}
