use uuid::Uuid;
use async_trait::async_trait;
use chrono::{DateTime, Utc};

use crate::{
    domain::property::{
        Property,
        PropertyService,
    },
    types::security::SecurityContext,
    error::CoreError,
};

/// Property book entry with holder information
#[derive(Debug)]
pub struct PropertyBookEntry {
    pub property: Property,
    pub current_holder: String,
    pub last_transfer: Option<DateTime<Utc>>,
    pub command_id: String,
    pub unit: String,
}

/// Property query handlers
#[async_trait]
pub trait PropertyQueries: Send + Sync {
    /// Gets a property by ID
    async fn get_property(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<Option<Property>, CoreError>;

    /// Lists all properties
    async fn list_properties(
        &self,
        limit: Option<i64>,
        offset: Option<i64>,
        context: &SecurityContext,
    ) -> Result<Vec<Property>, CoreError>;

    /// Gets properties by custodian
    async fn get_properties_by_custodian(
        &self,
        custodian: String,
        context: &SecurityContext,
    ) -> Result<Vec<Property>, CoreError>;

    /// Gets sensitive items
    async fn get_sensitive_items(
        &self,
        context: &SecurityContext,
    ) -> Result<Vec<Property>, CoreError>;

    /// Gets property book for a command
    async fn get_command_property_book(
        &self,
        command_id: String,
        context: &SecurityContext,
    ) -> Result<Vec<PropertyBookEntry>, CoreError>;

    /// Gets property book summary
    async fn get_property_book_summary(
        &self,
        context: &SecurityContext,
    ) -> Result<PropertyBookSummary, CoreError>;
}

/// Summary of property book
#[derive(Debug)]
pub struct PropertyBookSummary {
    pub total_items: i64,
    pub total_value: f64,
    pub sensitive_items: i64,
    pub items_by_category: Vec<CategoryCount>,
    pub items_by_command: Vec<CommandCount>,
}

#[derive(Debug)]
pub struct CategoryCount {
    pub category: String,
    pub count: i64,
}

#[derive(Debug)]
pub struct CommandCount {
    pub command_id: String,
    pub unit: String,
    pub total_items: i64,
    pub sensitive_items: i64,
}

pub struct PropertyQueriesImpl<S: PropertyService> {
    property_service: S,
}

impl<S: PropertyService> PropertyQueriesImpl<S> {
    pub fn new(property_service: S) -> Self {
        Self { property_service }
    }
}

#[async_trait]
impl<S: PropertyService> PropertyQueries for PropertyQueriesImpl<S> {
    async fn get_property(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<Option<Property>, CoreError> {
        // Get property through domain service
        self.property_service.get_property(id, context).await
    }

    async fn list_properties(
        &self,
        limit: Option<i64>,
        offset: Option<i64>,
        context: &SecurityContext,
    ) -> Result<Vec<Property>, CoreError> {
        // List properties through domain service
        self.property_service.list_properties(limit, offset, context).await
    }

    async fn get_properties_by_custodian(
        &self,
        custodian: String,
        context: &SecurityContext,
    ) -> Result<Vec<Property>, CoreError> {
        // Get custodian's properties through domain service
        self.property_service.get_properties_by_custodian(custodian, context).await
    }

    async fn get_sensitive_items(
        &self,
        context: &SecurityContext,
    ) -> Result<Vec<Property>, CoreError> {
        // Get sensitive items through domain service
        self.property_service.get_sensitive_items(context).await
    }

    async fn get_command_property_book(
        &self,
        command_id: String,
        context: &SecurityContext,
    ) -> Result<Vec<PropertyBookEntry>, CoreError> {
        // Get all properties for the command through domain service
        let properties = self.property_service
            .get_properties_by_command(command_id.clone(), context)
            .await?;

        // Convert to property book entries with holder information
        let mut entries = Vec::new();
        for property in properties {
            let holder_info = self.property_service
                .get_current_holder(&property.id(), context)
                .await?;

            if let Some((holder, last_transfer, unit)) = holder_info {
                entries.push(PropertyBookEntry {
                    property,
                    current_holder: holder,
                    last_transfer: Some(last_transfer),
                    command_id: command_id.clone(),
                    unit,
                });
            }
        }

        Ok(entries)
    }

    async fn get_property_book_summary(
        &self,
        context: &SecurityContext,
    ) -> Result<PropertyBookSummary, CoreError> {
        // Get all properties
        let properties = self.property_service.list_properties(None, None, context).await?;

        // Calculate summary
        let total_items = properties.len() as i64;
        let total_value = properties.iter()
            .filter_map(|p| p.value())
            .sum();
        let sensitive_items = properties.iter()
            .filter(|p| p.is_sensitive())
            .count() as i64;

        // Count by category
        let mut category_counts: std::collections::HashMap<String, i64> = std::collections::HashMap::new();
        for property in &properties {
            *category_counts.entry(property.category().to_string()).or_insert(0) += 1;
        }

        // Count by command
        let mut command_counts: std::collections::HashMap<String, CommandCount> = std::collections::HashMap::new();
        for property in properties {
            let command_id = property.command_id().to_string();
            let entry = command_counts.entry(command_id.clone()).or_insert(CommandCount {
                command_id: command_id.clone(),
                unit: property.unit().to_string(),
                total_items: 0,
                sensitive_items: 0,
            });
            entry.total_items += 1;
            if property.is_sensitive() {
                entry.sensitive_items += 1;
            }
        }

        Ok(PropertyBookSummary {
            total_items,
            total_value,
            sensitive_items,
            items_by_category: category_counts.into_iter()
                .map(|(category, count)| CategoryCount { category, count })
                .collect(),
            items_by_command: command_counts.into_values().collect(),
        })
    }
}
