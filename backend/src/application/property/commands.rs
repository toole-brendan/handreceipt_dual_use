use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use std::sync::Arc;

use crate::domain::{
    models::qr::{QRCodeService, QRFormat, QRResponse},
    property::{
        entity::{Property, PropertyStatus, PropertyCondition, Location},
        service::PropertyService,
    },
};
use crate::error::CoreError;
use crate::types::security::SecurityContext;

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterPropertyCommand {
    pub name: String,
    pub description: String,
    pub nsn: Option<String>,
    pub serial_number: Option<String>,
    pub is_sensitive: bool,
    pub quantity: i32,
    pub unit_of_measure: String,
    pub location: Option<Location>,
    pub condition: PropertyCondition,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PropertyRegistrationResult {
    pub property: Property,
    pub qr_code: QRResponse,
}

pub struct PropertyCommandService {
    property_service: Arc<dyn PropertyService>,
    qr_service: Arc<dyn QRCodeService>,
}

impl PropertyCommandService {
    pub fn new(
        property_service: Arc<dyn PropertyService>,
        qr_service: Arc<dyn QRCodeService>,
    ) -> Self {
        Self {
            property_service,
            qr_service,
        }
    }

    /// Registers a new property item with QR code
    pub async fn register_property(
        &self,
        command: RegisterPropertyCommand,
        context: &SecurityContext,
    ) -> Result<PropertyRegistrationResult, CoreError> {
        // Create property
        let property = Property::new(
            command.name,
            command.description,
            command.nsn,
            command.is_sensitive,
            command.quantity,
            command.unit_of_measure,
        )?;

        // Set additional fields
        let mut property = property
            .with_serial_number(command.serial_number)
            .with_location(command.location)
            .with_condition(command.condition);

        // Save property
        let property = self.property_service.create_property(property, context).await?;

        // Generate QR code
        let qr_code = self.qr_service.generate_qr(
            property.id(),
            QRFormat::PNG,
            context,
        ).await?;

        Ok(PropertyRegistrationResult {
            property,
            qr_code,
        })
    }

    /// Updates property status and records history
    pub async fn update_property_status(
        &self,
        property_id: Uuid,
        new_status: PropertyStatus,
        notes: Option<String>,
        context: &SecurityContext,
    ) -> Result<Property, CoreError> {
        // Get existing property
        let mut property = self.property_service
            .get_property(property_id, context)
            .await?
            .ok_or_else(|| CoreError::NotFound("Property not found".into()))?;

        // Update status
        property.update_status(new_status, Utc::now());

        // Add history entry if notes provided
        if let Some(notes) = notes {
            property.add_history_entry(
                context.user_id,
                format!("Status updated to {:?}: {}", new_status, notes),
                Utc::now(),
            );
        }

        // Save changes
        self.property_service.update_property(&property, context).await?;

        Ok(property)
    }

    /// Updates property condition and records history
    pub async fn update_property_condition(
        &self,
        property_id: Uuid,
        new_condition: PropertyCondition,
        notes: Option<String>,
        context: &SecurityContext,
    ) -> Result<Property, CoreError> {
        // Get existing property
        let mut property = self.property_service
            .get_property(property_id, context)
            .await?
            .ok_or_else(|| CoreError::NotFound("Property not found".into()))?;

        // Update condition
        property.update_condition(new_condition, Utc::now());

        // Add history entry if notes provided
        if let Some(notes) = notes {
            property.add_history_entry(
                context.user_id,
                format!("Condition updated to {:?}: {}", new_condition, notes),
                Utc::now(),
            );
        }

        // Save changes
        self.property_service.update_property(&property, context).await?;

        Ok(property)
    }

    /// Updates property location and records history
    pub async fn update_property_location(
        &self,
        property_id: Uuid,
        new_location: Location,
        notes: Option<String>,
        context: &SecurityContext,
    ) -> Result<Property, CoreError> {
        // Get existing property
        let mut property = self.property_service
            .get_property(property_id, context)
            .await?
            .ok_or_else(|| CoreError::NotFound("Property not found".into()))?;

        // Update location
        property.update_location(new_location.clone(), Utc::now());

        // Add history entry if notes provided
        if let Some(notes) = notes {
            property.add_history_entry(
                context.user_id,
                format!("Location updated to {:?}: {}", new_location, notes),
                Utc::now(),
            );
        }

        // Save changes
        self.property_service.update_property(&property, context).await?;

        Ok(property)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::{
        property::repository::mock::MockPropertyRepository,
        models::qr::QRCodeServiceImpl,
    };
    use ed25519_dalek::SigningKey;
    use rand::rngs::OsRng;

    fn create_test_services() -> PropertyCommandService {
        let repository = Arc::new(MockPropertyRepository::new());
        let property_service = Arc::new(PropertyServiceImpl::new(repository));
        
        let signing_key = SigningKey::generate(&mut OsRng);
        let qr_service = Arc::new(QRCodeServiceImpl::new(signing_key));
        
        PropertyCommandService::new(property_service, qr_service)
    }

    #[tokio::test]
    async fn test_register_property() {
        let service = create_test_services();
        let context = SecurityContext::default(); // Mock context for testing

        let command = RegisterPropertyCommand {
            name: "Test Item".to_string(),
            description: "Test Description".to_string(),
            nsn: None,
            serial_number: None,
            is_sensitive: false,
            quantity: 1,
            unit_of_measure: "Each".to_string(),
            location: None,
            condition: PropertyCondition::Serviceable,
        };

        let result = service.register_property(command, &context).await;
        assert!(result.is_ok());

        let registration = result.unwrap();
        assert_eq!(registration.property.name(), "Test Item");
        assert!(registration.qr_code.qr_code.len() > 0);
    }
}
