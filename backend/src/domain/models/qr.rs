use qrcode::QrCode;
use image::{DynamicImage, ImageBuffer, Luma};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::io::Cursor;
use async_trait::async_trait;

use crate::{
    error::CoreError,
    types::security::SecurityContext,
};

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
                let image = code.render::<char>()
                    .dark_color('1')
                    .light_color('0')
                    .quiet_zone(false)
                    .module_dimensions(4, 4)
                    .build();

                // Convert ASCII art to PNG
                let width = image.chars().position(|c| c == '\n').unwrap_or(0) as u32;
                let height = (image.chars().filter(|&c| c == '\n').count() + 1) as u32;
                let pixels: Vec<u8> = image.chars()
                    .filter(|&c| c != '\n')
                    .map(|c| if c == '1' { 0 } else { 255 })
                    .collect();

                let img = image::GrayImage::from_raw(width, height, pixels)
                    .ok_or_else(|| CoreError::Image("Failed to create image".into()))?;

                let mut buffer = Vec::new();
                img.write_to(&mut Cursor::new(&mut buffer), image::ImageFormat::Png)?;

                Ok(QRResponse {
                    format: QRFormat::PNG,
                    data: buffer,
                })
            }
            QRFormat::SVG => {
                let code = QrCode::new(data_str.as_bytes())?;
                let svg = code.render::<qrcode::render::svg::Color>()
                    .build();

                Ok(QRResponse {
                    format: QRFormat::SVG,
                    data: svg.into_bytes(),
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
