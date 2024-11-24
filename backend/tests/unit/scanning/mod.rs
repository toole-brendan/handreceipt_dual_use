mod qr_test;

pub use qr_test::*;

/// Test utilities for scanning tests
pub mod test_utils {
    use handreceipt::domain::models::qr::{QRData, QRFormat, QRResponse};
    use uuid::Uuid;
    use chrono::Utc;
    use ed25519_dalek::{SigningKey, Signer};
    use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};

    /// Creates a test QR code with current timestamp
    pub fn create_test_qr(property_id: Uuid) -> (QRResponse, SigningKey) {
        create_test_qr_with_timestamp(property_id, Utc::now())
    }

    /// Creates a test QR code with specified timestamp
    pub fn create_test_qr_with_timestamp(
        property_id: Uuid,
        timestamp: chrono::DateTime<Utc>,
    ) -> (QRResponse, SigningKey) {
        // Generate test keys
        let signing_key = SigningKey::generate(&mut rand::thread_rng());

        // Create message and sign
        let msg = format!("{}:{}", property_id, timestamp.timestamp());
        let signature = signing_key.sign(msg.as_bytes());

        // Create QR data
        let qr_data = QRData {
            property_id,
            timestamp,
            signature: BASE64.encode(signature.to_bytes()),
        };

        let qr_response = QRResponse {
            qr_code: serde_json::to_string(&qr_data).unwrap(),
            property_id,
            generated_at: timestamp,
            format: QRFormat::PNG,
        };

        (qr_response, signing_key)
    }

    /// Creates an expired test QR code
    pub fn create_expired_qr(property_id: Uuid) -> (QRResponse, SigningKey) {
        create_test_qr_with_timestamp(
            property_id,
            Utc::now() - chrono::Duration::hours(25),
        )
    }
}
