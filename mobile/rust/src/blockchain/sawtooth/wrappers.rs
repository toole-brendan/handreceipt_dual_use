use sawtooth_sdk::signing::{Context, PrivateKey, PublicKey, Signer};
use sawtooth_sdk::signing::secp256k1::{Secp256k1Context, Secp256k1PrivateKey};
use std::sync::Arc;
use crate::error::Error;

/// Thread-safe wrapper for Secp256k1Context
#[derive(Clone)]
pub struct ThreadSafeContext {
    inner: Arc<Secp256k1Context>,
}

impl ThreadSafeContext {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(Secp256k1Context::new()),
        }
    }

    pub fn as_context(&self) -> &dyn Context {
        self.inner.as_ref()
    }
}

/// Thread-safe wrapper for PrivateKey
#[derive(Clone)]
pub struct ThreadSafePrivateKey {
    inner: Arc<Secp256k1PrivateKey>,
}

impl ThreadSafePrivateKey {
    pub fn from_hex(hex_str: &str) -> Result<Self, Error> {
        Ok(Self {
            inner: Arc::new(Secp256k1PrivateKey::from_hex(hex_str)?),
        })
    }

    pub fn as_private_key(&self) -> &dyn PrivateKey {
        self.inner.as_ref()
    }
}

/// Thread-safe wrapper for PublicKey that owns its data
pub struct ThreadSafePublicKey {
    hex_str: String,
}

impl ThreadSafePublicKey {
    pub fn new(hex_str: String) -> Self {
        Self { hex_str }
    }

    pub fn as_hex(&self) -> String {
        self.hex_str.clone()
    }
}

/// Thread-safe wrapper for Signer
pub struct ThreadSafeSigner {
    context: ThreadSafeContext,
    private_key: ThreadSafePrivateKey,
}

impl ThreadSafeSigner {
    pub fn new(context: ThreadSafeContext, private_key: ThreadSafePrivateKey) -> Self {
        Self {
            context,
            private_key,
        }
    }

    pub fn sign(&self, message: &[u8]) -> Result<String, Error> {
        let signer = Signer::new(
            self.context.as_context(),
            self.private_key.as_private_key(),
        );
        signer.sign(message).map_err(Error::SigningError)
    }

    pub fn get_public_key(&self) -> Result<ThreadSafePublicKey, Error> {
        let signer = Signer::new(
            self.context.as_context(),
            self.private_key.as_private_key(),
        );
        let public_key = signer.get_public_key().map_err(Error::SigningError)?;
        Ok(ThreadSafePublicKey::new(public_key.as_hex()))
    }
}

// Implement Send and Sync for our wrapper types
unsafe impl Send for ThreadSafeContext {}
unsafe impl Sync for ThreadSafeContext {}

unsafe impl Send for ThreadSafePrivateKey {}
unsafe impl Sync for ThreadSafePrivateKey {}

unsafe impl Send for ThreadSafePublicKey {}
unsafe impl Sync for ThreadSafePublicKey {}

unsafe impl Send for ThreadSafeSigner {}
unsafe impl Sync for ThreadSafeSigner {} 