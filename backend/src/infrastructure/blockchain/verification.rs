use async_trait::async_trait;
use uuid::Uuid;
use thiserror::Error;

use crate::{
    domain::transfer::Transfer,
    types::security::SecurityContext,
    error::CoreError,
};

#[derive(Debug, Error)]
pub enum BlockchainVerificationError {
    #[error("Invalid signature: {0}")]
    InvalidSignature(String),

    #[error("Verification failed: {0}")]
    VerificationFailed(String),

    #[error("Authority node error: {0}")]
    AuthorityError(String),
}

/// Blockchain verification service for transfers
#[async_trait]
pub trait BlockchainVerification: Send + Sync {
    /// Verifies a transfer on the blockchain
    async fn verify_transfer(
        &self,
        transfer: &Transfer,
        context: &SecurityContext,
    ) -> Result<String, BlockchainVerificationError>;

    /// Gets verification status
    async fn get_verification_status(
        &self,
        verification_id: &str,
    ) -> Result<VerificationStatus, BlockchainVerificationError>;

    /// Gets transfer history from blockchain
    async fn get_transfer_history(
        &self,
        property_id: Uuid,
    ) -> Result<Vec<BlockchainTransfer>, BlockchainVerificationError>;
}

/// Verification status
#[derive(Debug, Clone)]
pub enum VerificationStatus {
    Pending,
    Verified,
    Failed(String),
}

/// Transfer record on blockchain
#[derive(Debug, Clone)]
pub struct BlockchainTransfer {
    pub transfer_id: Uuid,
    pub property_id: Uuid,
    pub from_custodian: Option<String>,
    pub to_custodian: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub verification_hash: String,
    pub command_signature: String,
}

pub struct BlockchainVerificationImpl {
    authority_node: String,
    verification_key: String,
}

impl BlockchainVerificationImpl {
    pub fn new(authority_node: String, verification_key: String) -> Self {
        Self {
            authority_node,
            verification_key,
        }
    }

    /// Creates a verification hash for a transfer
    fn create_verification_hash(&self, transfer: &Transfer) -> String {
        use sha2::{Sha256, Digest};
        
        // Combine transfer data for hashing
        let data = format!(
            "{}:{}:{}:{}:{}",
            transfer.id(),
            transfer.property_id(),
            transfer.from_custodian().unwrap_or(&"none".to_string()),
            transfer.to_custodian(),
            transfer.created_at(),
        );
        
        // Hash the data
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        let result = hasher.finalize();
        
        // Encode as hex
        hex::encode(result)
    }

    /// Signs a verification hash with command signature
    fn sign_verification(&self, hash: &str, context: &SecurityContext) -> String {
        use ed25519_dalek::{Keypair, Signer};
        use rand::rngs::OsRng;

        // In production, would use proper key management
        let mut csprng = OsRng{};
        let keypair: Keypair = Keypair::generate(&mut csprng);

        // Create signature
        let signature = keypair.sign(hash.as_bytes());
        
        // Encode signature
        hex::encode(signature.to_bytes())
    }
}

#[async_trait]
impl BlockchainVerification for BlockchainVerificationImpl {
    async fn verify_transfer(
        &self,
        transfer: &Transfer,
        context: &SecurityContext,
    ) -> Result<String, BlockchainVerificationError> {
        // Create verification hash
        let hash = self.create_verification_hash(transfer);

        // Sign with command signature
        let signature = self.sign_verification(&hash, context);

        // In production, would submit to blockchain network
        // For now, just return the hash
        Ok(hash)
    }

    async fn get_verification_status(
        &self,
        verification_id: &str,
    ) -> Result<VerificationStatus, BlockchainVerificationError> {
        // In production, would check blockchain network
        // For now, always return verified
        Ok(VerificationStatus::Verified)
    }

    async fn get_transfer_history(
        &self,
        property_id: Uuid,
    ) -> Result<Vec<BlockchainTransfer>, BlockchainVerificationError> {
        // In production, would query blockchain network
        // For now, return empty history
        Ok(Vec::new())
    }
}
