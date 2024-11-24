use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use qrcode::{QrCode, render::svg};
use crate::error::CoreError;

/// QR code format options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QRFormat {
    SVG,
    PNG,
}

impl Default for QRFormat {
    fn default() -> Self {
        QRFormat::PNG
    }
}

/// QR code data structure
#[derive(Debug, Serialize, Deserialize)]
pub struct QRData {
    pub property_id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub signature: String,  // Ed25519 signature of property_id + timestamp
}

/// QR code response
#[derive(Debug, Serialize, Deserialize)]
pub struct QRResponse {
    pub qr_code: String,    // Base64 encoded QR code image
    pub property_id: Uuid,
    pub generated_at: DateTime<Utc>,
    pub format: QRFormat,
}

/// QR code verification request
#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyQRRequest {
    pub qr_data: String,    // Scanned QR code data
    pub scanned_at: DateTime<Utc>,
    pub scanner_id: String, // Device/user that scanned the code
    pub location: Option<Location>,
}

/// QR code service for generating and validating QR codes
#[async_trait::async_trait]
pub trait QRCodeService: Send + Sync {
    /// Generates a new QR code for a property
    async fn generate_qr(
        &self,
        property_id: Uuid,
        format: QRFormat,
        context: &SecurityContext,
    ) -> Result<QRResponse, CoreError>;

    /// Validates a scanned QR code
    async fn validate_qr(
        &self,
        request: VerifyQRRequest,
        context: &SecurityContext,
    ) -> Result<QRData, CoreError>;
}

/// Implementation of QR code service
pub struct QRCodeServiceImpl {
    signing_key: ed25519_dalek::SigningKey,
}

impl QRCodeServiceImpl {
    pub fn new(signing_key: ed25519_dalek::SigningKey) -> Self {
        Self { signing_key }
    }

    /// Creates a signed QR data payload
    fn create_qr_payload(&self, property_id: Uuid) -> Result<QRData, CoreError> {
        let timestamp = Utc::now();
        
        // Create message to sign (property_id + timestamp)
        let msg = format!("{}:{}", property_id, timestamp.timestamp());
        
        // Sign the message
        let signature = self.signing_key.sign(msg.as_bytes());
        
        Ok(QRData {
            property_id,
            timestamp,
            signature: BASE64.encode(signature.to_bytes()),
        })
    }

    /// Generates QR code in specified format
    fn generate_qr_image(&self, data: &QRData, format: QRFormat) -> Result<String, CoreError> {
        // Serialize QR data to JSON
        let qr_json = serde_json::to_string(data)
            .map_err(|e| CoreError::Internal(format!("Failed to serialize QR data: {}", e)))?;
            
        // Create QR code
        let code = QrCode::new(qr_json.as_bytes())
            .map_err(|e| CoreError::Internal(format!("Failed to generate QR code: {}", e)))?;
            
        // Render in requested format
        match format {
            QRFormat::SVG => {
                let svg = code.render()
                    .min_dimensions(200, 200)
                    .dark_color(svg::Color("#000000"))
                    .light_color(svg::Color("#ffffff"))
                    .build();
                Ok(svg)
            },
            QRFormat::PNG => {
                let png = code.render::<image::Luma<u8>>()
                    .min_dimensions(200, 200)
                    .build();
                    
                let mut png_data = Vec::new();
                image::DynamicImage::ImageLuma8(png)
                    .write_to(&mut png_data, image::ImageFormat::Png)
                    .map_err(|e| CoreError::Internal(format!("Failed to encode PNG: {}", e)))?;
                    
                Ok(BASE64.encode(png_data))
            }
        }
    }
}

#[async_trait::async_trait]
impl QRCodeService for QRCodeServiceImpl {
    async fn generate_qr(
        &self,
        property_id: Uuid,
        format: QRFormat,
        _context: &SecurityContext,
    ) -> Result<QRResponse, CoreError> {
        // Create signed QR data
        let qr_data = self.create_qr_payload(property_id)?;
        
        // Generate QR code image
        let qr_code = self.generate_qr_image(&qr_data, format.clone())?;
        
        Ok(QRResponse {
            qr_code,
            property_id,
            generated_at: qr_data.timestamp,
            format,
        })
    }

    async fn validate_qr(
        &self,
        request: VerifyQRRequest,
        _context: &SecurityContext,
    ) -> Result<QRData, CoreError> {
        // Parse QR data
        let qr_data: QRData = serde_json::from_str(&request.qr_data)
            .map_err(|e| CoreError::Validation(format!("Invalid QR code data: {}", e)))?;
            
        // Verify signature
        let signature_bytes = BASE64.decode(qr_data.signature.as_bytes())
            .map_err(|e| CoreError::Validation(format!("Invalid signature encoding: {}", e)))?;
            
        let msg = format!("{}:{}", qr_data.property_id, qr_data.timestamp.timestamp());
        
        let signature = ed25519_dalek::Signature::from_bytes(&signature_bytes);
        self.signing_key.verify_strict(msg.as_bytes(), &signature)
            .map_err(|_| CoreError::Security("Invalid QR code signature".into()))?;
            
        // Check if QR code has expired (24 hours)
        let age = Utc::now() - qr_data.timestamp;
        if age.num_hours() > 24 {
            return Err(CoreError::Security("QR code has expired".into()));
        }
        
        Ok(qr_data)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::SigningKey;
    use rand::rngs::OsRng;

    fn create_test_service() -> QRCodeServiceImpl {
        let signing_key = SigningKey::generate(&mut OsRng);
        QRCodeServiceImpl::new(signing_key)
    }

    #[tokio::test]
    async fn test_qr_generation_and_validation() {
        let service = create_test_service();
        let property_id = Uuid::new_v4();
        let context = SecurityContext::default(); // Mock context for testing

        // Generate QR code
        let qr_response = service.generate_qr(
            property_id,
            QRFormat::PNG,
            &context,
        ).await.unwrap();

        assert_eq!(qr_response.property_id, property_id);

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
        let service = create_test_service();
        let property_id = Uuid::new_v4();
        let context = SecurityContext::default();

        // Generate QR code
        let mut qr_data = service.create_qr_payload(property_id).unwrap();
        
        // Set timestamp to 25 hours ago
        qr_data.timestamp = Utc::now() - chrono::Duration::hours(25);
        
        let verify_request = VerifyQRRequest {
            qr_data: serde_json::to_string(&qr_data).unwrap(),
            scanned_at: Utc::now(),
            scanner_id: "TEST_SCANNER".to_string(),
            location: None,
        };

        let result = service.validate_qr(verify_request, &context).await;
        assert!(matches!(result, Err(CoreError::Security(_))));
    }
}
