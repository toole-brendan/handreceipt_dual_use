use backend::services::security::EncryptionService;
use backend::core::SecurityClassification;
use uuid::Uuid;

#[tokio::test]
async fn test_encryption_decryption() {
    let encryption_service = EncryptionService::new();
    let test_data = b"sensitive test data";
    
    // Test basic encryption/decryption
    let encrypted = encryption_service.encrypt(test_data).await.unwrap();
    let decrypted = encryption_service.decrypt(&encrypted).await.unwrap();
    assert_eq!(test_data.to_vec(), decrypted);
    
    // Test with different classification levels
    let classifications = vec![
        SecurityClassification::Confidential,
        SecurityClassification::Secret,
        SecurityClassification::TopSecret,
    ];
    
    for classification in classifications {
        let encrypted = encryption_service.encrypt_with_classification(
            test_data,
            classification
        ).await.unwrap();
        let decrypted = encryption_service.decrypt_with_classification(
            &encrypted,
            classification
        ).await.unwrap();
        assert_eq!(test_data.to_vec(), decrypted);
    }
} 