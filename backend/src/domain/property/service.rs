use std::sync::Arc;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;

use super::{
    entity::{Property, PropertyStatus, PropertyCondition, Location},
    repository::{PropertyRepository, PropertySearchCriteria, RepositoryError},
};

/// Errors that can occur in property service operations
#[derive(Debug, thiserror::Error)]
pub enum PropertyServiceError {
    #[error("Repository error: {0}")]
    Repository(#[from] RepositoryError),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Business rule violation: {0}")]
    BusinessRule(String),

    #[error("Authorization error: {0}")]
    Authorization(String),
}

/// Input data for creating new property
#[derive(Debug)]
pub struct CreatePropertyInput {
    pub name: String,
    pub description: String,
    pub nsn: Option<String>,
    pub serial_number: Option<String>,
    pub model_number: Option<String>,
    pub is_sensitive: bool,
    pub quantity: i32,
    pub unit_of_issue: String,
    pub value: Option<f64>,
    pub location: Option<Location>,
}

/// Property service interface
#[async_trait]
pub trait PropertyService: Send + Sync {
    /// Creates a new property item
    async fn create_property(
        &self,
        input: CreatePropertyInput,
        created_by: String,
    ) -> Result<Property, PropertyServiceError>;

    /// Gets a property by ID
    async fn get_property(
        &self,
        id: Uuid,
    ) -> Result<Property, PropertyServiceError>;

    /// Gets property by QR code
    async fn get_property_by_qr(
        &self,
        qr_code: &str,
    ) -> Result<Property, PropertyServiceError>;

    /// Updates property location
    async fn update_location(
        &self,
        id: Uuid,
        location: Location,
        updated_by: String,
    ) -> Result<Property, PropertyServiceError>;

    /// Updates property condition
    async fn update_condition(
        &self,
        id: Uuid,
        condition: PropertyCondition,
        notes: Option<String>,
        updated_by: String,
    ) -> Result<Property, PropertyServiceError>;

    /// Records an inventory check
    async fn record_inventory(
        &self,
        id: Uuid,
        checked_by: String,
        condition: Option<PropertyCondition>,
        notes: Option<String>,
    ) -> Result<Property, PropertyServiceError>;

    /// Gets all property for a custodian
    async fn get_custodian_property(
        &self,
        custodian: &str,
    ) -> Result<Vec<Property>, PropertyServiceError>;

    /// Gets sensitive items for a custodian
    async fn get_custodian_sensitive_items(
        &self,
        custodian: &str,
    ) -> Result<Vec<Property>, PropertyServiceError>;

    /// Gets property needing inventory
    async fn get_property_needing_inventory(
        &self,
        threshold: chrono::Duration,
    ) -> Result<Vec<Property>, PropertyServiceError>;

    /// Generates QR code for property
    async fn generate_qr_code(
        &self,
        id: Uuid,
    ) -> Result<String, PropertyServiceError>;
}

/// Implementation of property service
pub struct PropertyServiceImpl {
    repository: Arc<dyn PropertyRepository>,
}

impl PropertyServiceImpl {
    pub fn new(repository: Arc<dyn PropertyRepository>) -> Self {
        Self { repository }
    }

    /// Validates property input data
    fn validate_input(&self, input: &CreatePropertyInput) -> Result<(), PropertyServiceError> {
        if input.name.trim().is_empty() {
            return Err(PropertyServiceError::Validation("Name cannot be empty".to_string()));
        }
        if input.description.trim().is_empty() {
            return Err(PropertyServiceError::Validation("Description cannot be empty".to_string()));
        }
        if input.quantity <= 0 {
            return Err(PropertyServiceError::Validation("Quantity must be positive".to_string()));
        }
        if input.unit_of_issue.trim().is_empty() {
            return Err(PropertyServiceError::Validation("Unit of issue cannot be empty".to_string()));
        }
        Ok(())
    }

    /// Generates a QR code string for a property item
    fn generate_qr_string(&self, property: &Property) -> String {
        // Format: id|name|nsn|serial
        let mut qr_data = vec![
            property.id().to_string(),
            property.name().to_string(),
        ];

        if let Some(nsn) = property.nsn() {
            qr_data.push(nsn.clone());
        }
        if let Some(serial) = property.serial_number() {
            qr_data.push(serial.clone());
        }

        qr_data.join("|")
    }
}

#[async_trait]
impl PropertyService for PropertyServiceImpl {
    async fn create_property(
        &self,
        input: CreatePropertyInput,
        created_by: String,
    ) -> Result<Property, PropertyServiceError> {
        // Validate input
        self.validate_input(&input)?;

        // Check for duplicate serial number if provided
        if let Some(serial) = &input.serial_number {
            if let Some(_existing) = self.repository.get_by_serial(serial).await? {
                return Err(PropertyServiceError::Validation(
                    "Serial number already exists".to_string()
                ));
            }
        }

        // Create property
        let mut property = Property::new(
            input.name,
            input.description,
            input.nsn,
            input.is_sensitive,
            input.quantity,
            input.unit_of_issue,
        ).map_err(|e| PropertyServiceError::Validation(e))?;

        // Set additional fields
        if let Some(serial) = input.serial_number {
            property.update_metadata("serial_number".to_string(), serial)
                .map_err(|e| PropertyServiceError::Validation(e))?;
        }
        if let Some(model) = input.model_number {
            property.update_metadata("model_number".to_string(), model)
                .map_err(|e| PropertyServiceError::Validation(e))?;
        }
        if let Some(value) = input.value {
            property.update_metadata("value".to_string(), value.to_string())
                .map_err(|e| PropertyServiceError::Validation(e))?;
        }
        if let Some(location) = input.location {
            property.update_location(location);
        }

        // Generate and set QR code
        let qr_code = self.generate_qr_string(&property);
        property.set_qr_code(qr_code);

        // Record creator
        property.update_metadata("created_by".to_string(), created_by)
            .map_err(|e| PropertyServiceError::Validation(e))?;

        // Save to repository
        let property = self.repository.create(property).await?;
        Ok(property)
    }

