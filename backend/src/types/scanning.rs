use serde::{Serialize, Deserialize};
use std::fmt;
use async_trait::async_trait;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResult {
    pub id: String,
    pub scan_type: ScanType,
    pub timestamp: DateTime<Utc>,
    pub data: Vec<u8>,
    pub location: Option<GeoPoint>,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ScanType {
    Barcode,
    NFC,
    QR,
    RFID,
}

impl fmt::Display for ScanType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ScanType::Barcode => write!(f, "Barcode"),
            ScanType::NFC => write!(f, "NFC"),
            ScanType::QR => write!(f, "QR"),
            ScanType::RFID => write!(f, "RFID"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeoPoint {
    pub latitude: f64,
    pub longitude: f64,
    pub altitude: Option<f64>,
    pub accuracy: Option<f64>,
}

#[derive(Debug, thiserror::Error)]
pub enum ScanError {
    #[error("Invalid scan data: {0}")]
    InvalidData(String),

    #[error("Device error: {0}")]
    DeviceError(String),

    #[error("Operation not supported: {0}")]
    UnsupportedOperation(String),

    #[error("Verification failed: {0}")]
    VerificationFailed(String),
}

#[async_trait]
pub trait Scanner: Send + Sync {
    async fn scan(&self, data: &[u8]) -> Result<ScanResult, ScanError>;
}

#[async_trait]
pub trait ScanVerifier: Send + Sync {
    async fn verify(&self, scan_result: &ScanResult) -> Result<bool, ScanError>;
}
