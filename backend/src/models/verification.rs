use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VerificationStatus {
    Valid,
    Invalid,
    Pending,
    Expired,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationStatus {
    pub status: VerificationStatus,
    pub timestamp: DateTime<Utc>,
    pub validator_id: Uuid,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignatureContext {
    pub signer_id: Uuid,
    pub device_id: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SignatureStatus {
    Valid,
    Invalid,
    Pending,
    Expired,
} 