use crate::services::asset::scanning::common::{ScanVerifier, ScanResult, ScanError, ScanType};
use async_trait::async_trait;

pub struct BarcodeValidator {
    allowed_formats: Vec<String>,
    min_quality_score: f64,
}

impl BarcodeValidator {
    pub fn new() -> Self {
        Self {
            allowed_formats: vec!["CODE128".to_string(), "QR".to_string(), "EAN13".to_string()],
            min_quality_score: 0.8,
        }
    }
}

#[async_trait]
impl ScanVerifier for BarcodeValidator {
    async fn verify(&self, scan_result: &ScanResult) -> Result<bool, ScanError> {
        if scan_result.scan_type != ScanType::Barcode {
            return Err(ScanError::InvalidData("Not a barcode scan".to_string()));
        }

        let format = scan_result.metadata.get("format")
            .and_then(|v| v.as_str())
            .ok_or_else(|| ScanError::InvalidData("Missing barcode format".to_string()))?;

        let quality_score = scan_result.metadata.get("quality_score")
            .and_then(|v| v.as_f64())
            .ok_or_else(|| ScanError::InvalidData("Missing quality score".to_string()))?;

        if !self.allowed_formats.iter().any(|f| f == format) {
            return Ok(false);
        }

        if quality_score < self.min_quality_score {
            return Ok(false);
        }

        Ok(true)
    }
}
