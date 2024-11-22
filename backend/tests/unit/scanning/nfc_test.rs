use uuid::Uuid;
use crate::{
    services::asset::scanning::{
        nfc::{
            communicator::NFCCommunicator,
            validator::NFCValidator,
        },
    },
    types::{
        scanning::{Scanner, ScanError, ScanType},
        security::{SecurityContext, SecurityClassification},
    },
};

#[tokio::test]
async fn test_nfc_scanning() {
    let communicator = NFCCommunicator::new("TEST-NFC-001".to_string());
    
    // Test scanning
    let data = b"test nfc data";
    let scan_result = communicator.scan(data).await.unwrap();
    
    // Verify scan result
    assert_eq!(scan_result.scan_type, ScanType::NFC);
    assert!(scan_result.metadata.get("reader_id").is_some());
    assert_eq!(scan_result.metadata.get("reader_id").unwrap().as_str(), "TEST-NFC-001");
    assert!(scan_result.metadata.get("protocol").is_some());
    assert!(scan_result.metadata.get("signal_strength").is_some());
    assert!(scan_result.metadata.get("tag_type").is_some());
}

#[tokio::test]
async fn test_nfc_validation() {
    let validator = NFCValidator::new();
    let communicator = NFCCommunicator::new("TEST-NFC-001".to_string());

    let data = b"test nfc data";
    let scan_result = communicator.scan(data).await.unwrap();

    // Test validation
    assert!(validator.verify(&scan_result).await.unwrap());
}

#[tokio::test]
async fn test_nfc_validation_failures() {
    let validator = NFCValidator::new();
    let communicator = NFCCommunicator::new("TEST-NFC-001".to_string());

    // Test with invalid protocol
    let data = b"test nfc data";
    let scan_result = communicator.scan(data).await.unwrap();
    let mut modified_result = scan_result.clone();
    modified_result.metadata["protocol"] = "INVALID_PROTOCOL".into();
    assert!(!validator.verify(&modified_result).await.unwrap());

    // Test with low signal strength
    let mut modified_result = scan_result.clone();
    modified_result.metadata["signal_strength"] = 0.5.into();
    assert!(!validator.verify(&modified_result).await.unwrap());

    // Test with invalid tag type
    let mut modified_result = scan_result.clone();
    modified_result.metadata["tag_type"] = "INVALID_TAG".into();
    assert!(!validator.verify(&modified_result).await.unwrap());
}

#[tokio::test]
async fn test_nfc_error_handling() {
    let communicator = NFCCommunicator::new("TEST-NFC-001".to_string());

    // Test with empty data
    let result = communicator.scan(&[]).await;
    assert!(matches!(result, Err(ScanError::InvalidData(_))));

    // Test with invalid data
    let result = communicator.scan(&[0xFF; 32]).await;
    assert!(matches!(result, Ok(_))); // Scanner should still produce a result, validation would fail
}

#[tokio::test]
async fn test_nfc_metadata() {
    let communicator = NFCCommunicator::new("TEST-NFC-001".to_string());
    
    let data = b"test nfc data";
    let scan_result = communicator.scan(data).await.unwrap();
    
    // Verify metadata fields
    let metadata = scan_result.metadata;
    assert!(metadata.get("reader_id").is_some());
    assert!(metadata.get("protocol").is_some());
    assert!(metadata.get("signal_strength").is_some());
    assert!(metadata.get("tag_type").is_some());
    assert!(metadata.get("uid").is_some());
    
    // Verify metadata values
    assert_eq!(metadata.get("reader_id").unwrap().as_str(), "TEST-NFC-001");
    assert_eq!(metadata.get("protocol").unwrap().as_str(), "ISO14443A");
    assert_eq!(metadata.get("tag_type").unwrap().as_str(), "MIFARE Classic");
    let signal_strength = metadata.get("signal_strength").unwrap().as_f64().unwrap();
    assert!(signal_strength > 0.0 && signal_strength <= 1.0);
}
