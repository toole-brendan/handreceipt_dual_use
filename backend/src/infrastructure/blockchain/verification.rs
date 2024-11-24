use std::sync::Arc;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use async_trait::async_trait;

use crate::{
    domain::models::transfer::{AssetTransfer, TransferStatus},
    error::CoreError,
    types::security::SecurityContext,
};

use super::authority::{
    AuthorityNode,
    PropertyTransfer,
    SignerRole,
    TransferSignature,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct VerificationResult {
    pub status: TransferStatus,
    pub blockchain_hash: Option<String>,
    pub verified_at: DateTime<Utc>,
    pub signatures: Vec<TransferSignature>,
}

#[async_trait]
pub trait TransferVerification: Send + Sync {
    /// Verifies a transfer on the blockchain
    async fn verify_transfer(
        &self,
        transfer: &AssetTransfer,
        context: &SecurityContext,
    ) -> Result<VerificationResult, CoreError>;

    /// Gets transfer status from blockchain
    async fn get_transfer_status(
        &self,
        transfer_id: Uuid,
        context: &SecurityContext,
    ) -> Result<TransferStatus, CoreError>;

    /// Records transfer on blockchain
    async fn record_transfer(
        &self,
        transfer: &AssetTransfer,
        context: &SecurityContext,
    ) -> Result<String, CoreError>;
}

pub struct BlockchainVerification {
    authority_node: Arc<AuthorityNode>,
}

impl BlockchainVerification {
    pub fn new(authority_node: Arc<AuthorityNode>) -> Self {
        Self { authority_node }
    }

    /// Converts domain transfer to blockchain transfer
    fn to_blockchain_transfer(&self, transfer: &AssetTransfer) -> PropertyTransfer {
        PropertyTransfer {
            property_id: transfer.asset_id,
            from_custodian: Some(transfer.from_node.to_string()),
            to_custodian: transfer.to_node.to_string(),
            initiated_by: transfer.id.to_string(),
            requires_approval: transfer.status == TransferStatus::Pending,
            timestamp: transfer.timestamp,
            signatures: Vec::new(), // Will be added during verification
        }
    }

    /// Gets signer role based on security context
    fn get_signer_role(&self, context: &SecurityContext) -> SignerRole {
        if context.is_officer() {
            SignerRole::Commander
        } else if context.is_supply_officer() {
            SignerRole::SupplyOfficer
        } else if context.is_property_book_officer() {
            SignerRole::PropertyBook
        } else {
            SignerRole::Custodian
        }
    }
}

#[async_trait]
impl TransferVerification for BlockchainVerification {
    async fn verify_transfer(
        &self,
        transfer: &AssetTransfer,
        context: &SecurityContext,
    ) -> Result<VerificationResult, CoreError> {
        // Convert to blockchain transfer
        let mut blockchain_transfer = self.to_blockchain_transfer(transfer);

        // Sign transfer with current authority
        let role = self.get_signer_role(context);
        self.authority_node
            .sign_transfer(&mut blockchain_transfer, role)
            .map_err(|e| CoreError::Blockchain(e))?;

        // Validate transfer
        self.authority_node
            .validate_transfer(&blockchain_transfer)
            .map_err(|e| CoreError::Blockchain(e))?;

        // Record on blockchain
        let hash = self.authority_node
            .record_transfer(&blockchain_transfer)
            .await
            .map_err(|e| CoreError::Blockchain(e))?;

        Ok(VerificationResult {
            status: TransferStatus::Confirmed,
            blockchain_hash: Some(hash),
            verified_at: Utc::now(),
            signatures: blockchain_transfer.signatures,
        })
    }

    async fn get_transfer_status(
        &self,
        transfer_id: Uuid,
        _context: &SecurityContext,
    ) -> Result<TransferStatus, CoreError> {
        self.authority_node
            .get_transfer_status(transfer_id)
            .await
            .map_err(|e| CoreError::Blockchain(e))
    }

    async fn record_transfer(
        &self,
        transfer: &AssetTransfer,
        context: &SecurityContext,
    ) -> Result<String, CoreError> {
        // Convert and sign transfer
        let mut blockchain_transfer = self.to_blockchain_transfer(transfer);
        let role = self.get_signer_role(context);
        
        self.authority_node
            .sign_transfer(&mut blockchain_transfer, role)
            .map_err(|e| CoreError::Blockchain(e))?;

        // Record on blockchain
        self.authority_node
            .record_transfer(&blockchain_transfer)
            .await
            .map_err(|e| CoreError::Blockchain(e))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::Keypair;
    use std::collections::HashMap;

    fn create_test_authority() -> Arc<AuthorityNode> {
        let keypair = Keypair::generate(&mut rand::thread_rng());
        let certificate = super::authority::MilitaryCertificate {
            issuer: "DOD-CA".to_string(),
            subject: "1-1 IN S4".to_string(),
            valid_from: Utc::now(),
            valid_until: Utc::now() + chrono::Duration::days(365),
            certificate_id: "TEST123".to_string(),
        };

        let mut hierarchy = HashMap::new();
        hierarchy.insert(
            "1-DIV".to_string(),
            vec!["1-BDE".to_string(), "2-BDE".to_string()],
        );

        Arc::new(AuthorityNode::new(
            "1-1-IN".to_string(),
            keypair,
            certificate,
            true,
            hierarchy,
        ))
    }

    #[tokio::test]
    async fn test_transfer_verification() {
        let authority = create_test_authority();
        let verification = BlockchainVerification::new(authority);

        let transfer = AssetTransfer {
            id: Uuid::new_v4(),
            asset_id: Uuid::new_v4(),
            from_node: Uuid::new_v4(),
            to_node: Uuid::new_v4(),
            status: TransferStatus::Pending,
            timestamp: Utc::now(),
            metadata: serde_json::json!({}),
            verification_method: None,
            signatures: Vec::new(),
        };

        let context = SecurityContext::default(); // Mock context
        let result = verification.verify_transfer(&transfer, &context).await;
        assert!(result.is_ok());

        let verification_result = result.unwrap();
        assert_eq!(verification_result.status, TransferStatus::Confirmed);
        assert!(verification_result.blockchain_hash.is_some());
    }
}
