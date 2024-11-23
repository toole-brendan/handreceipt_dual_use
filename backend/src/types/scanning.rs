use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use async_trait::async_trait;
use crate::types::security::SecurityClassification;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResult {
    pub id: Uuid,
    pub scan_type: ScanType,
    pub data: Vec<u8>,
    pub metadata: Option<HashMap<String, String>>,
    pub timestamp: DateTime<Utc>,
    pub location: Option<GeoLocation>,
    pub device_info: Option<DeviceInfo>,
    pub classification: SecurityClassification,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ScanType {
    QrCode,
    Barcode,
    Nfc,
    Rfid,
    Manual,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeoLocation {
    pub latitude: f64,
    pub longitude: f64,
    pub altitude: Option<f64>,
    pub accuracy: Option<f64>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub device_id: String,
    pub device_type: String,
    pub os_version: String,
    pub app_version: String,
    pub capabilities: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeoPoint {
    pub latitude: f64,
    pub longitude: f64,
}

#[derive(Debug, thiserror::Error)]
pub enum ScanError {
    #[error("Device error: {0}")]
    DeviceError(String),
    #[error("Invalid data: {0}")]
    InvalidData(String),
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    #[error("Network error: {0}")]
    NetworkError(String),
    #[error("Verification failed: {0}")]
    VerificationFailed(String),
}

#[async_trait]
pub trait Scanner {
    async fn scan(&self) -> Result<ScanResult, ScanError>;
    async fn initialize(&self) -> Result<(), ScanError>;
    async fn shutdown(&self) -> Result<(), ScanError>;
}

#[async_trait]
pub trait ScanVerifier {
    async fn verify(&self, scan_result: &ScanResult) -> Result<bool, ScanError>;
}

impl ScanResult {
    pub fn new(
        scan_type: ScanType,
        data: Vec<u8>,
        classification: SecurityClassification,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            scan_type,
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
}

impl std::fmt::Display for ScanType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::QrCode => write!(f, "QR_CODE"),
            Self::Barcode => write!(f, "BARCODE"),
            Self::Nfc => write!(f, "NFC"),
            Self::Rfid => write!(f, "RFID"),
            Self::Manual => write!(f, "MANUAL"),
        }
    }
}

impl std::str::FromStr for ScanType {
    type Err = crate::error::CoreError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_uppercase().as_str() {
            "QR_CODE" => Ok(Self::QrCode),
            "BARCODE" => Ok(Self::Barcode),
            "NFC" => Ok(Self::Nfc),
            "RFID" => Ok(Self::Rfid),
            "MANUAL" => Ok(Self::Manual),
            _ => Err(crate::error::CoreError::Validation(
                format!("Invalid scan type: {}", s).into()
            )),
        }
    }
}
