use crate::services::asset::scanning::common::{Scanner, ScanResult, ScanError, ScanType};
use async_trait::async_trait;
use chrono::Utc;
use uuid::Uuid;

pub struct BarcodeScanner {
    device_id: String,
}

impl BarcodeScanner {
    pub fn new(device_id: String) -> Self {
        Self { device_id }
    }
}

#[async_trait]
impl Scanner for BarcodeScanner {
    async fn scan(&self, data: &[u8]) -> Result<ScanResult, ScanError> {
        Ok(ScanResult {
            id: Uuid::new_v4().to_string(),
            scan_type: ScanType::Barcode,
            timestamp: Utc::now(),
            data: data.to_vec(),
            location: None,
            metadata: serde_json::json!({
                "device_id": self.device_id,
                "format": "CODE128",
                "quality_score": 0.95
            }),
        })
    }
}
