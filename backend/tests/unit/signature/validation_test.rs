use ed25519_dalek::{SigningKey, Signer, Verifier};

#[test]
fn test_signature_validation() {
    let data = b"test data";

    // Generate key pair using current API
    let signing_key = SigningKey::generate(&mut rand::thread_rng());
    let verifying_key = signing_key.verifying_key();

    // Sign data
    let signature = signing_key.sign(data);

    // Verify signature
    assert!(verifying_key.verify(data, &signature).is_ok());

    // Verify with wrong data
    let wrong_data = b"wrong data";
    assert!(verifying_key.verify(wrong_data, &signature).is_err());
}
