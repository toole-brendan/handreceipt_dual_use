use uuid::Uuid;
use chrono::Utc;
use ed25519_dalek::{SigningKey, VerifyingKey};
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};

use crate::{
    domain::models::qr::{
        QRCodeService,
        QRCodeServiceImpl,
        QRFormat,
        QRData,
        VerifyQRRequest,
    },
    types::security::SecurityContext,
    error::CoreError,
};

fn create_test_service() -> (QRCodeServiceImpl, SigningKey) {
    let signing_key = SigningKey::generate(&mut rand::thread_rng());
    let service = QRCodeServiceImpl::new(signing_key.clone());
    (service, signing_key)
}

#[tokio::test]
async fn test_qr_code_generation() {
    let (service, _) = create_test_service();
    let context = SecurityContext::default();
    
    let property_id = Uuid::new_v4();
    
    // Test PNG generation
    let png_response = service.generate_qr(
        property_id,
        QRFormat::PNG,
        &context
    ).await.unwrap();
    
    assert_eq!(png_response.property_id, property_id);
    assert!(png_response.qr_code.len() > 0);
    assert!(matches!(png_response.format, QRFormat::PNG));
    
    // Test SVG generation
    let svg_response = service.generate_qr(
        property_id,
        QRFormat::SVG,
        &context
    ).await.unwrap();
    
    assert_eq!(svg_response.property_id, property_id);
    assert!(svg_response.qr_code.contains("svg"));
    assert!(matches!(svg_response.format, QRFormat::SVG));
}

#[tokio::test]
async fn test_qr_validation() {
    let (service, _) = create_test_service();
    let context = SecurityContext::default();
    
    // Generate valid QR code
    let property_id = Uuid::new_v4();
    let qr_response = service.generate_qr(
        property_id,
        QRFormat::PNG,
        &context
    ).await.unwrap();
    
    // Validate QR code
    let verify_request = VerifyQRRequest {
        qr_data: qr_response.qr_code,
        scanned_at: Utc::now(),
        scanner_id: "TEST_SCANNER".to_string(),
        location: None,
    };
    
    let validated = service.validate_qr(verify_request, &context).await.unwrap();
    assert_eq!(validated.property_id, property_id);
}

#[tokio::test]
async fn test_expired_qr_code() {
    let (service, signing_key) = create_test_service();
    let context = SecurityContext::default();
    
    let property_id = Uuid::new_v4();
    let timestamp = Utc::now() - chrono::Duration::hours(25); // Expired
    
    // Create signed but expired QR data
    let msg = format!("{}:{}", property_id, timestamp.timestamp());
    let signature = signing_key.sign(msg.as_bytes());
    
    let qr_data = QRData {
        property_id,
        timestamp,
        signature: BASE64.encode(signature.to_bytes()),
    };
    
    let verify_request = VerifyQRRequest {
        qr_data: serde_json::to_string(&qr_data).unwrap(),
        scanned_at: Utc::now(),
        scanner_id: "TEST_SCANNER".to_string(),
        location: None,
    };
    
    let result = service.validate_qr(verify_request, &context).await;
    assert!(matches!(result, Err(CoreError::Security(_))));
}

#[tokio::test]
async fn test_invalid_signature() {
    let (service, _) = create_test_service();
    let context = SecurityContext::default();
    
    // Create QR data with invalid signature
    let qr_data = QRData {
        property_id: Uuid::new_v4(),
        timestamp: Utc::now(),
        signature: "invalid_signature".to_string(),
    };
    
    let verify_request = VerifyQRRequest {
        qr_data: serde_json::to_string(&qr_data).unwrap(),
        scanned_at: Utc::now(),
        scanner_id: "TEST_SCANNER".to_string(),
        location: None,
    };
    
    let result = service.validate_qr(verify_request, &context).await;
    assert!(matches!(result, Err(CoreError::Security(_))));
}

#[tokio::test]
async fn test_qr_format_handling() {
    let (service, _) = create_test_service();
    let context = SecurityContext::default();
    let property_id = Uuid::new_v4();
    
    // Test PNG format
    let png_result = service.generate_qr(
        property_id,
        QRFormat::PNG,
        &context
    ).await.unwrap();
    
    assert!(matches!(png_result.format, QRFormat::PNG));
    assert!(!png_result.qr_code.contains("svg"));
    
    // Test SVG format
    let svg_result = service.generate_qr(
        property_id,
        QRFormat::SVG,
        &context
    ).await.unwrap();
    
    assert!(matches!(svg_result.format, QRFormat::SVG));
    assert!(svg_result.qr_code.contains("svg"));
}

#[tokio::test]
async fn test_qr_data_serialization() {
    let property_id = Uuid::new_v4();
    let timestamp = Utc::now();
    let signature = "test_signature".to_string();
    
    let qr_data = QRData {
        property_id,
        timestamp,
        signature,
    };
    
    // Test serialization
    let serialized = serde_json::to_string(&qr_data).unwrap();
    assert!(serialized.contains(&property_id.to_string()));
    
    // Test deserialization
    let deserialized: QRData = serde_json::from_str(&serialized).unwrap();
    assert_eq!(deserialized.property_id, property_id);
    assert_eq!(deserialized.timestamp, timestamp);
    assert_eq!(deserialized.signature, "test_signature");
}
