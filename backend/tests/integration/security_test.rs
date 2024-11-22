use std::sync::Arc;
use uuid::Uuid;
use chrono::Utc;

use crate::{
    services::{
        core::{
            security::SecurityModule,
            audit::AuditService,
        },
        infrastructure::database::DatabaseService,
    },
    types::{
        security::{SecurityContext, SecurityClassification, SecurityContext, KeyType},
        permissions::{Permission, ResourceType, Action, Constraint},
        audit::{AuditEvent, AuditStatus, AuditEventType, AuditSeverity},
        error::{CoreError, SecurityError},
    },
};

async fn setup_test_environment() -> (Arc<SecurityModule>, Arc<AuditService>) {
    let db = Arc::new(DatabaseService::new().await);
    let security = Arc::new(SecurityModule::new(db.clone()));
    let audit = Arc::new(AuditService::new(db.clone(), security.clone()));
    
    (security, audit)
}

#[tokio::test]
async fn test_security_context_validation() {
    let (security, _) = setup_test_environment().await;

    // Test valid context
    let valid_context = SecurityContext::new(
        SecurityClassification::Confidential,
        Uuid::new_v4(),
        "valid-token".to_string(),
        vec![
            Permission::new(ResourceType::Asset, Action::Read),
            Permission::new(ResourceType::Asset, Action::Create),
        ],
    );

    assert!(security.validate_context(&valid_context).await.is_ok());

    // Test expired token
    let expired_context = SecurityContext::new(
        SecurityClassification::Confidential,
        Uuid::new_v4(),
        "expired-token".to_string(),
        vec![Permission::new(ResourceType::Asset, Action::Read)],
    );

    assert!(matches!(
        security.validate_context(&expired_context).await,
        Err(SecurityError::TokenExpired(_))
    ));

    // Test invalid classification level
    let invalid_context = SecurityContext::new(
        SecurityClassification::TopSecret,
        Uuid::new_v4(),
        "token".to_string(),
        vec![Permission::new(ResourceType::Asset, Action::Read)],
    );

    assert!(matches!(
        security.validate_context(&invalid_context).await,
        Err(SecurityError::ClassificationError(_))
    ));
}

#[tokio::test]
async fn test_permission_enforcement() {
    let (security, _) = setup_test_environment().await;
    let user_id = Uuid::new_v4();
    let asset_id = Uuid::new_v4();

    // Create context with specific permissions
    let context = SecurityContext::new(
        SecurityClassification::Confidential,
        user_id,
        "token".to_string(),
        vec![
            Permission::new(ResourceType::Asset, Action::Read),
            Permission::with_conditions(
                ResourceType::Asset,
                Action::Update,
                serde_json::json!({
                    "max_classification": "CONFIDENTIAL",
                    "requires_mfa": true
                }),
            ),
        ],
    );

    // Test allowed action
    assert!(security.check_permission(
        &context,
        ResourceType::Asset,
        Action::Read,
        None,
    ).await.unwrap());

    // Test denied action
    assert!(!security.check_permission(
        &context,
        ResourceType::Asset,
        Action::Delete,
        None,
    ).await.unwrap());

    // Test conditional permission
    assert!(security.check_permission(
        &context,
        ResourceType::Asset,
        Action::Update,
        Some(serde_json::json!({
            "asset_id": asset_id,
            "mfa_verified": true,
            "classification": "CONFIDENTIAL"
        })),
    ).await.unwrap());
}

#[tokio::test]
async fn test_classification_boundaries() {
    let (security, audit) = setup_test_environment().await;
    let user_id = Uuid::new_v4();
    let asset_id = Uuid::new_v4();

    // Test access at different classification levels
    let test_cases = vec![
        (SecurityClassification::Unclassified, true),
        (SecurityClassification::Confidential, true),
        (SecurityClassification::Secret, false),
        (SecurityClassification::TopSecret, false),
    ];

    for (classification, should_allow) in test_cases {
        let context = SecurityContext::new(
            classification,
            user_id,
            "token".to_string(),
            vec![Permission::new(ResourceType::Asset, Action::Read)],
        );

        let result = security.validate_access(
            &context,
            ResourceType::Asset,
            asset_id,
            SecurityClassification::Confidential,
        ).await;

        assert_eq!(result.is_ok(), should_allow);

        // Verify audit logging
        let events = audit.get_events(
            &context,
            Some(ResourceType::Asset),
            Some(asset_id),
            None,
            None,
        ).await.unwrap();

        let latest_event = events.first().unwrap();
        assert_eq!(latest_event.status, if should_allow {
            AuditStatus::Success
        } else {
            AuditStatus::Failed
        });
    }
}

#[tokio::test]
async fn test_key_management() {
    let (security, _) = setup_test_environment().await;
    let user_id = Uuid::new_v4();

    let context = SecurityContext::new(
        SecurityClassification::Secret,
        user_id,
        "token".to_string(),
        vec![
            Permission::new(ResourceType::Security, Action::Create),
            Permission::new(ResourceType::Security, Action::Read),
        ],
    );

    // Generate and store key
    let key_id = security.generate_key(
        KeyType::Signing,
        SecurityClassification::Secret,
        &context,
    ).await.unwrap();

    // Retrieve key
    let key = security.get_key(&key_id, &context).await.unwrap();
    assert_eq!(key.key_type, KeyType::Signing);
    assert_eq!(key.classification, SecurityClassification::Secret);

    // Test key access with insufficient clearance
    let low_context = SecurityContext::new(
        SecurityClassification::Confidential,
        user_id,
        "token".to_string(),
        vec![Permission::new(ResourceType::Security, Action::Read)],
    );

    assert!(matches!(
        security.get_key(&key_id, &low_context).await,
        Err(SecurityError::ClassificationError(_))
    ));
}
