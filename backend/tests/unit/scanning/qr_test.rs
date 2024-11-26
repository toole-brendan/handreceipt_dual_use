use handreceipt::{
    types::{
        scanning::{QRScanResult, DeviceInfo},
        security::{SecurityContext, SecurityClassification},
    },
    domain::models::{
        qr::{QRData, QRCodeService, QRCodeServiceImpl, QRFormat},
        Location,
    },
};
use ed25519_dalek::SigningKey;
use chrono::Utc;
use serde_json::json;

#[tokio::test]
async fn test_qr_code_generation() {
    // Generate a test signing key
    let signing_key = SigningKey::generate(&mut rand::thread_rng());
    let service = QRCodeServiceImpl::new(signing_key);

    let property_id = 1;  // Using i32 instead of UUID
    let custodian_id = "test_custodian".to_string();  // Using String instead of UUID

    let qr_data = QRData::new(
        property_id,
        custodian_id,
        json!({"test": "metadata"}),  // Adding required metadata
    );

    let context = SecurityContext::new(1);
    let qr_code = service.generate_qr(&qr_data, QRFormat::PNG, &context).await.unwrap();
    assert!(!qr_code.data.is_empty());
}
