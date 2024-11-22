use backend::services::security::{MfaManager, MfaTokenType};
use uuid::Uuid;

#[tokio::test]
async fn test_mfa_flow() {
    let mfa_manager = MfaManager::new();
    let user_id = Uuid::new_v4();
    
    // Test TOTP generation
    let totp = mfa_manager.generate_totp(user_id).await.unwrap();
    assert!(!totp.is_empty());
    
    // Test token verification
    let is_valid = mfa_manager.verify_token(
        user_id,
        &totp,
        MfaTokenType::Totp
    ).await.unwrap();
    assert!(is_valid);
    
    // Test invalid token
    let is_invalid = mfa_manager.verify_token(
        user_id,
        "invalid_token",
        MfaTokenType::Totp
    ).await.unwrap();
    assert!(!is_invalid);
} 