use std::sync::Arc;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use crate::services::infrastructure::database::DatabaseService;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditChain {
    pub id: Uuid,
    pub entries: Vec<AuditEntry>,
    pub hash: String,
    pub previous_hash: Option<String>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEntry {
    pub id: Uuid,
    pub event_type: String,
    pub data: serde_json::Value,
    pub timestamp: DateTime<Utc>,
    pub user_id: Option<Uuid>,
    pub metadata: serde_json::Value,
}

pub struct ChainManager {
    database: Arc<DatabaseService>,
}

impl ChainManager {
    pub fn new(database: Arc<DatabaseService>) -> Self {
        Self { database }
    }

    pub async fn add_entry(&self, entry: AuditEntry) -> Result<(), AuditError> {
        // Get latest chain
        let mut current_chain = self.get_current_chain().await?;
        
        // Calculate new hash including previous entries
        let new_hash = self.calculate_chain_hash(&current_chain, &entry)?;
        
        // Update chain
        current_chain.entries.push(entry);
        current_chain.previous_hash = Some(current_chain.hash);
        current_chain.hash = new_hash;
        current_chain.timestamp = Utc::now();

        // Store updated chain
        self.database.update_audit_chain(&current_chain)
            .await
            .map_err(|e| AuditError::Database(e.to_string()))
    }

    async fn get_current_chain(&self) -> Result<AuditChain, AuditError> {
        self.database.get_latest_audit_chain()
            .await
            .map_err(|e| AuditError::Database(e.to_string()))?
            .ok_or_else(|| AuditError::ChainNotFound)
    }

    fn calculate_chain_hash(&self, chain: &AuditChain, new_entry: &AuditEntry) -> Result<String, AuditError> {
        use sha2::{Sha256, Digest};
        
        let mut hasher = Sha256::new();
        
        // Include previous hash if exists
        if let Some(prev) = &chain.previous_hash {
            hasher.update(prev.as_bytes());
        }
        
        // Hash all entries including new one
        for entry in chain.entries.iter().chain(std::iter::once(new_entry)) {
            let entry_data = serde_json::to_vec(entry)
                .map_err(|e| AuditError::Serialization(e.to_string()))?;
            hasher.update(&entry_data);
        }

        Ok(format!("{:x}", hasher.finalize()))
    }
}

#[derive(Debug, thiserror::Error)]
pub enum AuditError {
    #[error("Database error: {0}")]
    Database(String),
    
    #[error("Chain not found")]
    ChainNotFound,
    
    #[error("Serialization error: {0}")]
    Serialization(String),
    
    #[error("Invalid chain: {0}")]
    InvalidChain(String),
} 