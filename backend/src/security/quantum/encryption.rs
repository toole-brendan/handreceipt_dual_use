// backendsrc/security/quantum/encryption.rs

use ring::{aead, rand};
use std::error::Error;

/// Quantum-resistant encryption module using post-quantum cryptography algorithms
pub struct QuantumEncryption {
    key: aead::LessSafeKey,
}

impl QuantumEncryption {
    /// Create a new instance with a randomly generated key
    pub fn new() -> Result<Self, Box<dyn Error>> {
        let rng = rand::SystemRandom::new();
        let key_bytes = rand::generate(&rng)?.expose();
        let unbound_key = aead::UnboundKey::new(&aead::CHACHA20_POLY1305, &key_bytes)?;
        let key = aead::LessSafeKey::new(unbound_key);
        
        Ok(Self { key })
    }

    /// Encrypt data using quantum-resistant algorithm
    pub fn encrypt(&self, data: &[u8]) -> Result<Vec<u8>, Box<dyn Error>> {
        let nonce = aead::Nonce::assume_unique_for_key([0u8; 12]);
        let aad = aead::Aad::empty();
        
        let mut in_out = data.to_vec();
        self.key.seal_in_place_append_tag(nonce, aad, &mut in_out)?;
        
        Ok(in_out)
    }

    /// Decrypt data using quantum-resistant algorithm
    pub fn decrypt(&self, encrypted_data: &[u8]) -> Result<Vec<u8>, Box<dyn Error>> {
        let nonce = aead::Nonce::assume_unique_for_key([0u8; 12]);
        let aad = aead::Aad::empty();
        
        let mut in_out = encrypted_data.to_vec();
        let decrypted_data = self.key.open_in_place(nonce, aad, &mut in_out)?;
        
        Ok(decrypted_data.to_vec())
    }
}

/// Key generation for quantum-resistant encryption
pub struct KeyGenerator {
    rng: rand::SystemRandom,
}

impl KeyGenerator {
    pub fn new() -> Self {
        Self {
            rng: rand::SystemRandom::new(),
        }
    }

    pub fn generate_key(&self) -> Result<Vec<u8>, Box<dyn Error>> {
        let key = rand::generate(&self.rng)?.expose();
        Ok(key.to_vec())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encryption_decryption() {
        let encryption = QuantumEncryption::new().unwrap();
        let data = b"sensitive data";
        
        let encrypted = encryption.encrypt(data).unwrap();
        let decrypted = encryption.decrypt(&encrypted).unwrap();
        
        assert_eq!(data.to_vec(), decrypted);
    }

    #[test]
    fn test_key_generation() {
        let key_gen = KeyGenerator::new();
        let key = key_gen.generate_key().unwrap();
        assert!(!key.is_empty());
    }
}
