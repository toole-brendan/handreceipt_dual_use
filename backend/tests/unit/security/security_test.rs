// backend/tests/unit/security/security_test.rs

use std::sync::Arc;
use uuid::Uuid;
use crate::services::{
    database::{
        postgresql::{
            secure_storage::SecureStorage,
            connection::DatabaseConnection,
            classification::SecurityClassification,
        },
        extensions::pgcrypto::PgCryptoManager,
    },
    security::SecurityModule,
};

#[tokio::test]
async fn test_secure_storage_operations() {
    // Setup
    let security = Arc::new(SecurityModule::new());
    let conn = DatabaseConnection::new(security.clone()).await.unwrap();
    let secure_storage = SecureStorage::new(conn.clone());

    // Test data
    #[derive(serde::Serialize, serde::Deserialize, PartialEq, Debug)]
    struct TestData {
        id: Uuid,
        value: String,
    }

    let test_data = TestData {
        id: Uuid::new_v4(),
        value: "test_value".to_string(),
    };

    // Test store
    secure_storage.store("test_key", &test_data).await.unwrap();

    // Test retrieve
    let retrieved: TestData = secure_storage.retrieve("test_key").await.unwrap();
    assert_eq!(retrieved, test_data);

    // Test not found
    let result: Result<TestData, _> = secure_storage.retrieve("nonexistent_key").await;
    assert!(matches!(result, Err(_)));
}

#[tokio::test]
async fn test_pgcrypto_operations() {
    let security = Arc::new(SecurityModule::new());
    let conn = Arc::new(DatabaseConnection::new(security.clone()).await.unwrap());
    let crypto_manager = PgCryptoManager::new(conn);

    // Test password hashing
    let password = "test_password";
    let hash = crypto_manager.hash_password(password).await.unwrap();
    
    // Verify password
    let is_valid = crypto_manager.verify_password(password, &hash).await.unwrap();
    assert!(is_valid);

    // Test wrong password
    let is_invalid = crypto_manager.verify_password("wrong_password", &hash).await.unwrap();
    assert!(!is_invalid);

    // Test data encryption/decryption
    let data = b"sensitive data";
    let key = b"encryption_key_32_bytes_long_test!!";
    
    let encrypted = crypto_manager.encrypt_data(data, key).await.unwrap();
    let decrypted = crypto_manager.decrypt_data(&encrypted, key).await.unwrap();
    
    assert_eq!(data, &decrypted[..]);
}

#[tokio::test]
async fn test_security_classification() {
    let security = Arc::new(SecurityModule::new());
    let conn = DatabaseConnection::new(security.clone()).await.unwrap();

    // Test different classification levels
    let contexts = vec![
        SecurityClassification::Unclassified,
        SecurityClassification::Confidential,
        SecurityClassification::Secret,
        SecurityClassification::TopSecret,
    ];

    for classification in contexts {
        let result = conn.execute_with_security::<bool>(
            "SELECT true",
            &[],
            &crate::core::SecurityContext {
                classification,
                user_id: Uuid::new_v4(),
                token: "test_token".to_string(),
                permissions: vec![],
            },
        ).await;
        
        assert!(result.is_ok());
    }
}
