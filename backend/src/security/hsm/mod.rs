// src/security/hsm/mod.rs

pub mod interface;
pub mod operations;

pub use interface::{
    HsmConnection, 
    HsmOperations, 
    HsmError, 
    KeyType, 
    KeyId, 
    HsmConfig, 
    HsmConnectionFactory
};

pub use operations::{HsmOperationsImpl, HsmManager};

/// Factory for creating HSM implementations
pub struct DefaultHsmFactory;

impl DefaultHsmFactory {
    pub fn new() -> Self {
        Self
    }
}

impl HsmConnectionFactory for DefaultHsmFactory {
    type Connection = HsmOperationsImpl;

    fn create_connection(&self, _config: HsmConfig) -> Result<Self::Connection, HsmError> {
        Ok(HsmOperationsImpl::new())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hsm_factory() {
        let factory = DefaultHsmFactory::new();
        let config = HsmConfig::new(
            "localhost".to_string(),
            1234,
            "test-token".to_string(),
            0,
            "1234".to_string(),
        );
        
        let hsm = factory.create_connection(config).unwrap();
        let key_id = hsm.generate_key(KeyType::Aes256).unwrap();
        assert!(hsm.retrieve_key(&key_id).is_ok());
    }

    #[test]
    fn test_hsm_operations() {
        let factory = DefaultHsmFactory::new();
        let config = HsmConfig::new(
            "localhost".to_string(),
            1234,
            "test-token".to_string(),
            0,
            "1234".to_string(),
        );
        
        let hsm = factory.create_connection(config).unwrap();
        
        // Test key generation and storage
        let key_id = hsm.generate_key(KeyType::Quantum).unwrap();
        let key_data = hsm.retrieve_key(&key_id).unwrap();
        assert_eq!(key_data.len(), 64); // Quantum keys are 64 bytes
        
        // Test signing and verification
        let data = b"test data";
        let signature = hsm.sign_data(&key_id, data).unwrap();
        assert!(hsm.verify_signature(&key_id, data, &signature).unwrap());
    }
}
