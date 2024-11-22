use crate::services::asset::scanning::common::{ScanVerifier, ScanResult, ScanError, ScanType};
use async_trait::async_trait;

pub struct NFCValidator {
    allowed_protocols: Vec<String>,
    min_signal_strength: f64,
    allowed_tag_types: Vec<String>,
}

impl NFCValidator {
    pub fn new() -> Self {
        Self {
            allowed_protocols: vec![
                "ISO14443A".to_string(),
                "ISO14443B".to_string(),
                "MIFARE".to_string(),
            ],
            min_signal_strength: 0.7,
            allowed_tag_types: vec![
                "MIFARE Classic".to_string(),
                "MIFARE DESFire".to_string(),
                "NTAG".to_string(),
            ],
        }
    }
}

#[async_trait]
impl ScanVerifier for NFCValidator {
    async fn verify(&self, scan_result: &ScanResult) -> Result<bool, ScanError> {
        if scan_result.scan_type != ScanType::NFC {
            return Err(ScanError::InvalidData("Not an NFC scan".to_string()));
        }

        let protocol = scan_result.metadata.get("protocol")
            .and_then(|v| v.as_str())
            .ok_or_else(|| ScanError::InvalidData("Missing NFC protocol".to_string()))?;

        let signal_strength = scan_result.metadata.get("signal_strength")
            .and_then(|v| v.as_f64())
            .ok_or_else(|| ScanError::InvalidData("Missing signal strength".to_string()))?;

        let tag_type = scan_result.metadata.get("tag_type")
            .and_then(|v| v.as_str())
            .ok_or_else(|| ScanError::InvalidData("Missing tag type".to_string()))?;

        if !self.allowed_protocols.iter().any(|p| p == protocol) {
            return Ok(false);
        }

        if signal_strength < self.min_signal_strength {
            return Ok(false);
        }

        if !self.allowed_tag_types.iter().any(|t| t == tag_type) {
            return Ok(false);
        }

        Ok(true)
    }
}
