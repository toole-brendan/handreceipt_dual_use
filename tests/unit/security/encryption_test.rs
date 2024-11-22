use backend::security::encryption::{self, KeyManagement};
use backend::mesh::error::MeshError;

#[cfg(test)]
mod encryption_tests {
    use super::*;

    #[test]
    fn test_data_encryption() {
        // Test basic encryption/decryption
        let test_data = "classified asset data";
        let key = KeyManagement::generate_key();
        
        let encrypted = encryption::encrypt(test_data.as_bytes(), &key)
            .expect("Failed to encrypt data");
        let decrypted = encryption::decrypt(&encrypted, &key)
            .expect("Failed to decrypt data");
            
        assert_eq!(test_data.as_bytes(), decrypted);
    }

    #[test]
    fn test_key_rotation() {
        // Test key rotation functionality
        let key_manager = KeyManagement::new();
        let old_key = key_manager.current_key();
        
        key_manager.rotate_keys();
        let new_key = key_manager.current_key();
        
        assert_ne!(old_key, new_key, "Keys should be different after rotation");
    }

    #[test]
    fn test_invalid_decryption() {
        // Test handling of invalid decryption attempts
        let test_data = "classified asset data";
        let key1 = KeyManagement::generate_key();
        let key2 = KeyManagement::generate_key();
        
        let encrypted = encryption::encrypt(test_data.as_bytes(), &key1)
            .expect("Failed to encrypt data");
            
        let result = encryption::decrypt(&encrypted, &key2);
        assert!(result.is_err(), "Decryption should fail with wrong key");
    }
}
