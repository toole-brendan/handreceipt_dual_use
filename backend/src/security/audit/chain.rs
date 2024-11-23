// src/services/signature/chain.rs

use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use crate::types::{
    security::SecurityClassification,
    audit::{SignatureMetadata, SignatureType},
    error::SecurityError,
};
use deadpool_postgres::Pool;
use crate::security::merkle::MerkleTree;
use sha2::{Sha256, Digest};
use super::logger::AuditEvent;

#[derive(Debug, Serialize, Deserialize)]
pub struct CustodyTransfer {
    pub id: Uuid,
    pub asset_id: Uuid,
    pub from_id: Uuid,
    pub to_id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub signature: Vec<u8>,
    pub classification: SecurityClassification,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CustodyVerification {
    pub transfer_id: Uuid,
    pub verifier_id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub signature: Vec<u8>,
    pub is_valid: bool,
}

pub struct ChainOfCustody {
    pool: Pool,
}

impl ChainOfCustody {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn initialize(&self) -> Result<(), Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        // Create custody transfer table
        client.execute(
            "CREATE TABLE IF NOT EXISTS custody_transfers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                asset_id UUID NOT NULL,
                from_id UUID NOT NULL,
                to_id UUID NOT NULL,
                timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                signature BYTEA NOT NULL,
                classification_level INT NOT NULL,
                metadata JSONB,
                FOREIGN KEY (asset_id) REFERENCES assets(id),
                FOREIGN KEY (from_id) REFERENCES users(id),
                FOREIGN KEY (to_id) REFERENCES users(id)
            )", &[]
        ).await?;

        // Create custody verification table
        client.execute(
            "CREATE TABLE IF NOT EXISTS custody_verifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                transfer_id UUID NOT NULL,
                verifier_id UUID NOT NULL,
                timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                signature BYTEA NOT NULL,
                is_valid BOOLEAN NOT NULL,
                FOREIGN KEY (transfer_id) REFERENCES custody_transfers(id),
                FOREIGN KEY (verifier_id) REFERENCES users(id)
            )", &[]
        ).await?;

        // Create indexes
        client.execute(
            "CREATE INDEX IF NOT EXISTS custody_transfers_asset_idx 
             ON custody_transfers (asset_id, timestamp DESC)",
            &[],
        ).await?;

        client.execute(
            "CREATE INDEX IF NOT EXISTS custody_verifications_transfer_idx 
             ON custody_verifications (transfer_id, timestamp DESC)",
            &[],
        ).await?;

        Ok(())
    }

    pub async fn record_transfer(
        &self,
        transfer: CustodyTransfer,
    ) -> Result<Uuid, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        let row = client.query_one(
            "INSERT INTO custody_transfers (
                id, asset_id, from_id, to_id, timestamp, 
                signature, classification_level, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id",
            &[
                &transfer.id,
                &transfer.asset_id,
                &transfer.from_id,
                &transfer.to_id,
                &transfer.timestamp,
                &transfer.signature,
                &(transfer.classification as i32),
                &transfer.metadata,
            ],
        ).await?;

        Ok(row.get("id"))
    }

    pub async fn verify_transfer(
        &self,
        verification: CustodyVerification,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        client.execute(
            "INSERT INTO custody_verifications (
                transfer_id, verifier_id, timestamp, signature, is_valid
            ) VALUES ($1, $2, $3, $4, $5)",
            &[
                &verification.transfer_id,
                &verification.verifier_id,
                &verification.timestamp,
                &verification.signature,
                &verification.is_valid,
            ],
        ).await?;

        Ok(())
    }

    pub async fn get_asset_chain(
        &self,
        asset_id: Uuid,
    ) -> Result<Vec<CustodyTransfer>, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        let rows = client.query(
            "SELECT id, asset_id, from_id, to_id, timestamp, 
                    signature, classification_level, metadata
             FROM custody_transfers
             WHERE asset_id = $1
             ORDER BY timestamp ASC",
            &[&asset_id],
        ).await?;

        let transfers = rows.iter().map(|row| CustodyTransfer {
            id: row.get("id"),
            asset_id: row.get("asset_id"),
            from_id: row.get("from_id"),
            to_id: row.get("to_id"),
            timestamp: row.get("timestamp"),
            signature: row.get("signature"),
            classification: SecurityClassification::from_str(
                &row.get::<_, i32>("classification_level").to_string()
            ).unwrap(),
            metadata: row.get("metadata"),
        }).collect();

        Ok(transfers)
    }

    pub async fn validate_chain(
        &self,
        asset_id: Uuid,
    ) -> Result<bool, Box<dyn std::error::Error>> {
        let transfers = self.get_asset_chain(asset_id).await?;
        
        // Check chain continuity
        for window in transfers.windows(2) {
            let previous = &window[0];
            let current = &window[1];

            // Verify the chain is unbroken
            if previous.to_id != current.from_id {
                return Ok(false);
            }

            // Verify timestamps are sequential
            if current.timestamp <= previous.timestamp {
                return Ok(false);
            }
        }

        Ok(true)
    }
}

pub struct AuditChain {
    merkle_tree: MerkleTree,
    events: Vec<AuditEvent>,
}

impl AuditChain {
    pub fn new() -> Self {
        Self {
            merkle_tree: MerkleTree::new(),
            events: Vec::new(),
        }
    }

    pub fn add_event(&mut self, event: AuditEvent) {
        let event_hash = self.hash_event(&event);
        self.merkle_tree.insert(event_hash);
        self.events.push(event);
    }

    pub fn verify_chain(&self) -> bool {
        let root = self.merkle_tree.root_hash();
        
        // Verify each event's hash is included in the tree
        self.events.iter().all(|event| {
            let event_hash = self.hash_event(event);
            self.merkle_tree.verify(event_hash)
        })
    }

    fn hash_event(&self, event: &AuditEvent) -> Vec<u8> {
        let mut hasher = Sha256::new();
        let event_json = serde_json::to_string(event).unwrap();
        hasher.update(event_json.as_bytes());
        hasher.finalize().to_vec()
    }
}
