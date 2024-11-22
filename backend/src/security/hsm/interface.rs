// src/security/hsm/interface.rs

use std::error::Error;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum HsmError {
    #[error("HSM connection failed: {0}")]
    ConnectionError(String),
    #[error("Key operation failed: {0}")]
    KeyOperationError(String),
    #[error("Authentication failed: {0}")]
    AuthenticationError(String),
    #[error("Invalid key identifier: {0}")]
    InvalidKeyError(String),
}

/// Represents a connection to a Hardware Security Module
pub trait HsmConnection: Send + Sync {
    fn connect(&mut self) -> Result<(), HsmError>;
    fn disconnect(&mut self) -> Result<(), HsmError>;
    fn is_connected(&self) -> bool;
}

/// Defines the core HSM operations
pub trait HsmOperations: Send + Sync {
    fn generate_key(&self, key_type: KeyType) -> Result<KeyId, HsmError>;
    fn store_key(&self, key_data: &[u8], key_type: KeyType) -> Result<KeyId, HsmError>;
    fn retrieve_key(&self, key_id: &KeyId) -> Result<Vec<u8>, HsmError>;
    fn delete_key(&self, key_id: &KeyId) -> Result<(), HsmError>;
    fn sign_data(&self, key_id: &KeyId, data: &[u8]) -> Result<Vec<u8>, HsmError>;
    fn verify_signature(&self, key_id: &KeyId, data: &[u8], signature: &[u8]) -> Result<bool, HsmError>;
}

#[derive(Debug, Clone, PartialEq)]
pub enum KeyType {
    Aes256,
    Rsa2048,
    Rsa4096,
    EcdsaP256,
    EcdsaP384,
    Ed25519,
    Quantum,
}

#[derive(Debug, Clone, PartialEq)]
pub struct KeyId(String);

impl KeyId {
    pub fn new(id: String) -> Self {
        Self(id)
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

/// Configuration for HSM connection
#[derive(Debug, Clone)]
pub struct HsmConfig {
    pub host: String,
    pub port: u16,
    pub token_label: String,
    pub slot_id: u64,
    pub user_pin: String,
}

impl HsmConfig {
    pub fn new(
        host: String,
        port: u16,
        token_label: String,
        slot_id: u64,
        user_pin: String,
    ) -> Self {
        Self {
            host,
            port,
            token_label,
            slot_id,
            user_pin,
        }
    }
}

/// Factory for creating HSM connections
pub trait HsmConnectionFactory {
    type Connection: HsmConnection + HsmOperations;
    
    fn create_connection(&self, config: HsmConfig) -> Result<Self::Connection, HsmError>;
}

#[cfg(test)]
pub mod tests {
    use super::*;
    use std::sync::atomic::{AtomicBool, Ordering};

    pub struct MockHsm {
        connected: AtomicBool,
    }

    impl MockHsm {
        pub fn new() -> Self {
            Self {
                connected: AtomicBool::new(false),
            }
        }
    }

    impl HsmConnection for MockHsm {
        fn connect(&mut self) -> Result<(), HsmError> {
            self.connected.store(true, Ordering::SeqCst);
            Ok(())
        }

        fn disconnect(&mut self) -> Result<(), HsmError> {
            self.connected.store(false, Ordering::SeqCst);
            Ok(())
        }

        fn is_connected(&self) -> bool {
            self.connected.load(Ordering::SeqCst)
        }
    }

    impl HsmOperations for MockHsm {
        fn generate_key(&self, key_type: KeyType) -> Result<KeyId, HsmError> {
            Ok(KeyId::new(format!("mock-key-{:?}", key_type)))
        }

        fn store_key(&self, _key_data: &[u8], key_type: KeyType) -> Result<KeyId, HsmError> {
            Ok(KeyId::new(format!("mock-stored-key-{:?}", key_type)))
        }

        fn retrieve_key(&self, key_id: &KeyId) -> Result<Vec<u8>, HsmError> {
            Ok(key_id.as_str().as_bytes().to_vec())
        }

        fn delete_key(&self, _key_id: &KeyId) -> Result<(), HsmError> {
            Ok(())
        }

        fn sign_data(&self, _key_id: &KeyId, data: &[u8]) -> Result<Vec<u8>, HsmError> {
            Ok(data.to_vec())
        }

        fn verify_signature(&self, _key_id: &KeyId, _data: &[u8], _signature: &[u8]) -> Result<bool, HsmError> {
            Ok(true)
        }
    }

    #[test]
    fn test_mock_hsm() {
        let mut hsm = MockHsm::new();
        assert!(!hsm.is_connected());
        
        hsm.connect().unwrap();
        assert!(hsm.is_connected());
        
        let key_id = hsm.generate_key(KeyType::Aes256).unwrap();
        assert!(key_id.as_str().contains("mock-key"));
        
        hsm.disconnect().unwrap();
        assert!(!hsm.is_connected());
    }
}
