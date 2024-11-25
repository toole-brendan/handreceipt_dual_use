use std::sync::Arc;
use chrono::Utc;
use uuid::Uuid;
use std::collections::HashMap;

use handreceipt::{
    api::auth::merkle::MerkleTree,
    domain::models::transfer::{AssetTransfer, TransferStatus},
    infrastructure::blockchain::{
        AuthorityNode,
        BlockchainVerification,
        MilitaryCertificate,
        TransferVerification,
    },
    types::{
        security::{SecurityContext, SecurityClassification, Role},
        permissions::{Permission, ResourceType, Action},
    },
};

/// Creates a test authority node
fn create_test_authority() -> Arc<AuthorityNode> {
    let keypair = ed25519_dalek::Keypair::generate(&mut rand::thread_rng());
    let certificate = MilitaryCertificate {
        issuer: "DOD-CA".to_string(),
        subject: "1-1 IN S4".to_string(),
        valid_from: Utc::now(),
        valid_until: Some(Utc::now() + chrono::Duration::days(365)),
        roles: vec!["COMMANDER".to_string()],
        unit_id: "1-1-IN".to_string(),
    };

    let mut hierarchy = std::collections::HashMap::new();
    hierarchy.insert(
        "1-DIV".to_string(),
        vec!["1-BDE".to_string(), "2-BDE".to_string()],
    );
    hierarchy.insert(
        "1-BDE".to_string(),
        vec!["1-1-IN".to_string(), "1-2-IN".to_string()],
    );

    Arc::new(AuthorityNode::new(
        "1-1-IN".to_string(),
        keypair,
        certificate,
        true,
        hierarchy,
    ))
}

/// Creates a test security context
fn create_test_context(is_officer: bool) -> SecurityContext {
    SecurityContext {
        user_id: Uuid::new_v4(),
        unit_code: "1-1-IN".to_string(),
        roles: if is_officer {
            vec![Role::Officer]
        } else {
            vec![Role::Soldier]
        },
        classification: crate::types::security::SecurityClassification::Unclassified,
        permissions: vec![
            Permission::new(ResourceType::Transfer, Action::ApproveCommand, HashMap::new()),
        ],
        metadata: HashMap::new(),
    }
}

/// Creates a test transfer
fn create_test_transfer() -> AssetTransfer {
    AssetTransfer {
        id: Uuid::new_v4(),
        asset_id: Uuid::new_v4(),
        from_node: Uuid::new_v4(),
        to_node: Uuid::new_v4(),
        status: TransferStatus::Pending,
        timestamp: Utc::now(),
        metadata: serde_json::json!({}),
        verification_method: None,
        signatures: Vec::new(),
    }
}

/// Helper functions
fn create_test_transfer(officer_context: &SecurityContext, soldier_context: &SecurityContext) -> Vec<u8> {
    // Create a dummy transfer record for testing
    let transfer_data = format!(
        "Transfer from {} to {} at {}",
        soldier_context.user_id,
        officer_context.user_id,
        Utc::now()
    );
    transfer_data.as_bytes().to_vec()
}

fn create_merkle_proof(transfer_data: &[u8], public_key: &[u8]) -> Vec<u8> {
    // Create a dummy Merkle proof for testing
    let mut proof = transfer_data.to_vec();
    proof.extend_from_slice(public_key);
    proof
}

#[tokio::test]
async fn test_single_transfer_verification() {
    let authority = create_test_authority();
    let verification = BlockchainVerification::new(authority);
    let context = create_test_context(true);
    let transfer = create_test_transfer();

    let result = verification.verify_transfer(&transfer, &context).await;
    assert!(result.is_ok());

    let verification_result = result.unwrap();
    assert_eq!(verification_result.status, TransferStatus::Confirmed);
    assert!(verification_result.blockchain_hash.is_some());
    assert!(verification_result.merkle_proof.is_some());

    // Verify merkle proof
    let proof = verification_result.merkle_proof.unwrap();
    assert!(crate::infrastructure::blockchain::MerkleTree::verify_proof(&proof).unwrap());
}

#[tokio::test]
async fn test_batch_transfer_verification() {
    let authority = create_test_authority();
    let verification = BlockchainVerification::new(authority);
    let context = create_test_context(true);

    // Create multiple transfers
    let transfers = vec![
        create_test_transfer(),
        create_test_transfer(),
        create_test_transfer(),
    ];

    // Record batch
    let result = verification.record_batch(&transfers, &context).await;
    assert!(result.is_ok());

    let hashes = result.unwrap();
    assert_eq!(hashes.len(), 3);

    // Verify each transfer
    for transfer in transfers {
        let status = verification.get_transfer_status(transfer.id, &context).await;
        assert!(status.is_ok());
        assert_eq!(status.unwrap(), TransferStatus::Confirmed);
    }
}

#[tokio::test]
async fn test_transfer_validation_rules() {
    let authority = create_test_authority();
    let verification = BlockchainVerification::new(authority);
    
    // Test with non-officer context
    let soldier_context = create_test_context(false);
    let sensitive_transfer = AssetTransfer {
        status: TransferStatus::Pending,
        ..create_test_transfer()
    };

    let result = verification.verify_transfer(&sensitive_transfer, &soldier_context).await;
    assert!(result.is_err()); // Should fail without officer approval

    // Test with officer context
    let officer_context = create_test_context(true);
    let result = verification.verify_transfer(&sensitive_transfer, &officer_context).await;
    assert!(result.is_ok()); // Should succeed with officer approval
}

