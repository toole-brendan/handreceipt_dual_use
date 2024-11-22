use std::sync::Arc;
use uuid::Uuid;
use chrono::Utc;

use crate::{
    services::{
        asset::scanning::{
            rfid::RFIDWriter,
            qr::QRCodeService,
            nfc::communicator::NFCCommunicator,
            common::signature::SignatureVerifier,
        },
    },
    types::{
        scanning::{Scanner, ScanResult, ScanType, ScanVerifier},
        security::{SecurityContext, SecurityClassification},
        permissions::{Permission, ResourceType, Action},
        signature::{SignatureType, CommandSignature},
    },
};

async fn setup_test_environment() -> (
    Arc<SignatureVerifier>,
    Arc<RFIDWriter>,
    Arc<QRCodeService>,
    Arc<NFCCommunicator>,
    SecurityContext,
) {
    let signature_verifier = Arc::new(SignatureVerifier::new(
        crate::services::core::security::EncryptionService::new(),
    ));

    let rfid_writer = Arc::new(RFIDWriter::new("TEST-RFID-001".to_string()));
    let qr_service = Arc::new(QRCodeService::new(
        "http://localhost:3000".to_string(),
        "TEST-QR-001".to_string(),
    ));
    let nfc_communicator = Arc::new(NFCCommunicator::new("TEST-NFC-001".to_string()));

    let security_context = SecurityContext::new(
        SecurityClassification::Confidential,
        Uuid::new_v4(),
        "test-token".to_string(),
        vec![
            Permission::new(ResourceType::Scanner, Action::Scan),
            Permission::new(ResourceType::Scanner, Action::Verify),
        ],
    );

    (signature_verifier, rfid_writer, qr_service, nfc_communicator, security_context)
}

#[tokio::test]
async fn test_complete_scan_to_signature_flow() {
    let (signature_verifier, rfid_writer, _, _, _) = setup_test_environment().await;

    // 1. Initialize scanner
    let mut writer = rfid_writer.clone();
    writer.initialize().await.unwrap();

    // 2. Perform scan
    let data = b"test rfid data";
    let scan_result = writer.scan(data).await.unwrap();
    assert_eq!(scan_result.scan_type, ScanType::RFID);

    // 3. Sign the scan
    let signed_result = signature_verifier.sign_scan_result(&scan_result).await.unwrap();
    assert!(signed_result.signature.len() > 0);

    // 4. Verify signature
    let signature_valid = signature_verifier.verify_signature(&signed_result).await.unwrap();
    assert!(signature_valid);
}

#[tokio::test]
async fn test_multi_scanner_signature_verification() {
    let (signature_verifier, rfid_writer, qr_service, _, _) = setup_test_environment().await;

    // Test different scanner types
    let test_cases = vec![
        (rfid_writer.clone() as Arc<dyn Scanner>, ScanType::RFID, b"test rfid data".to_vec()),
        (qr_service.clone() as Arc<dyn Scanner>, ScanType::QR, b"http://localhost:3000/assets/123".to_vec()),
    ];

    for (scanner, scan_type, test_data) in test_cases {
        // Perform scan
        let scan_result = scanner.scan(&test_data).await.unwrap();
        assert_eq!(scan_result.scan_type, scan_type);

        // Sign and verify
        let signed_result = signature_verifier.sign_scan_result(&scan_result).await.unwrap();
        let is_valid = signature_verifier.verify_signature(&signed_result).await.unwrap();
        assert!(is_valid);
    }
}

#[tokio::test]
async fn test_signature_validation_with_nfc() {
    let (signature_verifier, _, _, nfc_communicator, _) = setup_test_environment().await;

    // Perform NFC scan
    let data = b"test nfc data";
    let scan_result = nfc_communicator.scan(data).await.unwrap();
    assert_eq!(scan_result.scan_type, ScanType::NFC);

    // Verify NFC-specific metadata
    assert!(scan_result.metadata.get("protocol").is_some());
    assert!(scan_result.metadata.get("signal_strength").is_some());
    assert!(scan_result.metadata.get("tag_type").is_some());

    // Sign and verify
    let signed_result = signature_verifier.sign_scan_result(&scan_result).await.unwrap();
    let verification_result = signature_verifier.verify_signature(&signed_result).await.unwrap();
    assert!(verification_result);
}

#[tokio::test]
async fn test_signature_validation_failures() {
    let (signature_verifier, rfid_writer, _, _, _) = setup_test_environment().await;

    // Initialize and perform scan
    let mut writer = rfid_writer.clone();
    writer.initialize().await.unwrap();

    let data = b"test rfid data";
    let scan_result = writer.scan(data).await.unwrap();

    // Sign the scan
    let mut signed_result = signature_verifier.sign_scan_result(&scan_result).await.unwrap();

    // Test with tampered data
    signed_result.result.data = b"tampered data".to_vec();
    let verification_result = signature_verifier.verify_signature(&signed_result).await.unwrap();
    assert!(!verification_result);

    // Test with invalid signature
    let mut invalid_signed_result = signed_result.clone();
    invalid_signed_result.signature = vec![0; 64]; // Invalid signature bytes
    let verification_result = signature_verifier.verify_signature(&invalid_signed_result).await.unwrap();
    assert!(!verification_result);
}
