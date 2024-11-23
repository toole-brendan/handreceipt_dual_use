use uuid::Uuid;
use chrono::{DateTime, Utc};
use qrcode::QrCode;
use qrcode::render::svg;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use serde::{Serialize, Deserialize};
use std::sync::Arc;

use crate::{
    domain::property::{
        Property,
        PropertyService,
    },
    error::CoreError,
    types::security::SecurityContext,
};

/// QR code data format
#[derive(Debug, Serialize, Deserialize)]
pub struct PropertyQRData {
    pub property_id: Uuid,
    pub verification_code: String,
    pub timestamp: DateTime<Utc>,
    pub custodian: Option<String>,
    pub is_sensitive: bool,
    pub command_id: Option<String>,
}

/// Service for handling QR code operations
pub struct PropertyQRServiceImpl {
    property_service: Arc<dyn PropertyService>,
    version: u8,
    error_correction: qrcode::EcLevel,
}

impl PropertyQRServiceImpl {
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

    /// Generates a verification code
    fn generate_verification_code(&self) -> String {
        use sha2::{Sha256, Digest};
        
        // Create a unique verification code using timestamp and a secret
        let secret = std::env::var("QR_SECRET").unwrap_or_else(|_| "default_secret".to_string());
        let timestamp = Utc::now().timestamp().to_string();
        let data = format!("{}:{}", timestamp, secret);
        
        // Hash the data
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        let result = hasher.finalize();
        
        // Take first 8 bytes and encode as hex
        hex::encode(&result[..8])
    }
}

#[async_trait::async_trait]
impl super::qr::PropertyQRService for PropertyQRServiceImpl {
    /// Generates a QR code for a property
    async fn generate_qr_code(
        &self,
        property_id: Uuid,
        context: &SecurityContext,
    ) -> Result<String, CoreError> {
        // Get property to ensure it exists and get current info
        let property = self.property_service
            .get_property(property_id, context)
            .await?
            .ok_or_else(|| CoreError::NotFound("Property not found".to_string()))?;

        // Create QR data
        let qr_data = PropertyQRData {
            property_id,
            verification_code: self.generate_verification_code(),
            timestamp: Utc::now(),
            custodian: property.custodian().cloned(),
            is_sensitive: property.is_sensitive(),
            command_id: context.command_id.clone(),
        };

        // Serialize to JSON
        let qr_json = serde_json::to_string(&qr_data)
            .map_err(|e| CoreError::Internal(format!("Failed to serialize QR data: {}", e)))?;

        // Generate QR code
        let code = QrCode::with_version(
            qr_json.as_bytes(),
            qrcode::Version::Normal(self.version),
            self.error_correction,
        ).map_err(|e| CoreError::Internal(format!("Failed to generate QR code: {}", e)))?;

        // Render as SVG
        let image = code.render()
            .min_dimensions(200, 200)
            .dark_color(svg::Color("#000000"))
            .light_color(svg::Color("#ffffff"))
            .build();

        Ok(BASE64.encode(image.as_bytes()))
    }

    /// Validates and decodes a QR code
    async fn validate_qr(
        &self,
        qr_data: &str,
        context: &SecurityContext,
    ) -> Result<Property, CoreError> {
        // Decode JSON
        let data: PropertyQRData = serde_json::from_str(qr_data)
            .map_err(|e| CoreError::Validation(format!("Invalid QR format: {}", e)))?;

        // Verify property exists
        let property = self.property_service
            .get_property(data.property_id, context)
            .await?
            .ok_or_else(|| CoreError::NotFound("Property not found".to_string()))?;

        // Verify timestamp is not too old (e.g., within last 24 hours)
        let age = Utc::now() - data.timestamp;
        if age.num_hours() > 24 {
            return Err(CoreError::Validation("QR code has expired".to_string()));
        }

        // Verify custodian matches if present
        if let Some(qr_custodian) = &data.custodian {
            if property.custodian() != Some(qr_custodian) {
                return Err(CoreError::Validation(
                    "Property custodian has changed since QR generation".to_string()
                ));
            }
        }

        // Verify sensitive item status hasn't changed
        if data.is_sensitive != property.is_sensitive() {
            return Err(CoreError::Validation(
                "Property sensitive status has changed".to_string()
            ));
        }

        // Verify command hierarchy
        if let Some(qr_command) = &data.command_id {
            if !context.can_access_command(qr_command) {
                return Err(CoreError::Permission(
                    "User cannot access property from this command".to_string()
                ));
            }
        }

        Ok(property)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::property::repository::mock::MockPropertyRepository;

    fn create_test_context() -> SecurityContext {
        SecurityContext {
            user_id: Uuid::new_v4(),
            command_id: Some("TEST_COMMAND".to_string()),
            role: "OFFICER".to_string(),
            ..Default::default()
        }
    }

    #[tokio::test]
    async fn test_qr_generation_and_validation() {
        // Setup
        let repository = Arc::new(MockPropertyRepository::new());
        let property_service = Arc::new(crate::domain::property::service::PropertyServiceImpl::new(repository.clone()));
        let qr_service = PropertyQRServiceImpl::new(property_service);
        let context = create_test_context();

        // Create test property
        let property = Property::new(
            "Test Item".to_string(),
            "Test Description".to_string(),
            crate::domain::property::entity::PropertyCategory::Equipment,
            false,
            1,
            "Each".to_string(),
        ).unwrap();

        repository.create(property.clone()).await.unwrap();

        // Generate QR code
        let qr_data = qr_service.generate_qr_code(property.id(), &context).await.unwrap();
        assert!(!qr_data.is_empty());

        // Validate QR code
        let validated = qr_service.validate_qr(&qr_data, &context).await.unwrap();
        assert_eq!(validated.id(), property.id());
        assert!(!validated.is_sensitive());
    }

    #[tokio::test]
    async fn test_qr_validation_expired() {
        let repository = Arc::new(MockPropertyRepository::new());
        let property_service = Arc::new(crate::domain::property::service::PropertyServiceImpl::new(repository.clone()));
        let qr_service = PropertyQRServiceImpl::new(property_service);
        let context = create_test_context();

        // Create test property
        let property = Property::new(
            "Test Item".to_string(),
            "Test Description".to_string(),
            crate::domain::property::entity::PropertyCategory::Equipment,
            false,
            1,
            "Each".to_string(),
        ).unwrap();

        repository.create(property.clone()).await.unwrap();

        // Create expired QR data
        let expired_data = PropertyQRData {
            property_id: property.id(),
            verification_code: "test-code".to_string(),
            timestamp: Utc::now() - chrono::Duration::hours(25),
            custodian: None,
            is_sensitive: false,
            command_id: Some("TEST_COMMAND".to_string()),
        };

        let qr_json = serde_json::to_string(&expired_data).unwrap();
        let result = qr_service.validate_qr(&qr_json, &context).await;

        assert!(matches!(result, Err(CoreError::Validation(_))));
    }
}
