use crate::error::CoreError;
use crate::types::security::SecurityContext;
use ed25519_dalek::{Signature, SigningKey, Verifier, VerifyingKey, Signer};
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use async_trait::async_trait;
use qrcode::render::{svg, unicode};
use image::{DynamicImage, ImageBuffer, Rgb};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QRFormat {
    PNG,
    SVG,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QRResponse {
    pub format: QRFormat,
    pub data: Vec<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyQRRequest {
    pub qr_data: String,
    pub signature: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub scanner_id: String,
    pub location: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QRData {
    pub id: Uuid,
    pub property_id: i32,
    pub metadata: serde_json::Value,
    pub timestamp: DateTime<Utc>,
    pub custodian_id: String,
    pub signature: String,
    pub public_key: String,
}

impl fmt::Display for QRData {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", serde_json::to_string(self).unwrap_or_default())
    }
}

impl QRData {
    pub fn new(
        property_id: i32,
        custodian_id: String,
        metadata: serde_json::Value,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            property_id,
            metadata,
            timestamp: Utc::now(),
            custodian_id,
            signature: String::new(),
            public_key: String::new(),
        }
    }

    pub fn with_signature(mut self, signature: String, public_key: String) -> Self {
        self.signature = signature;
        self.public_key = public_key;
        self
    }
}

#[async_trait]
pub trait QRCodeService: Send + Sync {
    /// Generates a QR code for a property
    async fn generate_qr(
        &self,
        data: &QRData,
        format: QRFormat,
        context: &SecurityContext,
    ) -> Result<QRResponse, CoreError>;

    /// Verifies a QR code
    async fn validate_qr(
        &self,
        request: VerifyQRRequest,
        context: &SecurityContext,
    ) -> Result<QRData, CoreError>;
}

pub struct QRCodeServiceImpl {
    signing_key: SigningKey,
}

impl QRCodeServiceImpl {
    pub fn new(signing_key: SigningKey) -> Self {
        Self { signing_key }
    }

    async fn verify_signature(
        &self,
        data: &QRData,
        context: &SecurityContext,
    ) -> Result<bool, CoreError> {
        // Extract the signature and message from QR data
        let signature_bytes = base64::decode(&data.signature)
            .map_err(|e| CoreError::Validation(format!("Invalid signature format: {}", e)))?;
        
        let message = format!("{}{}{}", 
            data.property_id, 
            data.timestamp.to_rfc3339(),
            data.custodian_id
        );

        // Get the verifying key for the custodian
        let verifying_key_bytes = base64::decode(&data.public_key)
            .map_err(|e| CoreError::Validation(format!("Invalid public key format: {}", e)))?;
        
        let verifying_key = VerifyingKey::from_bytes(&verifying_key_bytes.try_into().map_err(|_| {
            CoreError::Validation("Invalid public key length".to_string())
        })?)
        .map_err(|e| CoreError::Validation(format!("Invalid public key: {}", e)))?;

        // Create signature object
        let signature = Signature::try_from(&signature_bytes[..])
            .map_err(|e| CoreError::Validation(format!("Invalid signature: {}", e)))?;

        // Verify the signature
        verifying_key
            .verify(message.as_bytes(), &signature)
            .map_err(|e| CoreError::Validation(format!("Signature verification failed: {}", e)))?;

        // Verify the custodian has permission to transfer this property
        if !context.can_access_property(data.property_id) {
            return Err(CoreError::Authorization("Unauthorized to transfer this property".to_string()));
        }

        Ok(true)
    }

    async fn verify_timestamp(
        &self,
        timestamp: DateTime<Utc>,
        scan_time: DateTime<Utc>,
    ) -> Result<bool, CoreError> {
        let age = scan_time - timestamp;
        if age.num_hours() > 24 {
            return Err(CoreError::Validation("QR code has expired".into()));
        }
        Ok(true)
    }
}

#[async_trait]
impl QRCodeService for QRCodeServiceImpl {
    async fn generate_qr(
        &self,
        data: &QRData,
        format: QRFormat,
        _context: &SecurityContext,
    ) -> Result<QRResponse, CoreError> {
        // Create the message to sign
        let message = format!("{}{}{}", 
            data.property_id, 
            data.timestamp.to_rfc3339(),
            data.custodian_id
        );

        // Sign the message
        let signature = self.signing_key.sign(message.as_bytes());
        
        // Get the public key
        let verifying_key = self.signing_key.verifying_key();

        let mut qr_data = data.clone();
        qr_data.signature = base64::encode(signature.to_bytes());
        qr_data.public_key = base64::encode(verifying_key.to_bytes());

        // Serialize data to JSON
        let data_str = serde_json::to_string(&qr_data)
            .map_err(|e| CoreError::Validation(format!("Failed to serialize QR data: {}", e)))?;

        // Generate QR code in requested format
        match format {
            QRFormat::PNG => {
                let code = qrcode::QrCode::new(data_str.as_bytes())
                    .map_err(|e| CoreError::QRCode(e.to_string()))?;
                
                let renderer = code.render::<unicode::Dense1x2>();
                let image = renderer.build();
                
                let mut buffer = Vec::new();
                image::DynamicImage::ImageRgb8(ImageBuffer::from_fn(
                    image.len() as u32,
                    image.len() as u32,
                    |x, y| {
                        if image.chars().nth((y as usize * image.len()) + x as usize)
                            .map(|c| c != ' ')
                            .unwrap_or(false)
                        {
                            Rgb([0, 0, 0])
                        } else {
                            Rgb([255, 255, 255])
                        }
                    }
                ))
                .write_to(&mut std::io::Cursor::new(&mut buffer), image::ImageFormat::Png)
                .map_err(|e| CoreError::Image(e.to_string()))?;
                
                Ok(QRResponse {
                    format: QRFormat::PNG,
                    data: buffer,
                })
            }
            QRFormat::SVG => {
                let code = qrcode::QrCode::new(data_str.as_bytes())
                    .map_err(|e| CoreError::QRCode(e.to_string()))?;
                
                let svg_string = code.render()
                    .min_dimensions(200, 200)
                    .dark_color(svg::Color("#000000"))
                    .light_color(svg::Color("#ffffff"))
                    .build()
                    .to_string();
                
                Ok(QRResponse {
                    format: QRFormat::SVG,
                    data: svg_string.into_bytes(),
                })
            }
        }
    }

    async fn validate_qr(
        &self,
        request: VerifyQRRequest,
        context: &SecurityContext,
    ) -> Result<QRData, CoreError> {
        // Parse QR data
        let data: QRData = serde_json::from_str(&request.qr_data)
            .map_err(|e| CoreError::Validation(format!("Invalid QR data: {}", e)))?;

        // Verify signature if provided
        if let Some(_) = &request.signature {
            if !self.verify_signature(&data, context).await? {
                return Err(CoreError::Validation("Invalid signature".into()));
            }
        }

        // Verify timestamp
        if !self.verify_timestamp(data.timestamp, request.timestamp).await? {
            return Err(CoreError::Validation("QR code has expired".into()));
        }

        Ok(data)
    }
}
