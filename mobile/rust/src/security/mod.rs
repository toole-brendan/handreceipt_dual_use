use ed25519_dalek::{Signature, VerifyingKey};
use crate::{Result, error::Error};

pub struct SecurityManager {
    verification_key: VerifyingKey,
}

impl SecurityManager {
    pub fn new() -> Result<Self> {
        // In production, this would load the key from secure storage
        // For now, use a placeholder key
        let verification_key_bytes = [0u8; 32];
        let verification_key = VerifyingKey::from_bytes(&verification_key_bytes)
            .map_err(|e| Error::Security(format!("Invalid verification key: {}", e)))?;

        Ok(Self {
            verification_key,
        })
    }

    pub async fn verify_signature(&self, message: &[u8], signature_bytes: &[u8]) -> Result<bool> {
        let signature = Signature::from_bytes(signature_bytes)
            .map_err(|e| Error::Security(format!("Invalid signature format: {}", e)))?;

        Ok(self.verification_key.verify_strict(message, &signature).is_ok())
    }

    pub fn get_public_key(&self) -> &VerifyingKey {
        &self.verification_key
    }
} 