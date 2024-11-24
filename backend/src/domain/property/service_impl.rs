use std::sync::Arc;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;

use super::{
    service::DomainPropertyService,
    repository::{PropertyRepository, PropertySearchCriteria, RepositoryError},
    entity::{Property, PropertyStatus, PropertyCondition},
};
use crate::{
    error::CoreError,
    types::security::SecurityContext,
    domain::models::location::Location,
};

pub struct PropertyServiceImpl {
    repository: Arc<dyn PropertyRepository>,
}

impl PropertyServiceImpl {
    pub fn new(repository: Arc<dyn PropertyRepository>) -> Self {
        Self { repository }
    }

    async fn validate_sensitive_access(
        &self,
        property: &Property,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        if property.is_sensitive() && !context.can_handle_sensitive_items() {
            return Err(CoreError::Authorization(
                "Cannot access sensitive items without proper permissions".into()
            ));
        }
        Ok(())
    }
}

#[async_trait]
impl DomainPropertyService for PropertyServiceImpl {
    async fn create_property(
        &self,
        mut property: Property,
        context: &SecurityContext,
    ) -> Result<Property, CoreError> {
        self.validate_sensitive_access(&property, context).await?;

        property.add_history_entry(
            "CREATE",
            "Property created",
            Some(context.user_id.to_string()),
            None,
        );

        self.repository.create(property).await
            .map_err(|e| CoreError::Database(e.to_string()))
    }

    async fn get_property(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<Option<Property>, CoreError> {
        // Get property from repository
        match self.repository.get_by_id(id).await {
            Ok(property) => {
                // Validate access if property exists
                if property.is_sensitive() && !context.can_handle_sensitive_items() {
                    return Err(CoreError::Authorization(
                        "Cannot access sensitive items without proper permissions".into()
                    ));
                }
                Ok(Some(property))
            },
            Err(RepositoryError::NotFound) => Ok(None),
            Err(e) => Err(CoreError::Database(e.to_string())),
        }
    }

    async fn update_property(
        &self,
        property: &Property,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        self.validate_sensitive_access(property, context).await?;

        let mut updated = property.clone();
        updated.add_history_entry(
            "UPDATE",
            "Property updated",
            Some(context.user_id.to_string()),
            None,
        );

        self.repository.update(updated).await
            .map_err(|e| CoreError::Database(e.to_string()))?;
            
        Ok(())
    }

    async fn delete_property(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        // Check if property exists and validate access
        let property = match self.get_property(id, context).await? {
            Some(prop) => prop,
            None => return Err(CoreError::NotFound("Property not found".into())),
        };

        // Add deletion history entry
        let mut updated = property.clone();
        updated.add_history_entry(
            "DELETE",
            "Property deleted",
            Some(context.user_id.to_string()),
            None,
        );

        // Delete from repository
        self.repository.delete(id).await
            .map_err(|e| CoreError::Database(e.to_string()))
    }

    async fn search(
        &self,
        mut criteria: PropertySearchCriteria,
        context: &SecurityContext,
    ) -> Result<Vec<Property>, CoreError> {
        // Filter sensitive items based on permissions
        if !context.can_handle_sensitive_items() {
            criteria.is_sensitive = Some(false);
        }

        self.repository.search(criteria).await
            .map_err(|e| CoreError::Database(e.to_string()))
    }

    async fn get_current_holder(
        &self,
        property: &Property,
        context: &SecurityContext,
    ) -> Result<Option<(String, DateTime<Utc>, String)>, CoreError> {
        self.validate_sensitive_access(property, context).await?;

        // Get latest transfer record
        let latest_transfer = self.repository
            .get_latest_transfer(property.id())
            .await
            .map_err(|e| CoreError::Database(e.to_string()))?;

        // Return current holder info if available
        Ok(latest_transfer.map(|transfer| (
            transfer.to_custodian,
            transfer.transfer_date,
            transfer.hand_receipt_number.unwrap_or_default()
        )))
    }
} 