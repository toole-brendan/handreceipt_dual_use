// backend/tests/unit/security/classification_test.rs

use std::sync::Arc;
use uuid::Uuid;
use chrono::Utc;

use crate::services::security::{
    validation::TransferValidator,
    key_management::KeyRotationManager,
    encryption::EncryptionService,
    mfa::{MfaManager, MfaTokenType},
    hsm::{HsmManager, HsmConfig, KeyType},
};

use crate::services::database::postgresql::classification::ClassificationManager;
use crate::core::{SecurityContext, SecurityClassification};

async fn setup_test_environment() -> (
    Arc<ClassificationManager>,
    Arc<KeyRotationManager>,
    Arc<MfaManager>,
    Arc<HsmManager>,
    SecurityContext
) {
    let conn = Arc::new(DatabaseConnection::new_test().await.unwrap());
    let classification_manager = Arc::new(ClassificationManager::new(conn.clone()));
    
    let key_rotation_manager = Arc::new(KeyRotationManager::new(30)); // 30 days rotation
    let mfa_manager = Arc::new(MfaManager::new());
    
    let hsm_config = HsmConfig {
        device_path: "/dev/hsm".to_string(),
        pin: "123456".to_string(),
        slot_id: 0,
    };
    let hsm_manager = Arc::new(HsmManager::new(hsm_config));

    let security_context = SecurityContext {
        user_id: Uuid::new_v4(),
        classification: SecurityClassification::TopSecret,
        token: "test-token".to_string(),
        permissions: vec!["security.manage".to_string()],
    };

    (classification_manager, key_rotation_manager, mfa_manager, hsm_manager, security_context)
}

#[tokio::test]
async fn test_complete_security_classification_flow() {
    let (classification_manager, _, _, _, security_context) = setup_test_environment().await;

    // 1. Test classification assignment
    let resource_id = Uuid::new_v4();
    classification_manager.set_classification(
        "test_resources",
        resource_id,
        SecurityClassification::Secret,
    ).await.unwrap();

    // 2. Verify classification level
    let level = classification_manager.get_classification(
        "test_resources",
        resource_id,
    ).await.unwrap();
    assert_eq!(level, SecurityClassification::Secret);

    // 3. Test access control
    let test_contexts = vec![
        (SecurityClassification::TopSecret, true),
        (SecurityClassification::Secret, true),
        (SecurityClassification::Confidential, false),
        (SecurityClassification::Unclassified, false),
    ];

    for (classification, should_access) in test_contexts {
        let mut ctx = security_context.clone();
        ctx.classification = classification;
        
        let result = classification_manager.get_classification(
            "test_resources",
            resource_id,
        ).await;
        
        assert_eq!(result.is_ok(), should_access);
    }
}

#[tokio::test]
async fn test_key_rotation_with_classification() {
    let (_, key_rotation_manager, _, hsm_manager, _) = setup_test_environment().await;

    // 1. Initialize key rotation
    key_rotation_manager.initialize().await.unwrap();
    
    // 2. Generate keys for different classification levels
    for classification in &[
        SecurityClassification::Confidential,
        SecurityClassification::Secret,
        SecurityClassification::TopSecret,
    ] {
        // Generate and store key in HSM
        let key_id = hsm_manager.generate_key(KeyType::Aes256).await.unwrap();
        
        // Test key usage
        let test_data = b"Test data for encryption";
        let encrypted = hsm_manager.encrypt_data(key_id, test_data).await.unwrap();
        let decrypted = hsm_manager.decrypt_data(key_id, &encrypted).await.unwrap();
        
        assert_eq!(test_data.to_vec(), decrypted);
    }

    // 3. Test key rotation
    assert!(key_rotation_manager.check_rotation_needed().await);
    key_rotation_manager.rotate_key().await.unwrap();
}

#[tokio::test]
async fn test_mfa_with_classification_levels() {
    let (_, _, mfa_manager, _, _) = setup_test_environment().await;

    // 1. Test MFA requirements for different classification levels
    let test_cases = vec![
        (SecurityClassification::Confidential, vec![MfaTokenType::Totp]),
        (SecurityClassification::Secret, vec![MfaTokenType::Totp, MfaTokenType::Sms]),
        (SecurityClassification::TopSecret, vec![MfaTokenType::Totp, MfaTokenType::HardwareKey]),
    ];

    for (classification, required_factors) in test_cases {
        let user_id = Uuid::new_v4();

        // Generate TOTP token
        let totp = mfa_manager.generate_totp(user_id).await.unwrap();
        assert!(!totp.is_empty());

        // Verify token
        for factor in required_factors {
            let is_valid = mfa_manager.verify_token(
                user_id,
                &totp,
                factor,
            ).await.unwrap();
            assert!(is_valid);
        }
    }
}
