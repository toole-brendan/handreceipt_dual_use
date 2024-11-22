use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use crate::types::security::SecurityClassification;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum SignatureType {
    Command,
    Transaction,
    Block,
    Asset,
    Transfer,
    Audit,
    Verification,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandSignature {
    pub id: Uuid,
    pub signer_id: Uuid,
    pub signature_type: SignatureType,
    pub data_hash: String,
    pub signature: String,
    pub timestamp: DateTime<Utc>,
    pub classification: SecurityClassification,
    pub metadata: std::collections::HashMap<String, String>,
}

impl CommandSignature {
    pub fn new(
        signer_id: Uuid,
        signature_type: SignatureType,
        data_hash: String,
        signature: String,
        classification: SecurityClassification,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            signer_id,
            signature_type,
            data_hash,
            signature,
            timestamp: Utc::now(),
            classification,
            metadata: std::collections::HashMap::new(),
        }
    }
} 