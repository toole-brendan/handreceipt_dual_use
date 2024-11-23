use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::types::security::SecurityClassification;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignatureContext {
    pub id: Uuid,
    pub signer_id: String,
    pub timestamp: DateTime<Utc>,
    pub metadata: Option<HashMap<String, String>>,
    pub classification: SecurityClassification,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum VerificationStatus {
    Pending,
    InProgress,
    Verified,
    Failed,
    Expired,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ValidationStatus {
    Valid,
    Invalid,
    Unknown,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum SignatureStatus {
    Valid,
    Invalid,
    Expired,
    Revoked,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationResult {
    pub id: Uuid,
    pub status: VerificationStatus,
    pub validation_status: ValidationStatus,
    pub signature_status: SignatureStatus,
    pub timestamp: DateTime<Utc>,
    pub metadata: Option<HashMap<String, String>>,
    pub classification: SecurityClassification,
}

impl SignatureContext {
    pub fn new(signer_id: String, classification: SecurityClassification) -> Self {
        Self {
            id: Uuid::new_v4(),
            signer_id,
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

impl VerificationResult {
    pub fn new(
        status: VerificationStatus,
        validation_status: ValidationStatus,
        signature_status: SignatureStatus,
        classification: SecurityClassification,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            status,
            validation_status,
            signature_status,
            timestamp: Utc::now(),
            metadata: None,
            classification,
        }
    }

    pub fn with_metadata(mut self, metadata: HashMap<String, String>) -> Self {
        self.metadata = Some(metadata);
        self
    }

    pub fn is_valid(&self) -> bool {
        self.status == VerificationStatus::Verified
            && self.validation_status == ValidationStatus::Valid
            && self.signature_status == SignatureStatus::Valid
    }
}

impl std::fmt::Display for VerificationStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Pending => write!(f, "PENDING"),
            Self::InProgress => write!(f, "IN_PROGRESS"),
            Self::Verified => write!(f, "VERIFIED"),
            Self::Failed => write!(f, "FAILED"),
            Self::Expired => write!(f, "EXPIRED"),
        }
    }
}

impl std::fmt::Display for ValidationStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Valid => write!(f, "VALID"),
            Self::Invalid => write!(f, "INVALID"),
            Self::Unknown => write!(f, "UNKNOWN"),
        }
    }
}

impl std::fmt::Display for SignatureStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Valid => write!(f, "VALID"),
            Self::Invalid => write!(f, "INVALID"),
            Self::Expired => write!(f, "EXPIRED"),
            Self::Revoked => write!(f, "REVOKED"),
            Self::Unknown => write!(f, "UNKNOWN"),
        }
    }
}
