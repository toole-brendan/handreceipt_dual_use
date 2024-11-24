use std::sync::Arc;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::error::CoreError;

use super::{
    entity::{Property, PropertyStatus, PropertyCondition, Location},
    repository::{PropertyRepository, PropertySearchCriteria, RepositoryError},
};

/// Property service interface
#[async_trait]
pub trait PropertyService: Send + Sync {
    /// Creates a new property item
    async fn create_property(&self, property: Property, context: &SecurityContext) -> Result<Property, CoreError>;

    /// Gets a property by ID 
    async fn get_property(&self, id: Uuid, context: &SecurityContext) -> Result<Option<Property>, CoreError>;

    /// Updates an existing property
    async fn update_property(&self, property: &Property, context: &SecurityContext) -> Result<(), CoreError>;

    /// Deletes a property
    async fn delete_property(&self, id: Uuid, context: &SecurityContext) -> Result<(), CoreError>;

    /// Lists all properties
    async fn list_properties(&self, context: &SecurityContext) -> Result<Vec<Property>, CoreError>;

    /// Gets properties for a custodian
    async fn get_properties_by_custodian(&self, custodian: &str, context: &SecurityContext) -> Result<Vec<Property>, CoreError>;

    /// Gets sensitive items
    async fn get_sensitive_items(&self, context: &SecurityContext) -> Result<Vec<Property>, CoreError>;

    /// Gets properties for a command
    async fn get_properties_by_command(&self, command_id: &str, context: &SecurityContext) -> Result<Vec<Property>, CoreError>;

    /// Gets current holder of a property
    async fn get_current_holder(&self, property: &Property, context: &SecurityContext) -> Result<Option<(String, DateTime<Utc>, String)>, CoreError>;
}

/// Implementation of property service
pub struct PropertyServiceImpl {
    repository: Arc<dyn PropertyRepository>,
}

impl PropertyServiceImpl {
    pub fn new(repository: Arc<dyn PropertyRepository>) -> Self {
        Self { repository }
    }
}

#[async_trait]
impl PropertyService for PropertyServiceImpl {
    async fn create_property(&self, property: Property, context: &SecurityContext) -> Result<Property, CoreError> {
        self.repository.create(property)
            .await
            .map_err(|e| CoreError::Repository(Box::new(e)))
    }

    async fn get_property(&self, id: Uuid, context: &SecurityContext) -> Result<Option<Property>, CoreError> {
        self.repository.get_by_id(id)
            .await
            .map_err(|e| CoreError::Repository(Box::new(e)))
    }

    async fn update_property(&self, property: &Property, context: &SecurityContext) -> Result<(), CoreError> {
        self.repository.update(property.clone())
            .await
            .map(|_| ())
            .map_err(|e| CoreError::Repository(Box::new(e)))
    }

    async fn delete_property(&self, id: Uuid, context: &SecurityContext) -> Result<(), CoreError> {
        self.repository.delete(id)
            .await
            .map_err(|e| CoreError::Repository(Box::new(e)))
    }

    async fn list_properties(&self, context: &SecurityContext) -> Result<Vec<Property>, CoreError> {
        let criteria = PropertySearchCriteria::default();
        self.repository.search(&criteria)
            .await
            .map_err(|e| CoreError::Repository(Box::new(e)))
    }

    async fn get_properties_by_custodian(&self, custodian: &str, context: &SecurityContext) -> Result<Vec<Property>, CoreError> {
        let mut criteria = PropertySearchCriteria::default();
        criteria.custodian = Some(custodian.to_string());
        self.repository.search(&criteria)
            .await
            .map_err(|e| CoreError::Repository(Box::new(e)))
    }

    async fn get_sensitive_items(&self, context: &SecurityContext) -> Result<Vec<Property>, CoreError> {
        let mut criteria = PropertySearchCriteria::default();
        criteria.is_sensitive = Some(true);
        self.repository.search(&criteria)
            .await
            .map_err(|e| CoreError::Repository(Box::new(e)))
    }

    async fn get_properties_by_command(&self, command_id: &str, context: &SecurityContext) -> Result<Vec<Property>, CoreError> {
        let mut criteria = PropertySearchCriteria::default();
        criteria.command_id = Some(command_id.to_string());
        self.repository.search(&criteria)
            .await
            .map_err(|e| CoreError::Repository(Box::new(e)))
    }

    async fn get_current_holder(&self, property: &Property, context: &SecurityContext) -> Result<Option<(String, DateTime<Utc>, String)>, CoreError> {
        // TODO: Implement getting current holder from property history
        Ok(None)
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

        let property = Property::new(
            "Test Item".to_string(),
            "Test Description".to_string(),
            None,
            false,
            1,
            "Each".to_string()
        ).unwrap();

        let result = service.create_property(property).await;
        assert!(result.is_ok());
    }
}
