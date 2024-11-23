use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use async_trait::async_trait;
use crate::types::security::SecurityClassification;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QRScanResult {
    pub id: Uuid,
    pub data: Vec<u8>,
    pub metadata: Option<HashMap<String, String>>,
    pub timestamp: DateTime<Utc>,
    pub location: Option<GeoLocation>,
    pub device_info: Option<DeviceInfo>,
    pub classification: SecurityClassification,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeoLocation {
    pub latitude: f64,
    pub longitude: f64,
    pub altitude: Option<f64>,
    pub accuracy: Option<f64>,
    pub timestamp: DateTime<Utc>,
    pub building: Option<String>,
    pub room: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub device_id: String,
    pub device_type: String,
    pub os_version: String,
    pub app_version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeoPoint {
    pub latitude: f64,
    pub longitude: f64,
}

#[derive(Debug, thiserror::Error)]
pub enum QRScanError {
    #[error("Device error: {0}")]
    DeviceError(String),
    
    #[error("Invalid QR code: {0}")]
    InvalidQRCode(String),
    
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    
    #[error("Verification failed: {0}")]
    VerificationFailed(String),
}

/// Interface for QR code scanning
#[async_trait]
pub trait QRScanner {
    /// Scans a QR code
    async fn scan(&self) -> Result<QRScanResult, QRScanError>;
    
    /// Initializes the scanner
    async fn initialize(&self) -> Result<(), QRScanError>;
    
    /// Shuts down the scanner
    async fn shutdown(&self) -> Result<(), QRScanError>;
}

/// Interface for QR code verification
#[async_trait]
pub trait QRVerifier {
    /// Verifies a QR code scan result
    async fn verify(&self, scan_result: &QRScanResult) -> Result<bool, QRScanError>;
    
    /// Validates the QR code format
    fn validate_format(&self, data: &[u8]) -> bool;
}

impl QRScanResult {
    pub fn new(
        data: Vec<u8>,
        classification: SecurityClassification,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            data,
            metadata: None,
            timestamp: Utc::now(),
            location: None,
            device_info: None,
            classification,
        }
    }

    pub fn with_metadata(mut self, metadata: HashMap<String, String>) -> Self {
        self.metadata = Some(metadata);
        self
    }

    pub fn with_location(mut self, location: GeoLocation) -> Self {
        self.location = Some(location);
        self
    }

    pub fn with_device_info(mut self, device_info: DeviceInfo) -> Self {
        self.device_info = Some(device_info);
        self
    }

    /// Extracts the property ID from QR data
    pub fn property_id(&self) -> Option<Uuid> {
        if let Ok(data_str) = String::from_utf8(self.data.clone()) {
            let parts: Vec<&str> = data_str.split(':').collect();
            if parts.len() == 2 {
                return Uuid::parse_str(parts[0]).ok();
            }
        }
        None
    }

    /// Extracts the verification code from QR data
    pub fn verification_code(&self) -> Option<String> {
        if let Ok(data_str) = String::from_utf8(self.data.clone()) {
            let parts: Vec<&str> = data_str.split(':').collect();
            if parts.len() == 2 {
                return Some(parts[1].to_string());
            }
        }
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_qr_scan_result() {
        let property_id = Uuid::new_v4();
        let verification_code = "1234abcd";
        let data = format!("{}:{}", property_id, verification_code);
        
        let scan_result = QRScanResult::new(
            data.into_bytes(),
            SecurityClassification::Unclassified,
        );

        assert_eq!(scan_result.property_id().unwrap(), property_id);
        assert_eq!(scan_result.verification_code().unwrap(), verification_code);
    }

    #[test]
    fn test_invalid_qr_data() {
        let scan_result = QRScanResult::new(
            b"invalid-data".to_vec(),
            SecurityClassification::Unclassified,
        );

        assert!(scan_result.property_id().is_none());
        assert!(scan_result.verification_code().is_none());
    }
}
