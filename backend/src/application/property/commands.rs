use async_trait::async_trait;
use std::sync::Arc;

use crate::{
    domain::{
        property::{
            entity::Property,
            repository::PropertyRepository,
        },
    },
    error::validation::ValidationError,
    types::security::SecurityContext,
};
use super::validation::PropertyValidator;

pub struct PropertyCommand {
    repository: Arc<dyn PropertyRepository + Send + Sync>,
    validator: PropertyValidator,
}

impl PropertyCommand {
    pub fn new(repository: Arc<dyn PropertyRepository + Send + Sync>) -> Self {
        Self {
            repository: repository.clone(),
            validator: PropertyValidator::new(repository),
        }
    }

    pub async fn create_property(
        &self,
        mut property: Property,
        context: &SecurityContext,
    ) -> Result<Property, ValidationError> {
        // Validate
        self.validator
            .validate_create(&property, context)
            .await?;

        // Create
        self.repository
            .create_property(property)
            .await
            .map_err(|e| ValidationError::Repository(e.to_string()))
    }

    pub async fn update_property(
        &self,
        property: &Property,
        context: &SecurityContext,
    ) -> Result<(), ValidationError> {
        // Validate
        self.validator
            .validate_update(property, context)
            .await?;

        // Update
        self.repository
            .update_property(property)
            .await
            .map_err(|e| ValidationError::Repository(e.to_string()))
    }

    pub async fn delete_property(
        &self,
        id: i32,
        context: &SecurityContext,
    ) -> Result<(), ValidationError> {
        // Validate
        self.validator
            .validate_delete(id, context)
            .await?;

        // Delete
        self.repository
            .delete_property(id)
            .await
            .map_err(|e| ValidationError::Repository(e.to_string()))
    }

    pub async fn get_property(
        &self,
        id: i32,
        context: &SecurityContext,
    ) -> Result<Option<Property>, ValidationError> {
        // Validate
        self.validator
            .validate_read(id, context)
            .await?;

        // Get
        self.repository
            .get_property(id)
            .await
            .map_err(|e| ValidationError::Repository(e.to_string()))
    }

    pub async fn list_properties(
        &self,
        context: &SecurityContext,
    ) -> Result<Vec<Property>, ValidationError> {
        // Validate
        self.validator
            .validate_list(context)
            .await?;

        // List
        self.repository
            .list_properties()
            .await
            .map_err(|e| ValidationError::Repository(e.to_string()))
    }
}
