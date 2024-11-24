use std::sync::Arc;
use tokio::sync::mpsc;
use async_trait::async_trait;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use image::{ImageBuffer, GrayImage};
use quircs::Quirc;

use crate::{
    Result,
    offline::storage::{MobileStorage, MobileData, MobileSyncStatus},
    sync::SyncPriority,
    error::MobileError,
};

use super::Scanner;

/// QR code data matching backend format
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QRData {
    pub property_id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub signature: String,
}

/// QR scanner implementation
pub struct QRScanner {
    storage: Arc<MobileStorage>,
    scan_channel: mpsc::Sender<QRData>,
    verification_key: ed25519_dalek::VerifyingKey,
}

impl QRScanner {
    pub fn new(
        storage: Arc<MobileStorage>,
        verification_key: ed25519_dalek::VerifyingKey,
    ) -> Self {
        let (tx, _) = mpsc::channel(100);
        Self {
            storage,
            scan_channel: tx,
            verification_key,
        }
    }

    async fn capture_image() -> Result<GrayImage> {
        // This would interface with actual camera hardware
        // For now, return a mock image for testing
        let width = 640;
        let height = 480;
        let img = ImageBuffer::new(width, height);
        Ok(img)
    }

    fn decode_qr(image: &GrayImage) -> Result<String> {
        let quirc = Quirc::new();
        let codes = quirc.identify(image.width() as usize, image.height() as usize, &image)
            .map_err(|e| MobileError::ScanError(format!("QR decode error: {}", e)))?;

        for code in codes {
            if let Ok(decoded) = code.decode() {
                if let Ok(content) = String::from_utf8(decoded.payload) {
                    return Ok(content);
                }
            }
        }

        Err(MobileError::ScanError("No valid QR code found".to_string()))
    }

    async fn verify_qr_data(&self, data: &QRData) -> Result<()> {
        // Verify signature
        let msg = format!("{}:{}", data.property_id, data.timestamp.timestamp());
        let signature_bytes = BASE64.decode(data.signature.as_bytes())
            .map_err(|e| MobileError::SecurityError(format!("Invalid signature encoding: {}", e)))?;
            
        let signature = ed25519_dalek::Signature::from_bytes(&signature_bytes)
            .map_err(|e| MobileError::SecurityError(format!("Invalid signature format: {}", e)))?;

        self.verification_key.verify_strict(msg.as_bytes(), &signature)
            .map_err(|_| MobileError::SecurityError("Invalid QR code signature".to_string()))?;

        // Check if QR code has expired (24 hours)
        let age = Utc::now() - data.timestamp;
        if age.num_hours() > 24 {
            return Err(MobileError::SecurityError("QR code has expired".to_string()));
        }

        Ok(())
    }

    async fn store_scan(&self, data: &QRData) -> Result<()> {
        let mobile_data = MobileData {
            id: data.property_id.to_string(),
            data_type: "qr_scan".to_string(),
            content: serde_json::to_value(data)?,
            timestamp: Utc::now(),
            sync_status: MobileSyncStatus::Pending,
            priority: SyncPriority::High,
        };

        self.storage.store(mobile_data).await?;
        Ok(())
    }
}

#[async_trait]
impl Scanner for QRScanner {
    async fn initialize(&mut self) -> Result<()> {
        // Initialize camera hardware
        // This is a placeholder - implement actual hardware initialization
        Ok(())
    }

    async fn start(&self) -> Result<()> {
        let storage = self.storage.clone();
        let scan_channel = self.scan_channel.clone();

        tokio::spawn(async move {
            loop {
                // Capture and process image
                if let Ok(image) = Self::capture_image().await {
                    if let Ok(qr_content) = Self::decode_qr(&image) {
                        // Parse QR data
                        if let Ok(qr_data) = serde_json::from_str::<QRData>(&qr_content) {
                            // Store scan and notify channel
                            if let Ok(()) = storage.store(MobileData {
                                id: qr_data.property_id.to_string(),
                                data_type: "qr_scan".to_string(),
                                content: serde_json::to_value(qr_data.clone()).unwrap(),
                                timestamp: Utc::now(),
                                sync_status: MobileSyncStatus::Pending,
                                priority: SyncPriority::High,
                            }).await {
                                let _ = scan_channel.send(qr_data).await;
                            }
                        }
                    }
                }
                tokio::time::sleep(std::time::Duration::from_millis(100)).await;
            }
        });

        Ok(())
    }

    async fn stop(&self) -> Result<()> {
        // Stop camera hardware
        // This is a placeholder - implement actual hardware shutdown
        Ok(())
    }

    async fn process_scan(&self, qr_data: String) -> Result<()> {
        // Parse QR data
        let data: QRData = serde_json::from_str(&qr_data)?;
        
        // Verify QR code
        self.verify_qr_data(&data).await?;
        
        // Store verified scan
        self.store_scan(&data).await?;
        
        // Notify scan channel
        self.scan_channel.send(data).await
            .map_err(|e| MobileError::SystemError(format!("Failed to process scan: {}", e)))?;
            
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{SigningKey, VerifyingKey};
    use tempfile::TempDir;

    async fn create_test_scanner() -> (QRScanner, SigningKey) {
        // Create test storage
        let temp_dir = TempDir::new().unwrap();
        let storage = Arc::new(MobileStorage::new(temp_dir.path()).await.unwrap());

        // Create test keys
        let signing_key = SigningKey::generate(&mut rand::thread_rng());
        let verifying_key = signing_key.verifying_key();

        let scanner = QRScanner::new(storage, verifying_key);
        (scanner, signing_key)
    }

    #[tokio::test]
    async fn test_qr_verification() {
        let (scanner, signing_key) = create_test_scanner().await;
        
        // Create test QR data
        let property_id = Uuid::new_v4();
        let timestamp = Utc::now();
        let msg = format!("{}:{}", property_id, timestamp.timestamp());
        
        // Sign data
        let signature = signing_key.sign(msg.as_bytes());
        
        let qr_data = QRData {
            property_id,
            timestamp,
            signature: BASE64.encode(signature.to_bytes()),
        };

        // Verify data
        assert!(scanner.verify_qr_data(&qr_data).await.is_ok());
    }

    #[tokio::test]
    async fn test_expired_qr() {
        let (scanner, signing_key) = create_test_scanner().await;
        
        // Create expired QR data
        let property_id = Uuid::new_v4();
        let timestamp = Utc::now() - chrono::Duration::hours(25);
        let msg = format!("{}:{}", property_id, timestamp.timestamp());
        
        let signature = signing_key.sign(msg.as_bytes());
        
        let qr_data = QRData {
            property_id,
            timestamp,
            signature: BASE64.encode(signature.to_bytes()),
        };

        // Verify data fails due to expiration
        assert!(scanner.verify_qr_data(&qr_data).await.is_err());
    }
}
