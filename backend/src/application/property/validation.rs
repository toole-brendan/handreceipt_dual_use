use std::sync::Arc;
use crate::{
    domain::property::{
        entity::Property,
        repository::PropertyRepository,
    },
    error::validation::ValidationError,
    types::security::SecurityContext,
};

pub struct PropertyValidator {
    repository: Arc<dyn PropertyRepository + Send + Sync>,
}

impl PropertyValidator {
    pub fn new(repository: Arc<dyn PropertyRepository + Send + Sync>) -> Self {
        Self { repository }
    }

    pub async fn validate_create(&self, property: &Property, context: &SecurityContext) -> Result<(), ValidationError> {
        // Check if user has permission to create properties
        if !context.can_create_property() {
            return Err(ValidationError::Authorization("User does not have permission to create properties".to_string()));
        }

        // Add any additional validation rules here
        Ok(())
    }

    pub async fn validate_update(&self, property: &Property, context: &SecurityContext) -> Result<(), ValidationError> {
        // Check if property exists
        let existing = self.repository
            .get_property(property.id)
            .await
            .map_err(|e| ValidationError::Repository(e.to_string()))?
            .ok_or_else(|| ValidationError::NotFound("Property not found".to_string()))?;

        // Check if user has permission to update properties
        if !context.can_update_property() {
            return Err(ValidationError::Authorization("User does not have permission to update properties".to_string()));
        }

        // Add any additional validation rules here
        Ok(())
    }

    pub async fn validate_delete(&self, id: i32, context: &SecurityContext) -> Result<(), ValidationError> {
        // Check if property exists
        let existing = self.repository
            .get_property(id)
            .await
            .map_err(|e| ValidationError::Repository(e.to_string()))?
            .ok_or_else(|| ValidationError::NotFound("Property not found".to_string()))?;

        // Check if user has permission to delete properties
        if !context.can_delete_property() {
            return Err(ValidationError::Authorization("User does not have permission to delete properties".to_string()));
        }

        // Add any additional validation rules here
        Ok(())
    }

    pub async fn validate_read(&self, id: i32, context: &SecurityContext) -> Result<(), ValidationError> {
        // Check if user has permission to read properties
        if !context.can_read_property() {
            return Err(ValidationError::Authorization("User does not have permission to read properties".to_string()));
        }

        Ok(())
    }

    pub async fn validate_list(&self, context: &SecurityContext) -> Result<(), ValidationError> {
        // Check if user has permission to list properties
        if !context.can_read_property() {
            return Err(ValidationError::Authorization("User does not have permission to list properties".to_string()));
        }

        Ok(())
    }
} 