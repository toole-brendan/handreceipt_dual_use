use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Result of scanning a QR code
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QRScanResult {
    pub id: Uuid,
    pub data: String,
    pub timestamp: DateTime<Utc>,
    pub device_info: DeviceInfo,
    pub location: Option<Location>,
}

/// Information about the scanning device
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub device_type: String,    // e.g., "iPhone", "Android"
    pub os_version: String,     // e.g., "iOS 15.0"
    pub app_version: String,    // e.g., "1.0.0"
    pub device_id: String,      // Unique device identifier
}

/// Location where the scan occurred
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub latitude: f64,
    pub longitude: f64,
    pub accuracy: Option<f64>,
    pub building: Option<String>,
    pub room: Option<String>,
    pub timestamp: DateTime<Utc>,
}

impl QRScanResult {
    /// Creates a new QR scan result
    pub fn new(
        data: String,
        device_info: DeviceInfo,
        location: Option<Location>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            data,
            timestamp: Utc::now(),
            device_info,
            location,
        }
    }

    /// Validates the QR scan data format
    pub fn validate(&self) -> bool {
        // QR data should be in format: "{property_id}:{verification_code}"
        let parts: Vec<&str> = self.data.split(':').collect();
        if parts.len() != 2 {
            return false;
        }

        // Validate property ID is a valid UUID
        if Uuid::parse_str(parts[0]).is_err() {
            return false;
        }

        // Validate verification code format (hex string)
        if !parts[1].chars().all(|c| c.is_ascii_hexdigit()) {
            return false;
        }

        true
    }

    /// Extracts the property ID from the QR data
    pub fn property_id(&self) -> Option<Uuid> {
        let parts: Vec<&str> = self.data.split(':').collect();
        if parts.len() != 2 {
            return None;
        }
        Uuid::parse_str(parts[0]).ok()
    }

    /// Extracts the verification code from the QR data
    pub fn verification_code(&self) -> Option<&str> {
        let parts: Vec<&str> = self.data.split(':').collect();
        if parts.len() != 2 {
            return None;
        }
        Some(parts[1])
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_device_info() -> DeviceInfo {
        DeviceInfo {
            device_type: "iPhone".to_string(),
            os_version: "iOS 15.0".to_string(),
            app_version: "1.0.0".to_string(),
            device_id: "TEST123".to_string(),
        }
    }

    #[test]
    fn test_qr_scan_validation() {
        let property_id = Uuid::new_v4();
        let verification_code = "1234abcd";
        let data = format!("{}:{}", property_id, verification_code);

        let scan = QRScanResult::new(
            data,
            create_test_device_info(),
            None,
        );

        assert!(scan.validate());
        assert_eq!(scan.property_id().unwrap(), property_id);
        assert_eq!(scan.verification_code().unwrap(), verification_code);
    }

    #[test]
    fn test_invalid_qr_data() {
        let scan = QRScanResult::new(
            "invalid-data".to_string(),
            create_test_device_info(),
            None,
        );

        assert!(!scan.validate());
        assert!(scan.property_id().is_none());
        assert!(scan.verification_code().is_none());
    }
}