#[tokio::test]
async fn test_merkle_proof_verification() {
    let authority = create_test_authority();
    let verification = BlockchainVerification::new(authority);
    let context = create_test_context(true);

    // Create and verify first transfer
    let transfer1 = create_test_transfer();
    let result1 = verification.verify_transfer(&transfer1, &context).await.unwrap();
    let proof1 = result1.merkle_proof.unwrap();

    // Create and verify second transfer
    let transfer2 = create_test_transfer();
    let result2 = verification.verify_transfer(&transfer2, &context).await.unwrap();
    let proof2 = result2.merkle_proof.unwrap();

    // Verify both proofs are valid but different
    assert!(crate::infrastructure::blockchain::MerkleTree::verify_proof(&proof1).unwrap());
    assert!(crate::infrastructure::blockchain::MerkleTree::verify_proof(&proof2).unwrap());
    assert_ne!(proof1.root_hash, proof2.root_hash);
}

#[tokio::test]
async fn test_concurrent_transfer_processing() {
    let authority = create_test_authority();
    let verification = Arc::new(BlockchainVerification::new(authority));
    let context = create_test_context(true);

    // Create multiple concurrent verification tasks
    let mut handles = Vec::new();
    for _ in 0..5 {
        let verification = verification.clone();
        let context = context.clone();
        let transfer = create_test_transfer();

        let handle = tokio::spawn(async move {
            verification.verify_transfer(&transfer, &context).await
        });
        handles.push(handle);
    }

    // Wait for all verifications to complete
    for handle in handles {
        let result = handle.await.unwrap();
        assert!(result.is_ok());
        let verification_result = result.unwrap();
        assert_eq!(verification_result.status, TransferStatus::Confirmed);
        assert!(verification_result.merkle_proof.is_some());
    }
}

#[tokio::test]
async fn test_large_batch_processing() {
    let authority = create_test_authority();
    let verification = BlockchainVerification::new(authority);
    let context = create_test_context(true);

    // Create a large batch of transfers
    let transfers: Vec<_> = (0..100).map(|_| create_test_transfer()).collect();

    // Record batch
    let result = verification.record_batch(&transfers, &context).await;
    assert!(result.is_ok());

    let hashes = result.unwrap();
    assert_eq!(hashes.len(), 100);

    // Verify random transfer from batch
    let random_transfer = transfers.first().unwrap();
    let status = verification.get_transfer_status(random_transfer.id, &context).await;
    assert!(status.is_ok());
    assert_eq!(status.unwrap(), TransferStatus::Confirmed);
}

#[tokio::test]
async fn test_blockchain_verification() {
    let keypair = ed25519_dalek::Keypair::generate(&mut rand::thread_rng());
    let public_key = keypair.public.to_bytes();

    // Create test contexts
    let mut officer_context = SecurityContext {
        user_id: Uuid::new_v4(),
        classification: SecurityClassification::Unclassified,
        roles: vec![Role::Officer],
        permissions: vec![
            Permission::new(ResourceType::Transfer, Action::ApproveCommand, HashMap::new()),
        ],
        unit_code: "1-1-IN".to_string(),
        metadata: HashMap::new(),
    };

    let mut soldier_context = SecurityContext {
        user_id: Uuid::new_v4(),
        classification: SecurityClassification::Unclassified,
        roles: vec![Role::Soldier],
        permissions: vec![
            Permission::new(ResourceType::Transfer, Action::Create, HashMap::new()),
        ],
        unit_code: "1-1-IN".to_string(),
        metadata: HashMap::new(),
    };

    // Test verification with valid signatures
    let transfer = create_test_transfer(&officer_context, &soldier_context);
    let proof = create_merkle_proof(&transfer, &public_key);
    
    assert!(MerkleTree::verify_proof(&proof).unwrap());
}

#[tokio::test]
async fn test_multiple_verifications() {
    let keypair = ed25519_dalek::Keypair::generate(&mut rand::thread_rng());
    let public_key = keypair.public.to_bytes();

    // Create test contexts
    let mut officer_context = SecurityContext {
        user_id: Uuid::new_v4(),
        classification: SecurityClassification::Unclassified,
        roles: vec![Role::Officer],
        permissions: vec![
            Permission::new(ResourceType::Transfer, Action::ApproveCommand, HashMap::new()),
        ],
        unit_code: "1-1-IN".to_string(),
        metadata: HashMap::new(),
    };

    let mut soldier_context = SecurityContext {
        user_id: Uuid::new_v4(),
        classification: SecurityClassification::Unclassified,
        roles: vec![Role::Soldier],
        permissions: vec![
            Permission::new(ResourceType::Transfer, Action::Create, HashMap::new()),
        ],
        unit_code: "1-1-IN".to_string(),
        metadata: HashMap::new(),
    };

    // Create multiple transfers and verify
    let transfer1 = create_test_transfer(&officer_context, &soldier_context);
    let transfer2 = create_test_transfer(&officer_context, &soldier_context);

    let proof1 = create_merkle_proof(&transfer1, &public_key);
    let proof2 = create_merkle_proof(&transfer2, &public_key);

    assert!(MerkleTree::verify_proof(&proof1).unwrap());
    assert!(MerkleTree::verify_proof(&proof2).unwrap());
}