    async fn get_property(
        &self,
        id: Uuid,
    ) -> Result<Property, PropertyServiceError> {
        self.repository.get_by_id(id)
            .await
            .map_err(PropertyServiceError::Repository)
    }

    async fn get_property_by_qr(
        &self,
        qr_code: &str,
    ) -> Result<Property, PropertyServiceError> {
        self.repository.get_by_qr_code(qr_code)
            .await?
            .ok_or_else(|| PropertyServiceError::NotFound("Property not found".to_string()))
    }

    async fn update_location(
        &self,
        id: Uuid,
        location: Location,
        updated_by: String,
    ) -> Result<Property, PropertyServiceError> {
        let mut property = self.repository.get_by_id(id).await?;
        
        property.update_location(location);
        property.update_metadata("location_updated_by".to_string(), updated_by)
            .map_err(|e| PropertyServiceError::Validation(e))?;

        self.repository.update(property).await
            .map_err(PropertyServiceError::Repository)
    }

    async fn update_condition(
        &self,
        id: Uuid,
        condition: PropertyCondition,
        notes: Option<String>,
        updated_by: String,
    ) -> Result<Property, PropertyServiceError> {
        let mut property = self.repository.get_by_id(id).await?;
        
        property.update_condition(condition);
        if let Some(notes) = notes {
            property.update_metadata("condition_notes".to_string(), notes)
                .map_err(|e| PropertyServiceError::Validation(e))?;
        }
        property.update_metadata("condition_updated_by".to_string(), updated_by)
            .map_err(|e| PropertyServiceError::Validation(e))?;

        self.repository.update(property).await
            .map_err(PropertyServiceError::Repository)
    }

    async fn record_inventory(
        &self,
        id: Uuid,
        checked_by: String,
        condition: Option<PropertyCondition>,
        notes: Option<String>,
    ) -> Result<Property, PropertyServiceError> {
        let mut property = self.repository.get_by_id(id).await?;
        
        property.record_inventory();
        if let Some(condition) = condition {
            property.update_condition(condition);
        }
        if let Some(notes) = notes {
            property.update_metadata("inventory_notes".to_string(), notes)
                .map_err(|e| PropertyServiceError::Validation(e))?;
        }
        property.update_metadata("inventory_by".to_string(), checked_by)
            .map_err(|e| PropertyServiceError::Validation(e))?;

        self.repository.update(property).await
            .map_err(PropertyServiceError::Repository)
    }

    async fn get_custodian_property(
        &self,
        custodian: &str,
    ) -> Result<Vec<Property>, PropertyServiceError> {
        self.repository.get_by_custodian(custodian)
            .await
            .map_err(PropertyServiceError::Repository)
    }

    async fn get_custodian_sensitive_items(
        &self,
        custodian: &str,
    ) -> Result<Vec<Property>, PropertyServiceError> {
        self.repository.get_sensitive_by_custodian(custodian)
            .await
            .map_err(PropertyServiceError::Repository)
    }

    async fn get_property_needing_inventory(
        &self,
        threshold: chrono::Duration,
    ) -> Result<Vec<Property>, PropertyServiceError> {
        self.repository.get_needing_inventory(threshold)
            .await
            .map_err(PropertyServiceError::Repository)
    }

    async fn generate_qr_code(
        &self,
        id: Uuid,
    ) -> Result<String, PropertyServiceError> {
        let property = self.repository.get_by_id(id).await?;
        Ok(self.generate_qr_string(&property))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::property::repository::mock::MockPropertyRepository;

    #[tokio::test]
    async fn test_create_property() {
        let repository = Arc::new(MockPropertyRepository::new());
        let service = PropertyServiceImpl::new(repository);

        let input = CreatePropertyInput {
            name: "M4 Carbine".to_string(),
            description: "5.56mm Rifle".to_string(),
            nsn: Some("1005-01-231-0973".to_string()),
            serial_number: Some("123456".to_string()),
            model_number: Some("M4A1".to_string()),
            is_sensitive: true,
            quantity: 1,
            unit_of_issue: "Each".to_string(),
            value: Some(750.0),
            location: None,
        };

        let result = service.create_property(input, "TEST_USER".to_string()).await;
        assert!(result.is_ok());

        let property = result.unwrap();
        assert_eq!(property.name(), "M4 Carbine");
        assert!(property.is_sensitive());
        assert_eq!(property.quantity(), 1);
    }

    #[tokio::test]
    async fn test_inventory_check() {
        let repository = Arc::new(MockPropertyRepository::new());
        let service = PropertyServiceImpl::new(repository.clone());

        // Create test property
        let input = CreatePropertyInput {
            name: "Test Item".to_string(),
            description: "Test Description".to_string(),
            nsn: None,
            serial_number: None,
            model_number: None,
            is_sensitive: false,
            quantity: 1,
            unit_of_issue: "Each".to_string(),
            value: None,
            location: None,
        };

        let property = service.create_property(input, "TEST_USER".to_string()).await.unwrap();
        
        // Record inventory
        let result = service.record_inventory(
            property.id(),
            "TEST_USER".to_string(),
            Some(PropertyCondition::Serviceable),
            Some("Inventory complete".to_string()),
        ).await;

        assert!(result.is_ok());
    }
}
