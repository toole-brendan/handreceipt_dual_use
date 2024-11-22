use uuid::Uuid;
use qrcode::QrCode;
use qrcode::render::svg;
use chrono::Utc;
use async_trait::async_trait;

use crate::types::error::CoreError;
use crate::services::asset::scanning::common::{Scanner, ScanResult, ScanError, ScanType};

pub struct QRCodeService {
    base_url: String,
    device_id: String,
}

impl QRCodeService {
    pub fn new(base_url: String, device_id: String) -> Self {
        Self { base_url, device_id }
    }

    pub fn generate_asset_qr(&self, asset_id: Uuid) -> Result<String, CoreError> {
        let url = format!("{}/assets/{}", self.base_url, asset_id);
        let code = QrCode::new(url.as_bytes())
            .map_err(|e| CoreError::InternalError(e.to_string()))?;
        
        Ok(code.render()
            .min_dimensions(200, 200)
            .dark_color(svg::Color("#000000"))
            .light_color(svg::Color("#ffffff"))
            .build())
    }

    pub fn generate_svg(&self, asset_id: Uuid) -> Result<String, CoreError> {
        let url = format!("{}/assets/{}", self.base_url, asset_id);
        let code = QrCode::new(url.as_bytes())
            .map_err(|e| CoreError::InternalError(e.to_string()))?;
        
        Ok(code.render()
            .min_dimensions(200, 200)
            .dark_color(svg::Color("#000000"))
            .light_color(svg::Color("#ffffff"))
            .build())
    }

    pub fn verify_qr_code(&self, qr_data: &str) -> Result<Uuid, CoreError> {
        Uuid::parse_str(qr_data)
            .map_err(|e| CoreError::ValidationError(e.to_string()))
    }
}

#[async_trait]
impl Scanner for QRCodeService {
    async fn scan(&self, data: &[u8]) -> Result<ScanResult, ScanError> {
        let qr_data = String::from_utf8(data.to_vec())
            .map_err(|e| ScanError::InvalidData(format!("Invalid QR code data: {}", e)))?;

        let asset_id = self.verify_qr_code(&qr_data)
            .map_err(|e| ScanError::InvalidData(format!("Invalid asset ID in QR code: {}", e)))?;

        Ok(ScanResult {
            id: Uuid::new_v4().to_string(),
            scan_type: ScanType::QR,
            timestamp: Utc::now(),
            data: data.to_vec(),
            location: None,
            metadata: serde_json::json!({
                "device_id": self.device_id,
                "asset_id": asset_id.to_string(),
                "format": "QR",
                "url": format!("{}/assets/{}", self.base_url, asset_id)
            }),
        })
    }
}
