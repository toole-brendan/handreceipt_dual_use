use async_trait::async_trait;
use uuid::Uuid;
use chrono::Utc;
use std::sync::Arc;

use crate::core::SecurityContext;
use crate::services::asset::scanning::common::{
    Scanner, 
    ScanResult, 
    ScanError, 
    ScanType, 
    GeoLocation
};

pub struct BarcodeScanner {
    device_id: String,
    initialized: bool,
    location: Option<GeoLocation>,
    power_level: i32,
}

impl BarcodeScanner {
    pub fn new(device_id: String) -> Self {
        Self {
            device_id,
            initialized: false,
            location: None,
            power_level: 5, // Default power level in mW
        }
    }

    pub fn set_power_level(&mut self, level: i32) -> Result<(), ScanError> {
        if !(1..=10).contains(&level) {
            return Err(ScanError::DeviceError("Invalid power level".to_string()));
        }
        self.power_level = level;
        Ok(())
    }

    pub fn set_location(&mut self, location: GeoLocation) {
        self.location = Some(location);
    }

    fn parse_barcode_data(&self, raw_data: &str) -> Result<Uuid, ScanError> {
        // Parse barcode format to extract asset ID
        if raw_data.len() < 36 {
            return Err(ScanError::InvalidData("Barcode data too short".to_string()));
        }

        let asset_id = Uuid::parse_str(&raw_data[..36])
            .map_err(|e| ScanError::InvalidData(format!("Invalid asset ID format: {}", e)))?;

        Ok(asset_id)
    }

    fn validate_scan_conditions(&self) -> Result<(), ScanError> {
        // Check power level
        if self.power_level < 3 {
            return Err(ScanError::DeviceError("Power level too low".to_string()));
        }

        Ok(())
    }
}

#[async_trait]
impl Scanner for BarcodeScanner {
    fn scanner_type(&self) -> ScanType {
        ScanType::Barcode
    }

    async fn initialize(&mut self) -> Result<(), ScanError> {
        if self.initialized {
            return Ok(());
        }

        // Simulate device initialization
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        
        // Set default power level
        self.power_level = 5;
        self.initialized = true;
        
        Ok(())
    }

    async fn scan(&mut self, _security_context: &SecurityContext) -> Result<ScanResult, ScanError> {
        if !self.initialized {
            return Err(ScanError::DeviceError("Scanner not initialized".to_string()));
        }

        // Validate scan conditions
        self.validate_scan_conditions()?;

        // Simulate barcode scanning
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

        // In a real implementation, this would come from the actual device
        let raw_data = format!("{}-SAMPLE-BARCODE", Uuid::new_v4());
        let asset_id = self.parse_barcode_data(&raw_data)?;

        Ok(ScanResult {
            id: Uuid::new_v4(),
            asset_id,
            scan_type: ScanType::Barcode,
            timestamp: Utc::now(),
            location: self.location.clone(),
            signature: None,
            metadata: serde_json::json!({
                "device_id": self.device_id,
                "raw_data": raw_data,
                "format": "CODE128",
                "power_level": self.power_level,
                "scan_quality": (self.power_level as f32 / 10.0) * 100.0
            }),
        })
    }

    async fn verify_scan(&self, scan_result: &ScanResult) -> Result<bool, ScanError> {
        // Basic validation of scan data
        if scan_result.scan_type != ScanType::Barcode {
            return Ok(false);
        }

        let metadata = scan_result.metadata.as_object()
            .ok_or_else(|| ScanError::InvalidData("Invalid metadata format".to_string()))?;

        // Verify device ID matches
        if let Some(device_id) = metadata.get("device_id") {
            if device_id.as_str() != Some(&self.device_id) {
                return Ok(false);
            }
        }

        // Verify scan quality
        if let Some(quality) = metadata.get("scan_quality") {
            if let Some(quality) = quality.as_f64() {
                if quality < 30.0 {
                    return Ok(false);
                }
            }
        }

        Ok(true)
    }

    async fn cleanup(&mut self) -> Result<(), ScanError> {
        // Power down scanner
        self.power_level = 0;
        self.initialized = false;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_barcode_scanner() {
        let mut scanner = BarcodeScanner::new("TEST-DEVICE-001".to_string());
        
        // Test initialization
        assert!(!scanner.initialized);
        scanner.initialize().await.unwrap();
        assert!(scanner.initialized);

        // Test power level settings
        scanner.set_power_level(8).unwrap();
        assert_eq!(scanner.power_level, 8);

        // Test invalid power level
        assert!(scanner.set_power_level(11).is_err());

        // Test scanning
        let context = SecurityContext::new(
            crate::core::SecurityClassification::Unclassified,
            Uuid::new_v4(),
            "test".to_string(),
            vec![],
        );

        let scan_result = scanner.scan(&context).await.unwrap();
        assert_eq!(scan_result.scan_type, ScanType::Barcode);
        
        // Test verification
        assert!(scanner.verify_scan(&scan_result).await.unwrap());

        // Test cleanup
        scanner.cleanup().await.unwrap();
        assert!(!scanner.initialized);
        assert_eq!(scanner.power_level, 0);
    }

    #[tokio::test]
    async fn test_scan_with_location() {
        let mut scanner = BarcodeScanner::new("TEST-DEVICE-001".to_string());
        scanner.initialize().await.unwrap();

        // Set location
        let location = GeoLocation {
            latitude: 37.7749,
            longitude: -122.4194,
            altitude: Some(10.0),
            accuracy: Some(5.0),
        };
        scanner.set_location(location.clone());

        // Test scanning with location
        let context = SecurityContext::new(
            crate::core::SecurityClassification::Unclassified,
            Uuid::new_v4(),
            "test".to_string(),
            vec![],
        );

        let scan_result = scanner.scan(&context).await.unwrap();
        assert_eq!(scan_result.location.unwrap().latitude, location.latitude);
    }
} 