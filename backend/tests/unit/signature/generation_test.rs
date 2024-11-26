use handreceipt::types::{
    security::{SecurityContext, SecurityClassification, Role},
    permissions::Permission,
    signature::{SignatureMetadata, SignatureType, SignatureAlgorithm}
};
use ed25519_dalek::{SigningKey, Signer, Verifier};
use uuid::Uuid;

#[test]
fn test_basic_signature_generation() {
    let signer_id = 1;
    let mut context = SecurityContext::new(signer_id);
    context.classification = SecurityClassification::Unclassified;
    context.permissions = vec![Permission::ViewProperty];

    let test_data = b"test message";
    let signature = sign_test_data(test_data, &context);
    
    assert!(!signature.signature.is_empty());
    assert_eq!(signature.signer_id, Uuid::from_u64_pair(0, signer_id as u64));
}

#[test]
fn test_sensitive_signature_generation() {
    let signer_id = 1;
    let mut context = SecurityContext::new(signer_id);
    context.classification = SecurityClassification::Secret;
    context.role = Role::Officer;
    context.permissions = vec![Permission::ViewProperty];

    let test_data = b"sensitive data";
    let signature = sign_test_data(test_data, &context);
    
    assert!(!signature.signature.is_empty());
    assert_eq!(signature.classification, SecurityClassification::Secret);
}

#[test]
fn test_signature_metadata() {
    let signer_id = 1;
    let context = SecurityContext::new(signer_id);
    let test_data = b"test data";
    
    let signature = sign_test_data(test_data, &context);
    
    assert_eq!(signature.signer_id, Uuid::from_u64_pair(0, signer_id as u64));
    assert_eq!(signature.algorithm, SignatureAlgorithm::Ed25519);
    assert_ne!(signature.key_id, Uuid::nil());
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
    SignatureMetadata {
        key_id: Uuid::new_v4(),
        signer_id: Uuid::from_u64_pair(0, context.user_id as u64),
        signature: data.to_vec(),
        classification: context.classification.clone(),
        signature_type: SignatureType::User,
        algorithm: SignatureAlgorithm::Ed25519,
    }
}
