use protobuf::Message;
use sawtooth_sdk::messages::batch::{Batch, BatchHeader};
use sawtooth_sdk::messages::transaction::Transaction;
use sawtooth_sdk::signing::Signer;
use crate::error::Error;
use sawtooth_sdk::signing::Context;
use std::marker::PhantomData;
use tokio::sync::Mutex;
use std::sync::Arc;

pub struct BatchBuilder<'a> {
    signer: Arc<Mutex<Signer<'a>>>,
    transactions: Vec<Transaction>,
    context: Arc<dyn Context + Send + Sync>,
    _phantom: PhantomData<&'a ()>,
}

unsafe impl<'a> Send for BatchBuilder<'a> {}
unsafe impl<'a> Sync for BatchBuilder<'a> {}

impl<'a> BatchBuilder<'a> {
    pub fn new(signer: Arc<Mutex<Signer<'a>>>, context: Arc<dyn Context + Send + Sync>) -> Self {
        Self {
            signer,
            transactions: Vec::new(),
            context,
            _phantom: PhantomData,
        }
    }

    pub fn add_transaction(&mut self, transaction: Transaction) -> &mut Self {
        self.transactions.push(transaction);
        self
    }

    pub async fn build(self) -> Result<Batch, Error> {
        let transaction_ids = self.transactions
            .iter()
            .map(|tx| tx.get_header_signature().to_string())
            .collect();

        let mut header = BatchHeader::new();
        header.set_transaction_ids(protobuf::RepeatedField::from_vec(transaction_ids));
        
        let signer = self.signer.lock().await;
        header.set_signer_public_key(signer.get_public_key()?.as_hex());

        let header_bytes = header.write_to_bytes()
            .map_err(|e| Error::Serialization(e.to_string()))?;
        
        let signature = signer.sign(&header_bytes)
            .map_err(|e| Error::SigningError(e.into()))?;
        drop(signer);

        let mut batch = Batch::new();
        batch.set_header(header_bytes);
        batch.set_header_signature(signature);
        batch.set_transactions(protobuf::RepeatedField::from_vec(self.transactions));

        Ok(batch)
    }
} 