use qrcode::QrCode;
use qrcode::render::svg;
use image::{Luma, ImageBuffer};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::io::Cursor;
use async_trait::async_trait;

use crate::{
    error::CoreError,
    types::security::SecurityContext,
};

#[cfg(test)]
use ed25519_dalek::SigningKey;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QRFormat {
    PNG,
    SVG,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QRData {
    pub id: Uuid,
    pub property_id: Uuid,
    pub metadata: serde_json::Value,
    pub timestamp: DateTime<Utc>,
}

impl QRData {
    pub fn new(property_id: Uuid) -> Self {
        Self {
            id: Uuid::new_v4(),
            property_id,
            metadata: serde_json::Value::Null,
            timestamp: Utc::now(),
        }
    }
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

pub struct QRCodeServiceImpl;

impl QRCodeServiceImpl {
    pub fn new() -> Self {
        Self
    }

    #[cfg(test)]
    pub fn new_with_key(_signing_key: SigningKey) -> Self {
        Self
    }

    async fn verify_signature(
        &self,
        data: &QRData,
        signature: &str,
        context: &SecurityContext,
    ) -> Result<bool, CoreError> {
        // TODO: Implement actual signature verification
        // For now, just check if signature exists
        Ok(!signature.is_empty())
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
        // Serialize data to JSON
        let data_str = serde_json::to_string(data)
            .map_err(|e| CoreError::Validation(format!("Failed to serialize QR data: {}", e)))?;

        match format {
            QRFormat::PNG => {
                let code = QrCode::new(data_str.as_bytes())?;
                
                // Get the QR code as a boolean matrix
                let image = code.render::<char>()
                    .quiet_zone(false)
                    .module_dimensions(8, 8)
                    .build();
                
                // Convert to image buffer - each module is 8x8 pixels
                let module_count = code.width() as u32;  // width() returns module count
                let size = module_count * 8;  // 8 pixels per module
                let mut img_buf = ImageBuffer::new(size, size);

                // Fill image buffer
                let image_vec: Vec<char> = image.chars().filter(|c| *c != '\n').collect();
                
                for (x, y, pixel) in img_buf.enumerate_pixels_mut() {
                    let qr_x = (x / 8) as usize;
                    let qr_y = (y / 8) as usize;
                    let index = qr_y * module_count as usize + qr_x;
                    
                    *pixel = if index < image_vec.len() && image_vec[index] == '1' {
                        Luma([0u8])    // Black
                    } else {
                        Luma([255u8])  // White
                    };
                }

                let mut buffer = Vec::new();
                img_buf.write_to(&mut Cursor::new(&mut buffer), image::ImageFormat::Png)?;

                Ok(QRResponse {
                    format: QRFormat::PNG,
                    data: buffer,
                })
            }
            QRFormat::SVG => {
                let code = QrCode::new(data_str.as_bytes())?;
                let svg_xml = code.render()
                    .min_dimensions(200, 200)
                    .dark_color(svg::Color("#000000"))
                    .light_color(svg::Color("#ffffff"))
                    .build()
                    .to_string();

                Ok(QRResponse {
                    format: QRFormat::SVG,
                    data: svg_xml.into_bytes(),
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
        if let Some(signature) = &request.signature {
            if !self.verify_signature(&data, signature, context).await? {
                return Err(CoreError::Validation("Invalid signature".into()));
            }
        }

        // Verify timestamp
        self.verify_timestamp(data.timestamp, request.timestamp).await?;

        Ok(data)
    }
}
