use std::sync::Arc;
use uuid::Uuid;
use chrono::{Utc, Duration};
use serde_json::json;

use crate::{
    services::{
        core::{
            audit::{AuditService, AuditLogger},
            security::SecurityModule,
        },
        infrastructure::database::DatabaseService,
    },
    types::{
        audit::{AuditEvent, AuditStatus, AuditEventType, AuditSeverity},
        security::{SecurityContext, SecurityClassification},
        permissions::{Permission, ResourceType, Action},
        error::CoreError,
    },
};

async fn setup_test_environment() -> (
    Arc<AuditService>,
    Arc<SecurityModule>,
    SecurityContext,
) {
    let db = Arc::new(DatabaseService::new().await);
    let security = Arc::new(SecurityModule::new(db.clone()));
    let audit_service = Arc::new(AuditService::new(db.clone(), security.clone()));
    
    let security_context = SecurityContext::new(
        SecurityClassification::Confidential,
        Uuid::new_v4(),
        "test-token".to_string(),
        vec![
            Permission::new(ResourceType::Audit, Action::Read),
            Permission::new(ResourceType::Audit, Action::Create),
        ],
    );

    (audit_service, security, security_context)
}

#[tokio::test]
async fn test_complete_audit_trail_flow() {
    let (audit_service, _, security_context) = setup_test_environment().await;
    let resource_id = Uuid::new_v4();

    // 1. Log multiple actions with different classifications
    let actions = vec![
        (AuditEventType::Create, SecurityClassification::Unclassified),
        (AuditEventType::Update, SecurityClassification::Confidential),
        (AuditEventType::Access, SecurityClassification::Secret),
    ];

    for (event_type, classification) in actions {
        let event = AuditEvent {
            id: Uuid::new_v4(),
            event_type,
            description: "Test audit flow".to_string(),
            resource_type: ResourceType::Asset,
            resource_id: Some(resource_id),
            user_id: security_context.user_id,
            timestamp: Utc::now(),
            status: AuditStatus::Success,
            severity: AuditSeverity::Info,
            classification,
            metadata: json!({"test": "metadata"}),
        };

        audit_service.log_event(&event, &security_context).await.unwrap();
    }

    // 2. Verify audit trail retrieval with different security contexts
    let classifications = vec![
        SecurityClassification::Unclassified,
        SecurityClassification::Confidential,
        SecurityClassification::Secret,
        SecurityClassification::TopSecret,
    ];

    for classification in classifications {
        let mut ctx = security_context.clone();
        ctx.classification = classification;

        let events = audit_service.get_events(
            &ctx,
            Some(ResourceType::Asset),
            Some(resource_id),
            Some(Utc::now() - Duration::hours(1)),
            None,
        ).await.unwrap();
        
        // Verify that we only see events up to our classification level
        for event in events {
            assert!(event.classification <= classification);
            assert_eq!(event.resource_type, ResourceType::Asset);
            assert_eq!(event.resource_id, Some(resource_id));
        }
    }

    // 3. Test audit trail consistency
    let all_events = audit_service.get_events(
        &SecurityContext::new(
            SecurityClassification::TopSecret,
            security_context.user_id,
            security_context.token.clone(),
            security_context.permissions.clone(),
        ),
        Some(ResourceType::Asset),
        Some(resource_id),
        None,
        None,
    ).await.unwrap();

    assert_eq!(all_events.len(), 3); // All three actions should be recorded
}

#[tokio::test]
async fn test_audit_trail_with_failures() {
    let (audit_service, _, security_context) = setup_test_environment().await;
    let resource_id = Uuid::new_v4();

    // 1. Log a failed action
    let event = AuditEvent {
        id: Uuid::new_v4(),
        event_type: AuditEventType::Operation,
        description: "Operation failed".to_string(),
        resource_type: ResourceType::Asset,
        resource_id: Some(resource_id),
        user_id: security_context.user_id,
        timestamp: Utc::now(),
        status: AuditStatus::Failed,
        severity: AuditSeverity::Error,
        classification: security_context.classification,
        metadata: json!({"error": "test failure"}),
    };

    audit_service.log_event(&event, &security_context).await.unwrap();

    // 2. Verify failed action is properly recorded
    let events = audit_service.get_events(
        &security_context,
        Some(ResourceType::Asset),
        Some(resource_id),
        None,
        None,
    ).await.unwrap();

    assert_eq!(events.len(), 1);
    assert_eq!(events[0].status, AuditStatus::Failed);
    assert_eq!(events[0].severity, AuditSeverity::Error);
}

#[tokio::test]
async fn test_audit_trail_cleanup() {
    let (audit_service, _, security_context) = setup_test_environment().await;
    
    // 1. Create some audit events
    for i in 0..5 {
        let event = AuditEvent {
            id: Uuid::new_v4(),
            event_type: AuditEventType::Operation,
            description: format!("Test cleanup {}", i),
            resource_type: ResourceType::Asset,
            resource_id: None,
            user_id: security_context.user_id,
            timestamp: Utc::now(),
            status: AuditStatus::Success,
            severity: AuditSeverity::Info,
            classification: security_context.classification,
            metadata: json!({"iteration": i}),
        };

        audit_service.log_event(&event, &security_context).await.unwrap();
    }

    // 2. Perform cleanup
    let deleted = audit_service.cleanup_old_events(Duration::days(0)).await.unwrap();
    assert!(deleted > 0);

    // 3. Verify cleanup
    let events = audit_service.get_events(
        &security_context,
        None,
        None,
        None,
        None,
    ).await.unwrap();
    assert!(events.is_empty());
}
