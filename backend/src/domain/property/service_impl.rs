use async_trait::async_trait;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use super::{
    service::DomainPropertyService,
    repository::{PropertyRepository, RepositoryError, PropertySearchCriteria},
    entity::Property,
};
use crate::{
    error::CoreError,
    types::security::SecurityContext,
};

pub struct PropertyServiceImpl<R> {
    repository: R,
}

impl<R> PropertyServiceImpl<R> 
where
    R: PropertyRepository + Send + Sync
{
    pub fn new(repository: R) -> Self {
        Self { repository }
    }
}

#[async_trait]
impl<R> DomainPropertyService for PropertyServiceImpl<R>
where
    R: PropertyRepository + Send + Sync
{
    async fn create_property(
        &self,
        property: Property,
        context: &SecurityContext,
    ) -> Result<Property, CoreError> {
        if property.is_sensitive() && !context.can_handle_sensitive_items() {
            return Err(CoreError::Authorization("Cannot create sensitive items".into()));
        }

        self.repository
            .create(property)
            .await
            .map_err(|e| CoreError::Repository(e.to_string()))
    }

    async fn get_property(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<Option<Property>, CoreError> {
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

    async fn update_property(
        &self,
        property: &Property,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        if property.is_sensitive() && !context.can_handle_sensitive_items() {
            return Err(CoreError::Authorization("Cannot update sensitive items".into()));
        }

        self.repository
            .update(property.clone())
            .await
            .map_err(|e| CoreError::Repository(e.to_string()))?;
        Ok(())
    }

    async fn delete_property(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        let property = match self.get_property(id, context).await? {
            Some(prop) => prop,
            None => return Err(CoreError::NotFound("Property not found".into())),
        };

        self.repository
            .delete(id)
            .await
            .map_err(|e| CoreError::Repository(e.to_string()))
    }

    async fn search(
        &self,
        criteria: PropertySearchCriteria,
        _context: &SecurityContext,
    ) -> Result<Vec<Property>, CoreError> {
        self.repository
            .search(criteria)
            .await
            .map_err(|e| CoreError::Repository(e.to_string()))
    }

    async fn get_current_holder(
        &self,
        property: &Property,
        context: &SecurityContext,
    ) -> Result<Option<(String, DateTime<Utc>, String)>, CoreError> {
        if property.is_sensitive() && !context.can_handle_sensitive_items() {
            return Err(CoreError::Authorization("Cannot access sensitive items".into()));
        }

        let latest_transfer = self.repository
            .get_latest_transfer(property.id())
            .await
            .map_err(|e| CoreError::Repository(e.to_string()))?;

        Ok(latest_transfer.map(|t| (
            t.to_custodian,
            t.transfer_date,
            t.hand_receipt_number.unwrap_or_default()
        )))
    }
} 