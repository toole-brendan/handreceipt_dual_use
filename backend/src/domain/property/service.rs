use async_trait::async_trait;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::{
    error::CoreError,
    types::{
        security::SecurityContext,
        app::PropertyService,
    },
};

use super::{
    entity::{Property, PropertyStatus, PropertyCategory},
    repository::{PropertyRepository, PropertySearchCriteria, RepositoryError},
};

// Add the domain service trait definition
#[async_trait]
pub trait DomainPropertyService: Send + Sync {
    async fn create_property(
        &self,
        property: Property,
        context: &SecurityContext,
    ) -> Result<Property, CoreError>;

    async fn get_property(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<Option<Property>, CoreError>;

    async fn update_property(
        &self,
        property: &Property,
        context: &SecurityContext,
    ) -> Result<(), CoreError>;

    async fn delete_property(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<(), CoreError>;

    async fn search(
        &self,
        criteria: PropertySearchCriteria,
        context: &SecurityContext,
    ) -> Result<Vec<Property>, CoreError>;

    async fn get_current_holder(
        &self,
        property: &Property,
        context: &SecurityContext,
    ) -> Result<Option<(String, DateTime<Utc>, String)>, CoreError>;
}

// Keep the existing PropertyServiceImpl implementation
pub struct PropertyServiceImpl<R: PropertyRepository> {
    repository: R,
}

impl<R: PropertyRepository> PropertyServiceImpl<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }
}

#[async_trait]
impl<R: PropertyRepository + Send + Sync> PropertyService for PropertyServiceImpl<R> {
    async fn create_property(&self, mut property: Property, context: &SecurityContext) -> Result<Property, CoreError> {
        if property.is_sensitive() && !context.can_handle_sensitive_items() {
            return Err(CoreError::Authorization("Cannot create sensitive items".into()));
        }

        property.add_history_entry(
            "CREATE",
            "Property created",
            Some(context.user_id.to_string()),
            None,
        );

        self.repository
            .create(property)
            .await
            .map_err(|e| CoreError::Repository(e.to_string()))
    }

    async fn get_property(&self, id: Uuid, context: &SecurityContext) -> Result<Option<Property>, CoreError> {
        match self.repository.get_by_id(id).await {
            Ok(property) => {
                if property.is_sensitive() && !context.can_handle_sensitive_items() {
                    return Err(CoreError::Authorization("Cannot view sensitive items".into()));
                }
                Ok(Some(property))
            },
            Err(RepositoryError::NotFound) => Ok(None),
            Err(e) => Err(CoreError::Repository(e.to_string())),
        }
    }

    async fn update_property(&self, property: &Property, context: &SecurityContext) -> Result<(), CoreError> {
        if property.is_sensitive() && !context.can_handle_sensitive_items() {
            return Err(CoreError::Authorization("Cannot update sensitive items".into()));
        }

        let mut updated = property.clone();
        updated.add_history_entry(
            "UPDATE",
            "Property updated",
            Some(context.user_id.to_string()),
            None,
        );

        self.repository
            .update(updated)
            .await
            .map_err(|e| CoreError::Repository(e.to_string()))?;
            
        Ok(())
    }

    async fn list_properties(&self, context: &SecurityContext) -> Result<Vec<Property>, CoreError> {
        let mut criteria = PropertySearchCriteria::default();
        
        if !context.can_handle_sensitive_items() {
            criteria.is_sensitive = Some(false);
        }

        self.repository
            .search(criteria)
            .await
            .map_err(|e| CoreError::Repository(e.to_string()))
    }

    async fn delete_property(&self, id: Uuid, context: &SecurityContext) -> Result<(), CoreError> {
        let property = match self.get_property(id, context).await? {
            Some(prop) => prop,
            None => return Err(CoreError::NotFound("Property not found".into())),
        };

        self.repository
            .delete(id)
            .await
            .map_err(|e| CoreError::Repository(e.to_string()))
    }
}
