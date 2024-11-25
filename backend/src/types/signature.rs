use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::types::security::SecurityClassification;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignatureChain {
    pub id: Uuid,
    pub signatures: Vec<Signature>,
    pub metadata: Option<HashMap<String, String>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub classification: SecurityClassification,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Signature {
    pub id: Uuid,
    pub signer_id: String,
    pub signature: Vec<u8>,
    pub algorithm: SignatureAlgorithm,
    pub timestamp: DateTime<Utc>,
    pub metadata: Option<HashMap<String, String>>,
    pub classification: SecurityClassification,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum SignatureAlgorithm {
    Ed25519,
    Secp256k1,
    RSA,
    ECDSA,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignatureMetadata {
    pub key_id: Uuid,
    pub signature: Vec<u8>,
    pub signer_id: Uuid,
    pub classification: SecurityClassification,
    pub signature_type: SignatureType,
    pub algorithm: SignatureAlgorithm,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SignatureType {
    User,
    System,
    Audit,
    Transfer,
}

impl SignatureChain {
    pub fn new(classification: SecurityClassification) -> Self {
        Self {
            id: Uuid::new_v4(),
            signatures: Vec::new(),
            metadata: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            classification,
        }
    }

    pub fn add_signature(&mut self, signature: Signature) {
        self.signatures.push(signature);
        self.updated_at = Utc::now();
    }

    pub fn with_metadata(mut self, metadata: HashMap<String, String>) -> Self {
        self.metadata = Some(metadata);
        self
    }
}

impl Signature {
    pub fn new(
        signer_id: String,
        signature: Vec<u8>,
        algorithm: SignatureAlgorithm,
        classification: SecurityClassification,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            signer_id,
            signature,
            algorithm,
            timestamp: Utc::now(),
            metadata: None,
            classification,
        }
    }

    pub fn with_metadata(mut self, metadata: HashMap<String, String>) -> Self {
        self.metadata = Some(metadata);
        self
    }
}

impl std::fmt::Display for SignatureAlgorithm {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Ed25519 => write!(f, "ED25519"),
            Self::Secp256k1 => write!(f, "SECP256K1"),
            Self::RSA => write!(f, "RSA"),
            Self::ECDSA => write!(f, "ECDSA"),
        }
    }
}

impl SignatureMetadata {
    pub fn new(
        key_id: Uuid,
        signature: Vec<u8>,
        signer_id: Uuid,
        classification: SecurityClassification,
        signature_type: SignatureType,
        algorithm: SignatureAlgorithm,
    ) -> Self {
        Self {
            key_id,
            signature,
            signer_id,
            classification,
            signature_type,
            algorithm,
        }
    }
}
