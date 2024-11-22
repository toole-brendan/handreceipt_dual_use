use backend::services::security::{KeyRotationManager, KeyStatus};
use chrono::Duration;

#[tokio::test]
async fn test_key_rotation() {
    let manager = KeyRotationManager::new(30);
    
    // Initialize key management
    manager.initialize().await.unwrap();
    
    // Test key generation
    let key_id = manager.generate_key().await.unwrap();
    let key = manager.get_current_key().await.unwrap();
    assert!(!key.is_empty());
    
    // Test key rotation
    manager.rotate_key().await.unwrap();
    let new_key = manager.get_current_key().await.unwrap();
    assert_ne!(key, new_key);
    
    // Test key status
    let status = manager.get_key_status(key_id).await.unwrap();
    assert_eq!(status, KeyStatus::Inactive);
} 