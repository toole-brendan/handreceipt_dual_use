use uuid::Uuid;
use crate::{
    services::asset::scanning::{
        barcode::{
            scanner::BarcodeScanner,
            validator::BarcodeValidator,
        },
    },
    types::{
        scanning::{Scanner, ScanError, ScanType},
        security::{SecurityContext, SecurityClassification},
    },
};

#[tokio::test]
async fn test_barcode_scanner_lifecycle() {
    let scanner = BarcodeScanner::new("TEST-DEVICE-001".to_string());
    
    // Test scanning without initialization
    let data = b"test barcode data";
    let result = scanner.scan(data).await;
    assert!(matches!(result, Err(ScanError::DeviceError(_))));
}

#[tokio::test]
async fn test_barcode_scanning() {
    let scanner = BarcodeScanner::new("TEST-DEVICE-001".to_string());
    
    // Test scanning
    let data = b"test barcode data";
    let scan_result = scanner.scan(data).await.unwrap();
    
    // Verify scan result
    assert_eq!(scan_result.scan_type, ScanType::Barcode);
    assert!(scan_result.metadata.get("device_id").is_some());
    assert_eq!(scan_result.metadata.get("device_id").unwrap().as_str(), "TEST-DEVICE-001");
    assert!(scan_result.metadata.get("format").is_some());
    assert!(scan_result.metadata.get("quality_score").is_some());
}

#[tokio::test]
async fn test_barcode_validation() {
    let validator = BarcodeValidator::new();
    let scanner = BarcodeScanner::new("TEST-DEVICE-001".to_string());

    let data = b"test barcode data";
    let scan_result = scanner.scan(data).await.unwrap();

    // Test validation
    assert!(validator.verify(&scan_result).await.unwrap());
}

#[tokio::test]
async fn test_barcode_validation_failures() {
    let validator = BarcodeValidator::new();
    let scanner = BarcodeScanner::new("TEST-DEVICE-001".to_string());

    // Test with invalid format
    let data = b"invalid data";
    let scan_result = scanner.scan(data).await.unwrap();
    let mut modified_result = scan_result.clone();
    modified_result.metadata["format"] = "INVALID_FORMAT".into();
    assert!(!validator.verify(&modified_result).await.unwrap());

    // Test with low quality score
    let mut modified_result = scan_result.clone();
    modified_result.metadata["quality_score"] = 0.5.into();
    assert!(!validator.verify(&modified_result).await.unwrap());
}

#[tokio::test]
async fn test_barcode_error_handling() {
    let scanner = BarcodeScanner::new("TEST-DEVICE-001".to_string());

    // Test with empty data
    let result = scanner.scan(&[]).await;
    assert!(matches!(result, Err(ScanError::InvalidData(_))));

    // Test with invalid data
    let result = scanner.scan(&[0xFF; 32]).await;
    assert!(matches!(result, Ok(_))); // Scanner should still produce a result, validation would fail
}

#[tokio::test]
async fn test_barcode_metadata() {
    let scanner = BarcodeScanner::new("TEST-DEVICE-001".to_string());
    
    let data = b"test barcode data";
    let scan_result = scanner.scan(data).await.unwrap();
    
    // Verify metadata fields
    let metadata = scan_result.metadata;
    assert!(metadata.get("device_id").is_some());
    assert!(metadata.get("format").is_some());
    assert!(metadata.get("quality_score").is_some());
    
    // Verify metadata values
    assert_eq!(metadata.get("device_id").unwrap().as_str(), "TEST-DEVICE-001");
    assert_eq!(metadata.get("format").unwrap().as_str(), "CODE128");
    let quality_score = metadata.get("quality_score").unwrap().as_f64().unwrap();
    assert!(quality_score > 0.0 && quality_score <= 1.0);
}
