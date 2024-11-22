use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Represents the status of a verification
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum VerificationStatus {
    Valid,
    Invalid,
    Pending,
    Expired,
}

/// Represents the validation status with metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationStatus {
    pub status: VerificationStatus,
    pub timestamp: DateTime<Utc>,
    pub validator_id: Uuid,
    pub notes: Option<String>,
}

/// Represents the context in which a signature was created
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignatureContext {
    pub signer_id: Uuid,
    pub device_id: String,
    pub timestamp: DateTime<Utc>,
}

/// Represents the status of a signature
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum SignatureStatus {
    Valid,
    Invalid,
    Pending,
    Expired,
}

impl ValidationStatus {
    pub fn new(status: VerificationStatus, validator_id: Uuid) -> Self {
        Self {
            status,
            timestamp: Utc::now(),
            validator_id,
            notes: None,
        }
    }

    pub fn with_notes(status: VerificationStatus, validator_id: Uuid, notes: String) -> Self {
        Self {
            status,
            timestamp: Utc::now(),
            validator_id,
            notes: Some(notes),
        }
    }

    pub fn is_valid(&self) -> bool {
        self.status == VerificationStatus::Valid
    }

    pub fn is_expired(&self, max_age: chrono::Duration) -> bool {
        let now = Utc::now();
        now.signed_duration_since(self.timestamp) > max_age
    }
}

impl SignatureContext {
    pub fn new(signer_id: Uuid, device_id: String) -> Self {
        Self {
            signer_id,
            device_id,
            timestamp: Utc::now(),
        }
    }

    pub fn is_recent(&self, max_age: chrono::Duration) -> bool {
        let now = Utc::now();
        now.signed_duration_since(self.timestamp) <= max_age
    }
}

impl Default for VerificationStatus {
    fn default() -> Self {
        Self::Pending
    }
}

impl Default for SignatureStatus {
    fn default() -> Self {
        Self::Pending
    }
}
