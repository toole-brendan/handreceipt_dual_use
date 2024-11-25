use std::collections::HashMap;
use std::sync::Arc;
use chrono::Utc;

use handreceipt::{
    api::auth::{
        AccessControlImpl,
        AuditServiceImpl,
        EncryptionServiceImpl,
        SecurityServiceImpl,
    },
    types::{
        app::{SecurityService, AuditLogger},
        security::{SecurityContext, SecurityClassification, Role},
        permissions::{Permission, ResourceType, Action},
        audit::{AuditEvent, AuditEventType, AuditSeverity, AuditContext},
        signature::{SignatureMetadata, SignatureType, SignatureAlgorithm},
    },
};

async fn setup_test_environment() -> (Arc<SecurityServiceImpl>, Arc<AuditServiceImpl>) {
    let encryption = Arc::new(EncryptionServiceImpl::new(&[0u8; 32]));
    let mut context = SecurityContext::new(uuid::Uuid::new_v4());
    context.metadata = HashMap::new();
    context.permissions = vec![];
    let audit = Arc::new(AuditServiceImpl::new(context));
    let security = Arc::new(SecurityServiceImpl::new(encryption, audit.clone()));
    
    (security, audit)
}

#[tokio::test]
async fn test_security_context_validation() {
    let (security, _) = setup_test_environment().await;

    // Test valid context
    let mut valid_context = SecurityContext::new(uuid::Uuid::new_v4());
    valid_context.classification = SecurityClassification::Unclassified;
    valid_context.roles = vec![Role::Officer];
    valid_context.permissions = vec![
        Permission::new(ResourceType::Property, Action::Read, HashMap::new()),
        Permission::new(ResourceType::Property, Action::Create, HashMap::new()),
    ];
    valid_context.unit_code = "1-1-IN".to_string();
    valid_context.metadata = HashMap::new();

    assert!(security.validate_context(&valid_context).await.unwrap());

    // Test officer permissions
    assert!(valid_context.is_officer());
    assert!(valid_context.can_handle_sensitive_items());
    assert!(valid_context.has_permission(ResourceType::Property, Action::Read));
}

#[tokio::test]
async fn test_permission_enforcement() {
    let (security, audit) = setup_test_environment().await;
    let user_id = uuid::Uuid::new_v4();

    // Create context with specific permissions
    let mut context = SecurityContext::new(user_id);
    context.classification = SecurityClassification::Unclassified;
    context.roles = vec![Role::NCO];
    context.permissions = vec![
        Permission::new(ResourceType::Property, Action::Read, HashMap::new()),
        Permission::new(ResourceType::Property, Action::Update, HashMap::new()),
    ];
    context.unit_code = "1-1-IN".to_string();
    context.metadata = HashMap::new();

    // Test allowed action
    assert!(security.check_permissions(&context, "property", "read").await.unwrap());

    // Test denied action
    assert!(!context.has_permission(ResourceType::Property, Action::Delete));

    // Log security event
    let audit_event = AuditEvent {
        id: uuid::Uuid::new_v4(),
        event_type: AuditEventType::SystemEvent,
        data: serde_json::json!({
            "action": "permission_check",
            "resource": "property",
            "result": "success"
        }),
        context: AuditContext::new(
            "permission_check".to_string(),
            AuditSeverity::Low,
            context.classification,
            Some(context.user_id.to_string()),
        ),
        signature: SignatureMetadata::new(
            uuid::Uuid::new_v4(),
            vec![],
            uuid::Uuid::new_v4(),
            context.classification,
            SignatureType::System,
            SignatureAlgorithm::Ed25519,
        ),
        timestamp: Utc::now(),
    };

    assert!(audit.log_event(audit_event, &context).await.is_ok());
}

#[tokio::test]
async fn test_classification_boundaries() {
    let (security, _) = setup_test_environment().await;
    let user_id = uuid::Uuid::new_v4();

    // Test access at different classification levels
    let test_cases = vec![
        (SecurityClassification::Unclassified, true),
        (SecurityClassification::Sensitive, true),
        (SecurityClassification::Classified, false),
    ];

    for (classification, should_allow) in test_cases {
        let mut context = SecurityContext::new(user_id);
        context.classification = classification;
        context.roles = vec![Role::Soldier];
        context.unit_code = "1-1-IN".to_string();
        context.metadata = HashMap::new();
        context.permissions = vec![];

        let result = security.validate_context(&context).await.unwrap();
        assert_eq!(result, should_allow);
    }
}

#[tokio::test]
async fn test_command_hierarchy() {
    let (_, _) = setup_test_environment().await;
    let user_id = uuid::Uuid::new_v4();

    // Create officer context
    let mut officer_context = SecurityContext::new(user_id);
    officer_context.roles = vec![Role::Officer];
    officer_context.unit_code = "1-1-IN".to_string();
    officer_context.permissions = vec![
        Permission::new(ResourceType::Transfer, Action::ApproveCommand, HashMap::new()),
    ];
    officer_context.metadata = HashMap::new();
    officer_context.classification = SecurityClassification::Unclassified;

    // Test command approval permissions
    assert!(officer_context.can_approve_for_command("1-1"));
    assert!(!officer_context.can_approve_for_command("2-1"));

    // Create NCO context
    let mut nco_context = SecurityContext::new(uuid::Uuid::new_v4());
    nco_context.roles = vec![Role::NCO];
    nco_context.unit_code = "1-1-IN".to_string();
    nco_context.permissions = vec![];
    nco_context.metadata = HashMap::new();
    nco_context.classification = SecurityClassification::Unclassified;

    // Test NCO permissions
    assert!(nco_context.can_handle_sensitive_items());
    assert!(!nco_context.can_approve_for_command("1-1"));
}
