use uuid::Uuid;
use chrono::{DateTime, Utc};
use qrcode::QrCode;
use qrcode::render::svg;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use serde::{Serialize, Deserialize};
use std::sync::Arc;

use crate::domain::property::{
    Property,
    PropertyService,
    PropertyServiceError,
};

/// QR code data format
#[derive(Debug, Serialize, Deserialize)]
pub struct PropertyQRData {
    pub property_id: Uuid,
    pub verification_code: String,
    pub timestamp: DateTime<Utc>,
    pub custodian: Option<String>,
    pub is_sensitive: bool,
}

/// Error types for QR operations
#[derive(Debug, thiserror::Error)]
pub enum QRServiceError {
    #[error("QR generation error: {0}")]
    Generation(String),

    #[error("Invalid QR format: {0}")]
    InvalidFormat(String),

    #[error("Property error: {0}")]
    Property(#[from] PropertyServiceError),

    #[error("Verification error: {0}")]
    Verification(String),
}

/// Service for handling QR code operations
pub struct QRService {
    property_service: Arc<dyn PropertyService>,
    version: u8,
    error_correction: qrcode::EcLevel,
}

impl QRService {
    pub fn new(property_service: Arc<dyn PropertyService>) -> Self {
        Self {
            property_service,
            version: 1,
            error_correction: qrcode::EcLevel::H,
        }
    }

    /// Customizes QR code version
    pub fn with_version(mut self, version: u8) -> Self {
        self.version = version;
        self
    }

    /// Customizes error correction level
    pub fn with_error_correction(mut self, level: qrcode::EcLevel) -> Self {
        self.error_correction = level;
        self
    }

    /// Generates a QR code for a property
    pub async fn generate_property_qr(
        &self,
        property_id: Uuid,
    ) -> Result<String, QRServiceError> {
        // Get property to ensure it exists and get current info
        let property = self.property_service
            .get_property(property_id)
            .await
            .map_err(QRServiceError::Property)?;

        // Create QR data
        let qr_data = PropertyQRData {
            property_id,
            verification_code: self.generate_verification_code(),
            timestamp: Utc::now(),
            custodian: property.custodian().cloned(),
            is_sensitive: property.is_sensitive(),
        };

        // Serialize to JSON
        let qr_json = serde_json::to_string(&qr_data)
            .map_err(|e| QRServiceError::Generation(e.to_string()))?;

        // Generate QR code
        let code = QrCode::with_version(
            qr_json.as_bytes(),
            qrcode::Version::Normal(self.version),
            self.error_correction,
        ).map_err(|e| QRServiceError::Generation(e.to_string()))?;

        // Render as SVG
        let image = code.render()
            .min_dimensions(200, 200)
            .dark_color(svg::Color("#000000"))
            .light_color(svg::Color("#ffffff"))
            .build();

        Ok(BASE64.encode(image.as_bytes()))
    }

    /// Validates and decodes a QR code
    pub async fn validate_qr(
        &self,
        qr_data: &str,
    ) -> Result<PropertyQRData, QRServiceError> {
        // Decode JSON
        let data: PropertyQRData = serde_json::from_str(qr_data)
            .map_err(|e| QRServiceError::InvalidFormat(e.to_string()))?;

        // Verify property exists
        let property = self.property_service
            .get_property(data.property_id)
            .await
            .map_err(QRServiceError::Property)?;

        // Verify timestamp is not too old (e.g., within last 24 hours)
        let age = Utc::now() - data.timestamp;
        if age.num_hours() > 24 {
            return Err(QRServiceError::Verification("QR code has expired".to_string()));
        }

        // Verify custodian matches if present
        if let Some(qr_custodian) = &data.custodian {
            if property.custodian() != Some(qr_custodian) {
                return Err(QRServiceError::Verification(
                    "Property custodian has changed since QR generation".to_string()
                ));
            }
        }

        // Verify sensitive item status hasn't changed
        if data.is_sensitive != property.is_sensitive() {
            return Err(QRServiceError::Verification(
                "Property sensitive status has changed".to_string()
            ));
        }

        // Verify verification code format
        let code_parts: Vec<&str> = data.verification_code.split('-').collect();
        if code_parts.len() != 3 || code_parts[0] != "VERIFY" {
            return Err(QRServiceError::InvalidFormat(
                "Invalid verification code format".to_string()
            ));
        }

        Ok(data)
    }

