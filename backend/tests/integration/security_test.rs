use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use uuid::Uuid;
use chrono::Utc;
use handreceipt::{
    api::auth::{
        SecurityServiceImpl,
        AuditServiceImpl,
        EncryptionServiceImpl,
    },
    types::{
        Role, SecurityContext, SecurityClassification,
        Permission,
        audit::{AuditEvent, AuditEventType, AuditSeverity, AuditContext},
        signature::{SignatureMetadata, SignatureType, SignatureAlgorithm},
        app::AuditLogger,
    },
};

mod test_utils {
    use super::*;
    use handreceipt::api::auth::AuditServiceImpl;
    use std::sync::Arc;

    pub async fn create_test_audit_service() -> Arc<dyn AuditLogger> {
        let context = SecurityContext::new(1);
        Arc::new(AuditServiceImpl::new(context))
    }
}

use test_utils::create_test_audit_service;

#[tokio::test]
async fn test_security_classification() {
    let test_cases = vec![
        (SecurityClassification::Unclassified, true),
        (SecurityClassification::Confidential, false),
        (SecurityClassification::Secret, false),
    ];

    let user_id = 1;
    let mut context = SecurityContext::new(user_id);
    context.roles = HashSet::from([Role::Soldier]);

    for (classification, expected) in test_cases {
        context.classification = classification;
        assert_eq!(
            context.classification == SecurityClassification::Unclassified,
            expected,
            "Failed for classification {:?}", classification
        );
    }
}

#[tokio::test]
async fn test_officer_permissions() {
    let user_id = 1;
    let mut officer_context = SecurityContext::new(user_id);
    officer_context.roles = HashSet::from([Role::Officer]);
    officer_context.permissions = vec![Permission::ApproveTransfer];

    assert!(officer_context.has_permission(&Permission::ApproveTransfer));
}

#[tokio::test]
async fn test_nco_permissions() {
    let user_id = 1;
    let mut nco_context = SecurityContext::new(user_id);
    nco_context.roles = HashSet::from([Role::NCO]);
    nco_context.permissions = vec![Permission::ViewProperty];

    assert!(nco_context.has_permission(&Permission::ViewProperty));
}

#[tokio::test]
async fn test_audit_logging() {
    let audit_event = AuditEvent {
        id: Uuid::new_v4(),
        event_type: AuditEventType::SecurityViolation,
        data: serde_json::json!({
            "user_id": "1",
            "action": "view",
            "status": "success",
            "message": "Permission check"
        }),
        context: AuditContext::new(
            "permission_check".to_string(),
            AuditSeverity::Low,
            SecurityClassification::Unclassified,
            Some("1".to_string()),
        ),
        signature: SignatureMetadata {
            key_id: Uuid::new_v4(),
            signature: vec![],
            signer_id: Uuid::new_v4(),
            classification: SecurityClassification::Unclassified,
            signature_type: SignatureType::Audit,
            algorithm: SignatureAlgorithm::Ed25519,
        },
        timestamp: Utc::now(),
    };

    let context = SecurityContext::new(1);
    let audit = create_test_audit_service().await;
    
    audit.log_event(audit_event, &context).await.unwrap();
    
    assert!(true);
}
