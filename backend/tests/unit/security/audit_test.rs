use backend::services::security::audit::{AuditLogger, AuditEvent, AuditEventType, AuditSeverity};
use std::sync::Arc;
use uuid::Uuid;
use chrono::Utc;
use deadpool_postgres::Runtime;

#[tokio::test]
async fn test_audit_logging() {
    let audit_logger = AuditLogger::new(Arc::new(create_test_db_pool().await));
    let user_id = Uuid::new_v4();
    let resource_id = Uuid::new_v4();

    // Test logging an event
    let event_id = audit_logger
        .log_event(
            AuditEventType::Authentication,
            AuditSeverity::Info,
            Some(user_id),
            Some(resource_id.to_string()),
            "LOGIN".to_string(),
            "SUCCESS".to_string(),
            serde_json::json!({"ip": "127.0.0.1"}),
            None,
        )
        .await
        .unwrap();

    // Verify the logged event
    let events = audit_logger
        .get_events(Some(user_id), None, None)
        .await
        .unwrap();

    assert!(!events.is_empty());
    let event = &events[0];
    assert_eq!(event.id, event_id);
    assert_eq!(event.event_type, AuditEventType::Authentication);
    assert_eq!(event.user_id, Some(user_id));
}

#[tokio::test]
async fn test_audit_chain_verification() {
    let audit_logger = AuditLogger::new(Arc::new(create_test_db_pool().await));
    let user_id = Uuid::new_v4();

    // Create a sequence of events
    for i in 0..3 {
        audit_logger
            .log_event(
                AuditEventType::DataAccess,
                AuditSeverity::Info,
                Some(user_id),
                None,
                format!("ACTION_{}", i),
                "SUCCESS".to_string(),
                serde_json::json!({}),
                None,
            )
            .await
            .unwrap();
    }

    // Verify the audit chain
    assert!(audit_logger.verify_chain().await.unwrap());
}

#[tokio::test]
async fn test_audit_filtering() {
    let audit_logger = AuditLogger::new(Arc::new(create_test_db_pool().await));
    let user_id = Uuid::new_v4();
    let start_time = Utc::now();

    // Log events with different severities
    let severities = vec![
        AuditSeverity::Info,
        AuditSeverity::Warning,
        AuditSeverity::Error,
    ];

    for severity in severities {
        audit_logger
            .log_event(
                AuditEventType::SecurityAlert,
                severity.clone(),
                Some(user_id),
                None,
                "TEST".to_string(),
                "COMPLETE".to_string(),
                serde_json::json!({}),
                None,
            )
            .await
            .unwrap();
    }

    // Test filtering by severity
    let critical_events = audit_logger
        .get_events_by_severity(AuditSeverity::Error, Some(start_time))
        .await
        .unwrap();
    assert_eq!(critical_events.len(), 1);
}

async fn create_test_db_pool() -> deadpool_postgres::Pool {
    let mut cfg = deadpool_postgres::Config::new();
    cfg.host = Some("localhost".to_string());
    cfg.dbname = Some("test_db".to_string());
    cfg.user = Some("test_user".to_string());
    cfg.password = Some("test_password".to_string());
    
    cfg.create_pool(Some(Runtime::Tokio1), tokio_postgres::NoTls).unwrap()
} 