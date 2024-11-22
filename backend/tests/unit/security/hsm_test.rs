use backend::services::security::{HsmManager, HsmConfig, KeyType};

#[tokio::test]
async fn test_hsm_operations() {
    let config = HsmConfig {
        device_path: "/dev/hsm".to_string(),
        pin: "123456".to_string(),
        slot_id: 0,
    };
    let hsm = HsmManager::new(config);
    
    // Test key generation
    let key_id = hsm.generate_key(KeyType::Aes256).await.unwrap();
    
    // Test encryption/decryption
    let test_data = b"test data";
    let encrypted = hsm.encrypt_data(key_id, test_data).await.unwrap();
    let decrypted = hsm.decrypt_data(key_id, &encrypted).await.unwrap();
    assert_eq!(test_data.to_vec(), decrypted);
} 