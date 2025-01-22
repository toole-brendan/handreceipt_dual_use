use std::sync::Arc;
use tokio;
use uuid::Uuid;
use chrono::Utc;

use handreceipt::{
    domain::models::transfer::{PropertyTransferRecord, TransferStatus},
    error::blockchain::BlockchainError,
    infrastructure::blockchain::{
        BlockchainService,
        BlockchainConfig,
        sawtooth::{
            SawtoothService,
            state::PropertyMetadata,
        },
    },
    types::security::SecurityContext,
};

use crate::common::mocks::create_mock_transfer;

async fn setup_sawtooth_service() -> Arc<dyn BlockchainService> {
    let config = BlockchainConfig {
        node_id: Uuid::new_v4().to_string(),
        is_authority: true,
        batch_size: 10,
        batch_timeout: std::time::Duration::from_secs(5),
        min_validators: 1,
        max_validators: 3,
        validator_url: "tcp://localhost:4004".to_string(),
        validator_private_key: "test_key".to_string(),
    };

    let service = SawtoothService::new(
        config.validator_url.clone(),
        config.validator_private_key.clone(),
        config,
    ).expect("Failed to create Sawtooth service");

    Arc::new(service)
}

#[tokio::test]
async fn test_single_transfer() -> Result<(), BlockchainError> {
    let service = setup_sawtooth_service().await;
    let context = SecurityContext::new(1); // Officer role

    // Create test transfer
    let transfer = create_mock_transfer();

    // Record transfer
    let result = service.verification_service()
        .record_transfer(&transfer, &context)
        .await?;

    assert!(!result.is_empty(), "Transfer ID should not be empty");

    // Verify transfer
    let verification = service.verification_service()
        .verify_transfer(&transfer, &context)
        .await?;

    assert_eq!(verification.status, TransferStatus::Completed);
    assert!(verification.blockchain_hash.is_some());
    assert!(verification.merkle_proof.is_some());

    Ok(())
}

#[tokio::test]
async fn test_batch_transfer() -> Result<(), BlockchainError> {
    let service = setup_sawtooth_service().await;
    let context = SecurityContext::new(1);

    // Create multiple test transfers
    let transfers: Vec<PropertyTransferRecord> = (0..5)
        .map(|_| create_mock_transfer())
        .collect();

    // Record batch
    let results = service.verification_service()
        .record_batch(&transfers, &context)
        .await?;

    assert_eq!(results.len(), transfers.len(), "Should have result for each transfer");
    
    // Verify each transfer
    for (transfer, result) in transfers.iter().zip(results.iter()) {
        assert!(!result.is_empty(), "Transfer ID should not be empty");
        
        let verification = service.verification_service()
            .verify_transfer(transfer, &context)
            .await?;

        assert_eq!(verification.status, TransferStatus::Completed);
        assert!(verification.blockchain_hash.is_some());
        assert!(verification.merkle_proof.is_some());
    }

    Ok(())
}

#[tokio::test]
async fn test_merkle_proof_verification() -> Result<(), BlockchainError> {
    let service = setup_sawtooth_service().await;
    let context = SecurityContext::new(1);
    let transfer = create_mock_transfer();

    // Record transfer
    let transfer_id = service.verification_service()
        .record_transfer(&transfer, &context)
        .await?;

    // Get Merkle proof
    let proof = service.get_transaction_proof(&transfer_id).await?;
    assert!(proof.is_some(), "Should generate Merkle proof");

    if let Some(proof) = proof {
        // Verify the proof
        let tree = service.get_current_batch_merkle_tree().await?
            .expect("Merkle tree should exist");
        
        assert!(tree.verify_proof(&proof).expect("Proof verification failed"));
    }

    Ok(())
}

#[tokio::test]
async fn test_error_handling() -> Result<(), BlockchainError> {
    let service = setup_sawtooth_service().await;
    let context = SecurityContext::new(1);

    // Test invalid transfer (missing required fields)
    let invalid_transfer = PropertyTransferRecord {
        id: 0,
        from_node: String::new(), // Invalid empty string
        to_node: String::new(),   // Invalid empty string
        timestamp: Utc::now(),
        status: TransferStatus::Pending,
    };

    let result = service.verification_service()
        .record_transfer(&invalid_transfer, &context)
        .await;

    assert!(result.is_err(), "Should fail with invalid transfer");
    if let Err(err) = result {
        match err {
            BlockchainError::ValidationError(_) => (),
            _ => panic!("Expected ValidationError"),
        }
    }

    Ok(())
}

#[tokio::test]
async fn test_concurrent_transfers() -> Result<(), BlockchainError> {
    let service = setup_sawtooth_service().await;
    let context = SecurityContext::new(1);

    // Create multiple transfers
    let transfers: Vec<PropertyTransferRecord> = (0..20)
        .map(|_| create_mock_transfer())
        .collect();

    // Split into concurrent batches
    let batch1 = &transfers[0..10];
    let batch2 = &transfers[10..];

    // Process batches concurrently
    let (results1, results2) = tokio::join!(
        service.verification_service().record_batch(batch1, &context),
        service.verification_service().record_batch(batch2, &context)
    );

    let results1 = results1?;
    let results2 = results2?;

    assert_eq!(results1.len(), batch1.len());
    assert_eq!(results2.len(), batch2.len());

    Ok(())
}

#[tokio::test]
async fn test_service_lifecycle() -> Result<(), BlockchainError> {
    let service = setup_sawtooth_service().await;

    // Test initialization
    service.initialize().await?;

    // Check status
    let status = service.get_status().await?;
    assert!(matches!(status, handreceipt::types::blockchain::ChainStatus::Active));

    // Test shutdown
    service.shutdown().await?;

    Ok(())
} 