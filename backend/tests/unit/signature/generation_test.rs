use handreceipt::types::{
    security::{SecurityContext, SecurityClassification, Role},
    permissions::{ResourceType, Action, Permission},
    signature::{SignatureMetadata, SignatureType, SignatureAlgorithm}
};
use uuid::Uuid;
use ed25519_dalek::{SigningKey, Signer, Verifier};

#[test]
fn test_basic_signature_generation() {
    let signer_id = Uuid::new_v4();
    let mut context = SecurityContext::new(signer_id);
    context.classification = SecurityClassification::Unclassified;
    context.permissions = vec![Permission {
        resource_type: ResourceType::Property,
        action: Action::Read,
        constraints: Default::default(),
    }];

    let test_data = b"test message";
    let signature = sign_test_data(test_data, &context);
    
    assert!(!signature.signature.is_empty());
    assert_eq!(signature.signer_id, signer_id);
}

#[test]
fn test_sensitive_signature_generation() {
    let signer_id = Uuid::new_v4();
    let mut context = SecurityContext::new(signer_id);
    context.classification = SecurityClassification::Sensitive;
    context.roles = vec![Role::Officer];
    context.permissions = vec![Permission {
        resource_type: ResourceType::Property,
        action: Action::HandleSensitive,
        constraints: Default::default(),
    }];

    let test_data = b"sensitive data";
    let signature = sign_test_data(test_data, &context);
    
    assert!(!signature.signature.is_empty());
    assert_eq!(signature.classification, SecurityClassification::Sensitive);
}

#[test]
fn test_signature_metadata() {
    let signer_id = Uuid::new_v4();
    let context = SecurityContext::new(signer_id);
    let test_data = b"test data";
    
    let signature = sign_test_data(test_data, &context);
    
    assert_ne!(signature.key_id, Uuid::nil());
    assert_eq!(signature.signer_id, signer_id);
    assert_eq!(signature.algorithm, SignatureAlgorithm::Ed25519);
}

#[test]
fn test_signature_generation() {
    let data = b"test data";

    // Generate key pair
    let signing_key = SigningKey::generate(&mut rand::thread_rng());
    let verifying_key = signing_key.verifying_key();

    // Sign data
    let signature = signing_key.sign(data);

    // Verify signature
    assert!(verifying_key.verify(data, &signature).is_ok());
}

// Helper function to simulate signing
fn sign_test_data(data: &[u8], context: &SecurityContext) -> SignatureMetadata {
    SignatureMetadata::new(
        Uuid::new_v4(), // key_id
        data.to_vec(),  // signature
        context.user_id,
        context.classification.clone(),
        SignatureType::User,
        SignatureAlgorithm::Ed25519,
    )
}
