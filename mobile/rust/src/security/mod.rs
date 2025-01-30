use ed25519_dalek::{Signature, SigningKey, VerifyingKey, Verifier};
use std::convert::TryInto;
use std::ffi::CString;
use crate::error::Error;

#[repr(C)]
pub struct KeyPair {
    public_key: CString,
    secret_key: CString,
}

/// Manages cryptographic operations and key management
#[derive(Debug)]
pub struct SecurityManager {}

impl SecurityManager {
    /// Generate new Ed25519 key pair (Rust-facing API)
    pub fn generate_keypair(&self) -> Result<KeyPair, Error> {
        let mut csprng = rand::thread_rng();
        let signing_key = SigningKey::generate(&mut csprng);
        
        Ok(KeyPair {
            public_key: CString::new(hex::encode(signing_key.verifying_key().as_bytes()))
                .map_err(|e| Error::Security(e.to_string()))?,
            secret_key: CString::new(hex::encode(signing_key.to_bytes()))
                .map_err(|e| Error::Security(e.to_string()))?,
        })
    }

    /// FFI-friendly key generation (C-facing API)
    #[no_mangle]
    pub extern "C" fn generate_ed25519_keypair() -> *mut KeyPair {
        let manager = SecurityManager::new().expect("Failed to create security manager");
        Box::into_raw(Box::new(
            manager.generate_keypair()
                .expect("Failed to generate Ed25519 keypair")
        ))
    }

    #[no_mangle]
    pub extern "C" fn free_keypair(ptr: *mut KeyPair) {
        if ptr.is_null() {
            return;
        }
        unsafe { Box::from_raw(ptr) };
    }

    pub fn new() -> Result<Self, Error> {
        Ok(Self {})
    }

    /// Verifies a digital signature against provided data
    ///
    /// # Arguments
    /// * `public_key` - Byte slice of the public key
    /// * `message` - Original message bytes
    /// * `signature_bytes` - Signature bytes to verify
    ///
    /// # Returns
    /// true if signature is valid, false otherwise
    pub fn verify_signature(
        &self, 
        public_key: &[u8], 
        message: &[u8], 
        signature_bytes: &[u8]
    ) -> Result<bool, Error> {
        // Convert public key
        let verifying_key = VerifyingKey::from_bytes(
            public_key.try_into().map_err(|_| 
                Error::Security("Invalid public key length".to_string())
            )?
        ).map_err(|_| Error::Security("Invalid public key format".to_string()))?;

        // Convert signature
        let signature = Signature::from_bytes(
            signature_bytes.try_into().map_err(|_| 
                Error::Security("Invalid signature length".to_string())
            )?
        );

        // Verify signature
        verifying_key.verify(message, &signature)
            .map_err(|e| Error::Security(format!("Signature verification failed: {}", e)))
            .map(|_| true)
    }
} 