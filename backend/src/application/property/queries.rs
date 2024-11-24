use std::sync::Arc;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};

use crate::domain::property::{
    service::PropertyService,
    entity::{Property, PropertyStatus, PropertyCategory},
    repository::PropertySearchCriteria,
};
use crate::error::CoreError;
use crate::types::{
    security::SecurityContext,
    permissions::{Permission, ResourceType, Action},
};

#[derive(Debug, Serialize, Deserialize)]
pub struct PropertyBookView {
    pub properties: Vec<Property>,
    pub total_count: usize,
    pub sensitive_items_count: usize,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PropertyHistoryEntry {
    pub timestamp: DateTime<Utc>,
    pub user_id: Uuid,
    pub action: String,
    pub details: String,
}

pub struct PropertyQueryService {
    property_service: Arc<dyn PropertyService>,
}

impl PropertyQueryService {
    pub fn new(property_service: Arc<dyn PropertyService>) -> Self {
        Self { property_service }
    }

    /// Gets property book view based on user's role and command
    pub async fn get_property_book(
        &self,
        context: &SecurityContext,
    ) -> Result<PropertyBookView, CoreError> {
        let properties = match self.get_role_based_properties(context).await? {
            Some(props) => props,
            None => return Err(CoreError::Authorization("Insufficient permissions".into())),
        };

        let total_count = properties.len();
        let sensitive_items_count = properties.iter()
            .filter(|p| p.is_sensitive())
            .count();

        Ok(PropertyBookView {
            properties,
            total_count,
            sensitive_items_count,
            last_updated: Utc::now(),
        })
    }

    /// Gets properties based on user's role
    async fn get_role_based_properties(
        &self,
        context: &SecurityContext,
    ) -> Result<Option<Vec<Property>>, CoreError> {
        // Check permissions
        let can_view_all = context.permissions.iter()
            .any(|p| matches!(
                (p.resource_type, p.action),
                (ResourceType::Property, Action::ViewAll)
            ));

        let can_view_unit = context.permissions.iter()
            .any(|p| matches!(
                (p.resource_type, p.action),
                (ResourceType::Property, Action::ViewUnit)
            ));

        let can_view_own = context.permissions.iter()
            .any(|p| matches!(
                (p.resource_type, p.action),
                (ResourceType::Property, Action::ViewOwn)
            ));

        // Get command ID and user ID from context metadata
        let command_id = context.metadata.get("unit").cloned();
        let user_id = context.user_id.to_string();

        // Return properties based on permissions
        if can_view_all {
            // Officers can view all properties
            Ok(Some(self.property_service.list_properties(context).await?))
        } else if can_view_unit {
            // NCOs can view unit properties
            match command_id {
                Some(cmd_id) => Ok(Some(self.property_service.get_properties_by_command(&cmd_id, context).await?)),
                None => Err(CoreError::Configuration("User's command not set".into())),
            }
        } else if can_view_own {
            // Soldiers can view their own properties
            Ok(Some(self.property_service.get_properties_by_custodian(&user_id, context).await?))
        } else {
            Ok(None)
        }
    }

    /// Gets property history
    pub async fn get_property_history(
        &self,
        property_id: Uuid,
        context: &SecurityContext,
    ) -> Result<Vec<PropertyHistoryEntry>, CoreError> {
        // Get property
        let property = self.property_service
            .get_property(property_id, context)
            .await?
            .ok_or_else(|| CoreError::NotFound("Property not found".into()))?;

        // Convert property history to response format
        let history: Vec<PropertyHistoryEntry> = property.history()
            .iter()
            .map(|entry| PropertyHistoryEntry {
                timestamp: entry.timestamp,
                user_id: entry.user_id,
                action: entry.action.clone(),
                details: entry.details.clone(),
            })
            .collect();

        Ok(history)
    }

    /// Gets sensitive items report
    pub async fn get_sensitive_items_report(
        &self,
        context: &SecurityContext,
    ) -> Result<Vec<Property>, CoreError> {
        // Check if user can view sensitive items
        let can_view = context.permissions.iter().any(|p| 
            matches!(p.resource_type, ResourceType::Property) &&
            (matches!(p.action, Action::ViewAll) || matches!(p.action, Action::ViewUnit))
        );

        if !can_view {
            return Err(CoreError::Authorization("Cannot view sensitive items".into()));
        }

        // Get command ID from context
        let command_id = context.metadata.get("unit")
            .ok_or_else(|| CoreError::Configuration("User's command not set".into()))?;

        // Get sensitive items for command
        let mut items = self.property_service
            .get_properties_by_command(command_id, context)
            .await?;

        // Filter to sensitive items only
        items.retain(|item| item.is_sensitive());

        Ok(items)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::property::repository::mock::MockPropertyRepository;

    #[tokio::test]
    async fn test_role_based_property_view() {
        let repository = Arc::new(MockPropertyRepository::new());
        let property_service = Arc::new(PropertyServiceImpl::new(repository));
        let query_service = PropertyQueryService::new(property_service);

        // Create test context with Officer permissions
        let mut context = SecurityContext::default();
        context.permissions.push(Permission {
            resource_type: ResourceType::Property,
            action: Action::ViewAll,
        });

        let result = query_service.get_property_book(&context).await;
        assert!(result.is_ok());

        let book = result.unwrap();
        assert_eq!(book.total_count, 0); // Empty repository
    }
}