    /// Generates a verification code
    fn generate_verification_code(&self) -> String {
        format!("VERIFY-{}-{}", 
            Uuid::new_v4().simple(),
            Utc::now().timestamp()
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::property::repository::mock::MockPropertyRepository;

    #[tokio::test]
    async fn test_qr_generation_and_validation() {
        // Setup
        let repository = Arc::new(MockPropertyRepository::new());
        let property_service = crate::domain::property::new_property_service(repository.clone());
        let qr_service = QRService::new(Arc::new(property_service));

        // Create test property
        let property = Property::new(
            "Test Item".to_string(),
            "Test Description".to_string(),
            Some("12345".to_string()),
            false,
            1,
            "Each".to_string(),
        ).unwrap();

        repository.create(property.clone()).await.unwrap();

        // Generate QR code
        let qr_data = qr_service.generate_property_qr(property.id()).await.unwrap();
        assert!(!qr_data.is_empty());

        // Validate QR code
        let decoded = qr_service.validate_qr(&qr_data).await.unwrap();
        assert_eq!(decoded.property_id, property.id());
        assert!(!decoded.is_sensitive);
    }

    #[tokio::test]
    async fn test_qr_validation_expired() {
        let repository = Arc::new(MockPropertyRepository::new());
        let property_service = crate::domain::property::new_property_service(repository.clone());
        let qr_service = QRService::new(Arc::new(property_service));

        // Create test property
        let property = Property::new(
            "Test Item".to_string(),
            "Test Description".to_string(),
            None,
            false,
            1,
            "Each".to_string(),
        ).unwrap();

        repository.create(property.clone()).await.unwrap();

        // Create expired QR data
        let expired_data = PropertyQRData {
            property_id: property.id(),
            verification_code: format!("VERIFY-{}-{}", Uuid::new_v4().simple(), Utc::now().timestamp()),
            timestamp: Utc::now() - chrono::Duration::hours(25),
            custodian: None,
            is_sensitive: false,
        };

        let qr_json = serde_json::to_string(&expired_data).unwrap();
        let result = qr_service.validate_qr(&qr_json).await;

        assert!(matches!(result, Err(QRServiceError::Verification(_))));
    }

    #[tokio::test]
    async fn test_qr_validation_custodian_changed() {
        let repository = Arc::new(MockPropertyRepository::new());
        let property_service = crate::domain::property::new_property_service(repository.clone());
        let qr_service = QRService::new(Arc::new(property_service));

        // Create test property
        let mut property = Property::new(
            "Test Item".to_string(),
            "Test Description".to_string(),
            None,
            false,
            1,
            "Each".to_string(),
        ).unwrap();

        // Set initial custodian
        property.assign_to("OLD_CUSTODIAN".to_string()).unwrap();
        repository.create(property.clone()).await.unwrap();

        // Create QR data with old custodian
        let qr_data = PropertyQRData {
            property_id: property.id(),
            verification_code: format!("VERIFY-{}-{}", Uuid::new_v4().simple(), Utc::now().timestamp()),
            timestamp: Utc::now(),
            custodian: Some("OLD_CUSTODIAN".to_string()),
            is_sensitive: false,
        };

        // Change custodian
        property.assign_to("NEW_CUSTODIAN".to_string()).unwrap();
        repository.update(property).await.unwrap();

        // Validate QR - should fail due to custodian mismatch
        let qr_json = serde_json::to_string(&qr_data).unwrap();
        let result = qr_service.validate_qr(&qr_json).await;

        assert!(matches!(result, Err(QRServiceError::Verification(_))));
    }
}
