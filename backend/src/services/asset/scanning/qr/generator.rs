// backend/src/services/scanning/qr/generator.rs

use uuid::Uuid;
use chrono::Utc;
use qrcode::QrCode;
use qrcode::render::svg;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use crate::services::scanning::common::ScanError;

pub struct QRGenerator {
    version: u8,
    error_correction: qrcode::EcLevel,
}

impl QRGenerator {
    pub fn new() -> Self {
        Self {
            version: 1,
            error_correction: qrcode::EcLevel::H,
        }
    }

    pub fn with_version(mut self, version: u8) -> Self {
        self.version = version;
        self
    }

    pub fn with_error_correction(mut self, level: qrcode::EcLevel) -> Self {
        self.error_correction = level;
        self
    }

    pub fn generate_asset_qr(&self, asset_id: Uuid) -> Result<String, ScanError> {
        let verification_code = self.generate_verification_code();
        let qr_data = format!("{}|{}", asset_id, verification_code);

        let code = QrCode::with_version(
            qr_data.as_bytes(),
            qrcode::Version::Normal(self.version),
            self.error_correction,
        ).map_err(|e| ScanError::DeviceError(format!("Failed to generate QR code: {}", e)))?;

        let image = code.render()
            .min_dimensions(200, 200)
            .dark_color(svg::Color("#000000"))
            .light_color(svg::Color("#ffffff"))
            .build();

        Ok(BASE64.encode(image.as_bytes()))
    }

    pub fn generate_verification_code(&self) -> String {
        format!("VERIFY-{}-{}", 
            Uuid::new_v4().simple(),
            Utc::now().timestamp()
        )
    }

    pub fn validate_qr_format(&self, data: &str) -> Result<bool, ScanError> {
        let parts: Vec<&str> = data.split('|').collect();
        if parts.len() != 2 {
            return Ok(false);
        }

        // Validate UUID format
        if Uuid::parse_str(parts[0]).is_err() {
            return Ok(false);
        }

        // Validate verification code format
        let code_parts: Vec<&str> = parts[1].split('-').collect();
        if code_parts.len() != 3 || code_parts[0] != "VERIFY" {
            return Ok(false);
        }

        Ok(true)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_qr_generation() {
        let generator = QRGenerator::new();
        let asset_id = Uuid::new_v4();

        let qr_data = generator.generate_asset_qr(asset_id).unwrap();
        assert!(!qr_data.is_empty());
    }

    #[test]
    fn test_verification_code() {
        let generator = QRGenerator::new();
        let code = generator.generate_verification_code();
        
        assert!(code.starts_with("VERIFY-"));
        assert_eq!(code.split('-').count(), 3);
    }

    #[test]
    fn test_qr_validation() {
        let generator = QRGenerator::new();
        let asset_id = Uuid::new_v4();
        let verification = generator.generate_verification_code();
        let data = format!("{}|{}", asset_id, verification);

        assert!(generator.validate_qr_format(&data).unwrap());
    }
}
