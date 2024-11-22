use std::sync::Arc;
use uuid::Uuid;
use chrono::Utc;
use crate::services::{
    signature::{
        generator::SignatureGenerator,
        validator::SignatureValidator,
        SignatureType,
        SignatureMetadata,
    },
    database::postgresql::{
        connection::DbPool,
        classification::SecurityClassification,
    },
};

#[tokio::test]
async fn test_signature_validation() {
    let pool = DbPool::new().await;
    let generator = SignatureGenerator::new(pool.clone());
    let validator = SignatureValidator::new(pool);
    let signer_id = Uuid::new_v4();
    let validator_id = Uuid::new_v4();

    // Generate a signature
    let test_data = b"test message";
    let (signature, _) = generator.sign_data(
        test_data,
        signer_id,
        SecurityClassification::Confidential,
        SignatureType::Asset,
    ).await.unwrap();

    // Validate the signature
    let validation_result = validator.validate_signature(
        test_data,
        &signature,
        validator_id,
        SecurityClassification::Confidential,
    ).await.unwrap();

    assert!(validation_result.is_valid);
    assert!(validation_result.error.is_none());
}

#[tokio::test]
async fn test_invalid_signature_validation() {
    let pool = DbPool::new().await;
    let validator = SignatureValidator::new(pool);
    let validator_id = Uuid::new_v4();

    // Test with tampered data
    let tampered_signature = vec![0u8; 64]; // Invalid signature bytes
    let result = validator.validate_signature(
        b"test data",
        &tampered_signature,
        validator_id,
        SecurityClassification::Confidential,
    ).await.unwrap();

    assert!(!result.is_valid);
    assert!(result.error.is_some());
}

#[tokio::test]
async fn test_validation_history() {
    let pool = DbPool::new().await;
    let generator = SignatureGenerator::new(pool.clone());
    let validator = SignatureValidator::new(pool);
    let signer_id = Uuid::new_v4();
    let validator_id = Uuid::new_v4();

    // Generate and validate a signature
    let (signature, metadata) = generator.sign_data(
        b"test data",
        signer_id,
        SecurityClassification::Confidential,
        SignatureType::Asset,
    ).await.unwrap();

    validator.validate_signature(
        b"test data",
        &signature,
        validator_id,
        SecurityClassification::Confidential,
    ).await.unwrap();

    // Get validation history
    let history = validator.get_validation_history(
        metadata.id,
        SecurityClassification::TopSecret,
    ).await.unwrap();

    assert!(!history.is_empty());
    assert!(history[0].is_valid);
}

#[tokio::test]
async fn test_classification_restrictions() {
    let pool = DbPool::new().await;
    let generator = SignatureGenerator::new(pool.clone());
    let validator = SignatureValidator::new(pool);
    let signer_id = Uuid::new_v4();
    let validator_id = Uuid::new_v4();

    // Generate a Secret signature
    let (signature, _) = generator.sign_data(
        b"classified data",
        signer_id,
        SecurityClassification::Secret,
        SignatureType::Asset,
    ).await.unwrap();

    // Try to validate with lower classification
    let result = validator.validate_signature(
        b"classified data",
        &signature,
        validator_id,
        SecurityClassification::Confidential,
    ).await.unwrap();

    assert!(!result.is_valid);
    assert!(result.error.is_some());
}

#[tokio::test]
async fn test_validator_initialization() {
    let pool = DbPool::new().await;
    let validator = SignatureValidator::new(pool);

    // Test initialization
    assert!(validator.initialize().await.is_ok());

    // Test re-initialization (should be idempotent)
    assert!(validator.initialize().await.is_ok());
}
