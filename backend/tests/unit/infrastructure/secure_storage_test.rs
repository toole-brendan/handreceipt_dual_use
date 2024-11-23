use backend::services::infrastructure::storage::secure::{SecureStorage, SecureStorageError};

#[test]
fn test_encryption_decryption() {
    let key = [0u8; 32]; // Use a proper key in production
    let storage = SecureStorage::new(&key).unwrap();
    let data = b"Hello, World!";

    let encrypted = storage.encrypt(data).unwrap();
    let decrypted = storage.decrypt(&encrypted).unwrap();

    assert_eq!(data.to_vec(), decrypted);
}

#[test]
fn test_different_plaintexts_produce_different_ciphertexts() {
    let key = [0u8; 32];
    let storage = SecureStorage::new(&key).unwrap();
    
    let data1 = b"Hello";
    let data2 = b"World";

    let encrypted1 = storage.encrypt(data1).unwrap();
    let encrypted2 = storage.encrypt(data2).unwrap();

    assert_ne!(encrypted1, encrypted2);
}

#[test]
fn test_invalid_ciphertext() {
    let key = [0u8; 32];
    let storage = SecureStorage::new(&key).unwrap();
    
    let invalid_data = vec![0u8; 8]; // Too short
    assert!(storage.decrypt(&invalid_data).is_err());
}
