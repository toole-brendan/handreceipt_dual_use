use handreceipt::domain::models::{
    qr::{QRCodeService, QRCodeServiceImpl, QRFormat, QRData},
    scanning::{QRScanResult, DeviceInfo, Location}
};
use handreceipt::types::security::SecurityContext;
use uuid::Uuid;
use chrono::Utc;

fn create_test_device_info() -> DeviceInfo {
    DeviceInfo {
        device_type: "TEST_DEVICE".to_string(),
        os_version: "TEST_OS".to_string(),
        app_version: "1.0.0".to_string(),
        device_id: "TEST_ID".to_string(),
    }
}

#[tokio::test]
async fn test_qr_code_generation() {
    let service = QRCodeServiceImpl::new();
    let context = SecurityContext::default();
    
    let property_id = Uuid::new_v4();
    let qr_data = QRData {
        id: Uuid::new_v4(),
        property_id,
        timestamp: Utc::now(),
        metadata: serde_json::json!({
            "test": "data"
        }),
    };
    
    // Test PNG generation
    let png_response = service.generate_qr(
        &qr_data,
        QRFormat::PNG,
        &context
    ).await.unwrap();
    
    assert!(!png_response.data.is_empty());
    assert!(matches!(png_response.format, QRFormat::PNG));
    
    // Test SVG generation
    let svg_response = service.generate_qr(
        &qr_data,
        QRFormat::SVG,
        &context
    ).await.unwrap();
    
    let svg_str = String::from_utf8_lossy(&svg_response.data);
    assert!(svg_str.contains("<svg"));
    assert!(matches!(svg_response.format, QRFormat::SVG));
}

#[test]
fn test_qr_scan_validation() {
    let property_id = Uuid::new_v4();
    let verification_code = "1234abcd";
    let data = format!("{}:{}", property_id, verification_code);
    
    let scan_result = QRScanResult::new(
        data,
        create_test_device_info(),
        None,
    );
    
    assert!(scan_result.validate());
    assert_eq!(scan_result.property_id().unwrap(), property_id);
    assert_eq!(scan_result.verification_code().unwrap(), verification_code);
}

#[test]
fn test_qr_with_location() {
    let location = Location {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: Some(10.0),
        building: Some("HQ".to_string()),
        room: Some("Room 101".to_string()),
        timestamp: Utc::now(),
    };
    
    let scan_result = QRScanResult::new(
        format!("{}:{}", Uuid::new_v4(), "1234abcd"),
        create_test_device_info(),
        Some(location.clone()),
    );
    
    assert!(scan_result.validate());
    assert_eq!(scan_result.location.as_ref().unwrap().building, Some("HQ".to_string()));
    assert_eq!(scan_result.location.as_ref().unwrap().room, Some("Room 101".to_string()));
}

#[test]
fn test_invalid_qr_data() {
    let scan_result = QRScanResult::new(
        "invalid-data".to_string(),
        create_test_device_info(),
        None,
    );

    assert!(!scan_result.validate());
    assert!(scan_result.property_id().is_none());
    assert!(scan_result.verification_code().is_none());
}
