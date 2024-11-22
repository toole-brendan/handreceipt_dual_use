use uuid::Uuid;
use crate::{
    services::asset::scanning::qr::QRCodeService,
    types::{
        scanning::{Scanner, ScanError, ScanType},
        error::CoreError,
    },
};

#[tokio::test]
async fn test_qr_code_generation() {
    let service = QRCodeService::new(
        "http://localhost:3000".to_string(),
        "TEST-QR-001".to_string(),
    );
    
    let asset_id = Uuid::new_v4();
    let qr_svg = service.generate_asset_qr(asset_id).unwrap();
    
    // Verify QR code generation
    assert!(!qr_svg.is_empty());
    assert!(qr_svg.contains("svg"));
    assert!(qr_svg.contains(&asset_id.to_string()));
}

#[tokio::test]
async fn test_qr_scanning() {
    let service = QRCodeService::new(
        "http://localhost:3000".to_string(),
        "TEST-QR-001".to_string(),
    );

    // Create test QR data
    let asset_id = Uuid::new_v4();
    let url = format!("http://localhost:3000/assets/{}", asset_id);
    let data = url.as_bytes();

    // Test scanning
    let scan_result = service.scan(data).await.unwrap();
    
    // Verify scan result
    assert_eq!(scan_result.scan_type, ScanType::QR);
    assert!(scan_result.metadata.get("device_id").is_some());
    assert_eq!(scan_result.metadata.get("device_id").unwrap().as_str(), "TEST-QR-001");
    assert!(scan_result.metadata.get("asset_id").is_some());
    assert!(scan_result.metadata.get("format").is_some());
    assert_eq!(scan_result.metadata.get("format").unwrap().as_str(), "QR");
    assert!(scan_result.metadata.get("url").is_some());
}

#[tokio::test]
async fn test_qr_verification() {
    let service = QRCodeService::new(
        "http://localhost:3000".to_string(),
        "TEST-QR-001".to_string(),
    );

    // Create and verify valid QR data
    let asset_id = Uuid::new_v4();
    let url = format!("http://localhost:3000/assets/{}", asset_id);
    assert!(service.verify_qr_code(&asset_id.to_string()).is_ok());

    // Test verification with invalid data
    assert!(matches!(
        service.verify_qr_code("invalid-uuid"),
        Err(CoreError::ValidationError(_))
    ));
}

#[tokio::test]
async fn test_qr_error_handling() {
    let service = QRCodeService::new(
        "http://localhost:3000".to_string(),
        "TEST-QR-001".to_string(),
    );

    // Test with empty data
    let result = service.scan(&[]).await;
    assert!(matches!(result, Err(ScanError::InvalidData(_))));

    // Test with invalid URL data
    let invalid_data = b"not a valid url";
    let result = service.scan(invalid_data).await;
    assert!(matches!(result, Err(ScanError::InvalidData(_))));
}

#[tokio::test]
async fn test_qr_svg_generation() {
    let service = QRCodeService::new(
        "http://localhost:3000".to_string(),
        "TEST-QR-001".to_string(),
    );

    let asset_id = Uuid::new_v4();
    
    // Test SVG generation
    let svg = service.generate_svg(asset_id).unwrap();
    assert!(!svg.is_empty());
    assert!(svg.starts_with("<?xml"));
    assert!(svg.contains("svg"));
    assert!(svg.contains(&asset_id.to_string()));

    // Verify SVG contains required elements
    assert!(svg.contains("rect"));  // Should have background
    assert!(svg.contains("path"));  // Should have QR code paths
}
