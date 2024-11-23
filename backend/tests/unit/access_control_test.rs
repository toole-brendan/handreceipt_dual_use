use backend::services::security::AccessControl;
use backend::core::{SecurityContext, SecurityClassification, ResourceType, Action, Permission};
use uuid::Uuid;

#[tokio::test]
async fn test_access_control() {
    let access_control = AccessControl::new();
    let user_id = Uuid::new_v4();
    
    let context = SecurityContext::new(
        SecurityClassification::Secret,
        user_id,
        "test-token".to_string(),
        vec![Permission {
            resource_type: ResourceType::Asset,
            actions: vec![Action::Read],
            constraints: vec![],
        }],
    );
    
    // Test permission verification
    let has_access = access_control.verify_access(
        &context,
        ResourceType::Asset,
        Action::Read
    ).await.unwrap();
    assert!(has_access);
    
    // Test denied access
    let no_access = access_control.verify_access(
        &context,
        ResourceType::Asset,
        Action::Delete
    ).await.unwrap();
    assert!(!no_access);
} 