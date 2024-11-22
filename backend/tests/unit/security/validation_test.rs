// backend/tests/unit/security/validation_test.rs

use backend::services::security::validation::TransferValidator;
use backend::core::{SecurityContext, SecurityClassification};
use uuid::Uuid;

#[tokio::test]
async fn test_transfer_validation() {
    let validator = TransferValidator::new();
    let user_id = Uuid::new_v4();
    
    let context = SecurityContext::new(
        SecurityClassification::Secret,
        user_id,
        "test-token".to_string(),
        vec![],
    );

    // Test basic validation
    let result = validator.validate_transfer(&context).await;
    assert!(result.is_ok());
} 