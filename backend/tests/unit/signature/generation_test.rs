use std::sync::Arc;
use uuid::Uuid;
use chrono::Utc;
use crate::services::{
    signature::{
        generator::SignatureGenerator,
        SignatureType,
        SignatureMetadata,
        SignatureAlgorithm,
    },
    database::postgresql::{
        connection::DbPool,
        classification::SecurityClassification,
    },
};

#[tokio::test]
async fn test_signature_generation() {
    let pool = DbPool::new().await;
    let generator = SignatureGenerator::new(pool);
    let signer_id = Uuid::new_v4();

    // Test data signing
    let test_data = b"test message to sign";
    let (signature, metadata) = generator.sign_data(
        test_data,
        signer_id,
        SecurityClassification::Confidential,
        SignatureType::Asset,
    ).await.unwrap();

    // Verify signature was created
    assert!(!signature.is_empty());
    assert_eq!(metadata.signer_id, signer_id);
    assert_eq!(metadata.algorithm, SignatureAlgorithm::Ed25519);
}

#[tokio::test]
async fn test_multiple_signature_types() {
    let pool = DbPool::new().await;
    let generator = SignatureGenerator::new(pool);
    let signer_id = Uuid::new_v4();
    let test_data = b"test data";

    // Test different signature types
    let signature_types = vec![
        SignatureType::Asset,
        SignatureType::Transaction,
        SignatureType::Command,
        SignatureType::Verification,
        SignatureType::Transfer,
    ];

    for sig_type in signature_types {
        let (signature, metadata) = generator.sign_data(
            test_data,
            signer_id,
            SecurityClassification::Confidential,
            sig_type.clone(),
        ).await.unwrap();

        assert!(!signature.is_empty());
        assert_eq!(metadata.signature_type, sig_type);
    }
}

#[tokio::test]
async fn test_signature_with_different_classifications() {
    let pool = DbPool::new().await;
    let generator = SignatureGenerator::new(pool);
    let signer_id = Uuid::new_v4();
    let test_data = b"classified data";

    let classifications = vec![
        SecurityClassification::Unclassified,
        SecurityClassification::Confidential,
        SecurityClassification::Secret,
        SecurityClassification::TopSecret,
    ];

    for classification in classifications {
        let (signature, metadata) = generator.sign_data(
            test_data,
            signer_id,
            classification.clone(),
            SignatureType::Asset,
        ).await.unwrap();

        assert!(!signature.is_empty());
        assert_eq!(metadata.classification, classification);
    }
}

#[tokio::test]
async fn test_signature_initialization() {
    let pool = DbPool::new().await;
    let generator = SignatureGenerator::new(pool);

    // Test initialization
    assert!(generator.initialize().await.is_ok());

    // Test re-initialization (should be idempotent)
    assert!(generator.initialize().await.is_ok());
}

#[tokio::test]
async fn test_signature_metadata() {
    let pool = DbPool::new().await;
    let generator = SignatureGenerator::new(pool);
    let signer_id = Uuid::new_v4();
    let test_data = b"test data";

    let (_, metadata) = generator.sign_data(
        test_data,
        signer_id,
        SecurityClassification::Confidential,
        SignatureType::Asset,
    ).await.unwrap();

    // Verify metadata fields
    assert_ne!(metadata.id, Uuid::nil());
    assert_eq!(metadata.signer_id, signer_id);
    assert!(metadata.timestamp <= Utc::now());
    assert_eq!(metadata.algorithm, SignatureAlgorithm::Ed25519);
}
