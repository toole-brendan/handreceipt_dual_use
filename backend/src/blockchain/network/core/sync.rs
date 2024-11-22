// backend/src/blockchain/network/core/sync.rs

use super::p2p::P2PNetwork;
use crate::blockchain::transaction::{Transaction, TransactionStatus};
use crate::security::audit::chain::AuditTrail;
use tokio::sync::RwLock;
use std::sync::Arc;
use std::collections::HashMap;
use uuid::Uuid;

pub struct PropertySync {
    p2p: Arc<P2PNetwork>,
    audit_trail: Arc<AuditTrail>,
    pending_transfers: Arc<RwLock<HashMap<Uuid, Transaction>>>,
}

impl PropertySync {
    pub fn new(p2p: Arc<P2PNetwork>, audit_trail: Arc<AuditTrail>) -> Self {
        Self {
            p2p,
            audit_trail,
            pending_transfers: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn sync_property_transfer(
        &self,
        transaction: Transaction,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Record sync attempt
        self.audit_trail.record_event(
            transaction.property_id,
            "sync_initiated",
            &transaction,
        ).await?;

        // Add to pending transfers
        {
            let mut pending = self.pending_transfers.write().await;
            pending.insert(transaction.id, transaction.clone());
        }

        // Broadcast to network
        self.p2p.broadcast_transaction(transaction.clone()).await?;

        // Wait for confirmations
        self.await_confirmations(transaction.id).await?;

        Ok(())
    }

    async fn await_confirmations(
        &self,
        transaction_id: Uuid,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Implement confirmation logic
        // This could involve waiting for a certain number of nodes to acknowledge
        Ok(())
    }

    pub async fn handle_incoming_transfer(
        &self,
        transaction: Transaction,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Verify we don't already have this transfer
        {
            let pending = self.pending_transfers.read().await;
            if pending.contains_key(&transaction.id) {
                return Ok(());
            }
        }

        // Record receipt
        self.audit_trail.record_event(
            transaction.property_id,
            "transfer_received",
            &transaction,
        ).await?;

        // Add to pending transfers
        {
            let mut pending = self.pending_transfers.write().await;
            pending.insert(transaction.id, transaction);
        }

        Ok(())
    }

    pub async fn cleanup_completed_transfers(
        &self,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut pending = self.pending_transfers.write().await;
        pending.retain(|_, tx| tx.status != TransactionStatus::Completed);
        Ok(())
    }
}
