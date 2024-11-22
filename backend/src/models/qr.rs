use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QRFormat {
    pub format: Option<String>, // "svg" or "png", defaults to "png"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QRResponse {
    pub qr_code: String,
    pub asset_id: String,
    pub last_verified: Option<String>,
    pub verification_count: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyQRRequest {
    pub qr_data: String,
} 