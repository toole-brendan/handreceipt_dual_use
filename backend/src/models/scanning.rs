use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResult {
    pub id: Uuid,
    pub scan_type: ScanType,
    pub data: String,
    pub timestamp: DateTime<Utc>,
    pub device_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScanType {
    QR,
    RFID,
    NFC,
    Manual,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RFIDTag {
    pub id: String,
    pub tag_type: RFIDTagType,
    pub last_read: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RFIDTagType {
    HF,
    UHF,
    LF,
} 