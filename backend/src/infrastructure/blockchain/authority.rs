use async_trait::async_trait;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use ed25519_dalek::SigningKey;
use std::collections::HashMap;

use crate::domain::models::transfer::TransferStatus;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MilitaryCertificate {
    pub issuer: String,
    pub subject: String,
    pub valid_from: DateTime<Utc>,
    pub valid_until: Option<DateTime<Utc>>,
    pub roles: Vec<String>,
    pub unit_id: String,
}

pub struct AuthorityNode {
    unit_id: String,
    signing_key: SigningKey,
    certificate: MilitaryCertificate,
    is_commander: bool,
    unit_hierarchy: HashMap<String, Vec<String>>,
}

#[async_trait]
pub trait AuthorityService: Send + Sync {
    async fn sign_transfer(&self, transfer: &mut PropertyTransfer, role: SignerRole) -> Result<(), String>;
    async fn validate_transfer(&self, transfer: &PropertyTransfer) -> Result<(), String>;
    async fn record_transfer(&self, transfer: &PropertyTransfer) -> Result<(), String>;
    async fn get_transfer_status(&self, transfer_id: Uuid) -> Result<TransferStatus, String>;
}

#[async_trait]
impl AuthorityService for AuthorityNode {
    async fn sign_transfer(&self, transfer: &mut PropertyTransfer, role: SignerRole) -> Result<(), String> {
        // TODO: Implement signing
        Ok(())
    }

    async fn validate_transfer(&self, transfer: &PropertyTransfer) -> Result<(), String> {
        // TODO: Implement validation
        Ok(())
    }

    async fn record_transfer(&self, transfer: &PropertyTransfer) -> Result<(), String> {
        // TODO: Implement recording
        Ok(())
    }

    async fn get_transfer_status(&self, _transfer_id: Uuid) -> Result<TransferStatus, String> {
        // TODO: Implement status check
        Ok(TransferStatus::Pending)
    }
}

impl AuthorityNode {
    pub fn new(
        unit_id: String,
        signing_key: SigningKey,
        certificate: MilitaryCertificate,
        is_commander: bool,
        unit_hierarchy: HashMap<String, Vec<String>>,
    ) -> Self {
        Self {
            unit_id,
            signing_key,
            certificate,
            is_commander,
            unit_hierarchy,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyTransfer {
    pub property_id: Uuid,
    pub from_custodian: Option<String>,
    pub to_custodian: String,
    pub initiated_by: String,
    pub requires_approval: bool,
    pub timestamp: DateTime<Utc>,
    pub signatures: Vec<TransferSignature>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferSignature {
    pub signer: String,
    pub role: SignerRole,
    pub timestamp: DateTime<Utc>,
    pub signature: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SignerRole {
    Commander,
    SupplyOfficer,
    Custodian,
}
