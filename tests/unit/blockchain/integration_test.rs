// tests/blockchain_test.rs

use military_asset_tracking::{
    core::{
        SecurityContext,
        SecurityClassification,
        Permission,
        ResourceType,
        Action,
        Transaction,
        CoreError,
    },
    services::{
        blockchain::{MilitaryBlockchain, PropertyMetadata},
        security::{SecurityModule, SecurityError},
        network::{NetworkService, NetworkConfig},
    },
};
use std::sync::Arc;
use uuid::Uuid;
use tokio::time::{sleep, Duration};
use serde_json::json;

// Define a concrete error type for tests
#[derive(Debug)]
enum TestError {
    Core(CoreError),
    Security(SecurityError),
    Other(String),
}

impl std::error::Error for TestError {}

impl std::fmt::Display for TestError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TestError::Core(e) => write!(f, "Core error: {}", e),
            TestError::Security(e) => write!(f, "Security error: {}", e),
            TestError::Other(e) => write!(f, "Other error: {}", e),
        }
    }
}

impl From<CoreError> for TestError {
    fn from(err: CoreError) -> Self {
        TestError::Core(err)
    }
}

impl From<SecurityError> for TestError {
    fn from(err: SecurityError) -> Self {
        TestError::Security(err)
    }
}

impl<E: std::error::Error + Send + Sync + 'static> From<Box<E>> for TestError {
    fn from(err: Box<E>) -> Self {
        TestError::Other(err.to_string())
    }
}

type TestResult = Result<(), TestError>;

#[tokio::test]
async fn test_nft_property_lifecycle() -> TestResult {
    // Setup test environment
    let security = Arc::new(SecurityModule::new());
    
    // Initialize security module and generate signing key
    let user_id = Uuid::new_v4();
    security.generate_signing_key(user_id).await?;

    let network = Arc::new(NetworkService::new(
        security.clone(),
        NetworkConfig {
            request_timeout: 30,
            retry_attempts: 3,
            retry_delay_ms: 1000,
            max_concurrent_requests: 10,
        }
    ));

    let blockchain = Arc::new(MilitaryBlockchain::new(
        security.clone(),
        network.clone(),
    ));

    // Create security context with proper permissions
    let security_context = SecurityContext {
        user_id,
        classification: SecurityClassification::Unclassified,
        token: "test_token".to_string(),
        permissions: vec![Permission {
            resource_type: ResourceType::Asset,
            actions: vec![Action::Create, Action::Read, Action::Update],
            constraints: vec![],
        }],
    };

    // Wait for blockchain to initialize
    sleep(Duration::from_millis(100)).await;

    // Create and sign transaction with proper signature
    let token_data = json!({
        "name": "Test Asset",
        "description": "Test Description",
        "serial_number": "TEST-123",
        "classification": "UNCLASSIFIED",
        "status": "active"
    });

    let data_bytes = token_data.to_string().as_bytes().to_vec();
    let signature = security.sign_data(security_context.user_id, &data_bytes).await?;

    let transaction = Transaction {
        id: Uuid::new_v4(),
        timestamp: chrono::Utc::now(),
        data: token_data.to_string(),
        signature,  // Use the actual signature
        classification: security_context.classification.clone(),
    };

    // Add transaction to blockchain
    blockchain.add_transaction(transaction, &security_context)
        .await
        .map_err(|e| TestError::Other(e.to_string()))?;

    // Test minting NFT with proper metadata
    let token = blockchain.mint_property_token(
        Uuid::new_v4(),
        security_context.user_id.to_string(),
        PropertyMetadata {
            name: "Test Asset".to_string(),
            description: "Test Description".to_string(),
            serial_number: "TEST-123".to_string(),
            classification: SecurityClassification::Unclassified,
            status: "active".to_string(),
        },
        "qr_hash".to_string(),
        &security_context,
    )
    .await
    .map_err(|e| TestError::Other(e.to_string()))?;

    // Verify token was created correctly
    assert!(token.token_id != Uuid::nil());
    assert_eq!(token.owner, security_context.user_id.to_string());

    // Test property transfer with signed data
    let transfer = blockchain.transfer_property_token(
        token.token_id,
        security_context.user_id.to_string(),
        "new_owner".to_string(),
        "hand_receipt_hash".to_string(),
        &security_context,
    )
    .await
    .map_err(|e| TestError::Other(e.to_string()))?;

    // Verify transfer record
    assert_eq!(transfer.from, security_context.user_id.to_string());
    assert_eq!(transfer.to, "new_owner");
    assert_eq!(transfer.hand_receipt_hash, "hand_receipt_hash");

    Ok(())
}

#[tokio::test]
async fn test_blockchain_consensus() -> TestResult {
    // Setup test environment
    let security = Arc::new(SecurityModule::new());
    
    // Initialize security module and generate signing key
    let user_id = Uuid::new_v4();
    security.generate_signing_key(user_id).await?;

    let network = Arc::new(NetworkService::new(
        security.clone(),
        NetworkConfig {
            request_timeout: 30,
            retry_attempts: 3,
            retry_delay_ms: 1000,
            max_concurrent_requests: 10,
        }
    ));

    let blockchain = Arc::new(MilitaryBlockchain::new(
        security.clone(),
        network.clone(),
    ));

    let security_context = SecurityContext {
        user_id,
        classification: SecurityClassification::Unclassified,
        token: "test_token".to_string(),
        permissions: vec![Permission {
            resource_type: ResourceType::Asset,
            actions: vec![Action::Create, Action::Read, Action::Update],
            constraints: vec![],
        }],
    };

    // Wait for blockchain to initialize
    sleep(Duration::from_millis(100)).await;

    // Create multiple transactions with proper signatures
    for i in 0..3 {
        let token_data = json!({
            "name": format!("Test Asset {}", i),
            "description": "Test Description",
            "serial_number": format!("TEST-{}", i),
            "classification": "UNCLASSIFIED",
            "status": "active"
        });

        let data_bytes = token_data.to_string().as_bytes().to_vec();
        let signature = security.sign_data(security_context.user_id, &data_bytes).await?;

        let transaction = Transaction {
            id: Uuid::new_v4(),
            timestamp: chrono::Utc::now(),
            data: token_data.to_string(),
            signature,  // Use the actual signature
            classification: security_context.classification.clone(),
        };

        // Add transaction to blockchain
        blockchain.add_transaction(transaction, &security_context)
            .await
            .map_err(|e| TestError::Other(e.to_string()))?;

        // Create and verify token
        let token = blockchain.mint_property_token(
            Uuid::new_v4(),
            format!("owner{}", i),
            PropertyMetadata {
                name: format!("Test Asset {}", i),
                description: "Test Description".to_string(),
                serial_number: format!("TEST-{}", i),
                classification: SecurityClassification::Unclassified,
                status: "active".to_string(),
            },
            format!("qr_hash_{}", i),
            &security_context,
        )
        .await
        .map_err(|e| TestError::Other(e.to_string()))?;

        // Verify token exists
        let exists = blockchain.verify_property_token(
            token.token_id,
            &format!("qr_hash_{}", i),
            &security_context,
        )
        .await
        .map_err(|e| TestError::Other(e.to_string()))?;

        assert!(exists);
    }

    // Mine a block
    let block = blockchain.mine_block(&security_context)
        .await
        .map_err(|e| TestError::Other(e.to_string()))?;
    assert!(!block.transactions.is_empty());

    // Verify block count
    let block_count = blockchain.get_block_count()
        .await
        .map_err(|e| TestError::Other(e.to_string()))?;
    assert!(block_count > 0);

    Ok(())
} 