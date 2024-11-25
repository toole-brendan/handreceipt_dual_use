use async_trait::async_trait;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use thiserror::Error;
use std::sync::Arc;

use super::entity::{Property, PropertyCategory, PropertyStatus};
use crate::domain::models::transfer::PropertyTransfer;

/// Custom error type for repository operations
#[derive(Debug, Error)]
pub enum RepositoryError {
    #[error("Entity not found")]
    NotFound,
    
    #[error("Validation error: {0}")]
    Validation(String),
    
    #[error("Storage error: {0}")]
    Storage(String),
}

/// Geographical bounds for location-based queries
#[derive(Debug, Clone)]
pub struct GeoBounds {
    pub min_latitude: f64,
    pub max_latitude: f64,
    pub min_longitude: f64,
    pub max_longitude: f64,
}

/// Defines the criteria for searching property
#[derive(Debug, Default)]
pub struct PropertySearchCriteria {
    pub status: Option<PropertyStatus>,
    pub category: Option<PropertyCategory>,
    pub is_sensitive: Option<bool>,
    pub custodian: Option<String>,
    pub nsn: Option<String>,
    pub serial_number: Option<String>,
    pub command_id: Option<String>,
    pub location: Option<GeoBounds>,
    pub created_after: Option<DateTime<Utc>>,
    pub created_before: Option<DateTime<Utc>>,
}

/// Repository interface for Property entity
#[async_trait]
pub trait PropertyRepository: Send + Sync {
    /// Creates a new property item
    async fn create(&self, property: Property) -> Result<Property, RepositoryError>;
    
    /// Retrieves a property by its ID
    async fn get_by_id(&self, id: Uuid) -> Result<Property, RepositoryError>;
    
    /// Updates an existing property
    async fn update(&self, property: Property) -> Result<Property, RepositoryError>;
    
    /// Deletes a property by its ID
    async fn delete(&self, id: Uuid) -> Result<(), RepositoryError>;
    
    /// Searches for property based on criteria
    async fn search(&self, criteria: PropertySearchCriteria) -> Result<Vec<Property>, RepositoryError>;
    
    /// Retrieves property by custodian
    async fn get_by_custodian(&self, custodian: &str) -> Result<Vec<Property>, RepositoryError>;
    
    /// Retrieves property by command
    async fn get_by_command(&self, command_id: &str) -> Result<Vec<Property>, RepositoryError>;
    
    /// Retrieves sensitive items by custodian
    async fn get_sensitive_by_custodian(&self, custodian: &str) -> Result<Vec<Property>, RepositoryError> {
        let mut items = self.get_by_custodian(custodian).await?;
        items.retain(|item| item.is_sensitive());
        Ok(items)
    }
    
    /// Retrieves property by status
    async fn get_by_status(&self, status: PropertyStatus) -> Result<Vec<Property>, RepositoryError>;
    
    /// Retrieves property by category
    async fn get_by_category(&self, category: PropertyCategory) -> Result<Vec<Property>, RepositoryError>;
    
    /// Retrieves property by NSN
    async fn get_by_nsn(&self, nsn: &str) -> Result<Vec<Property>, RepositoryError>;
    
    /// Retrieves property by serial number
    async fn get_by_serial_number(&self, serial: &str) -> Result<Vec<Property>, RepositoryError>;
    
    /// Retrieves property by hand receipt number
    async fn get_by_hand_receipt(
        &self,
        receipt_number: &str
    ) -> Result<Vec<Property>, RepositoryError>;

    /// Retrieves property within geographical bounds
    async fn get_by_location(
        &self,
        bounds: GeoBounds
    ) -> Result<Vec<Property>, RepositoryError>;
    
    /// Retrieves property needing verification
    async fn get_pending_verification(
        &self,
        threshold: chrono::Duration,
        category: Option<PropertyCategory>
    ) -> Result<Vec<Property>, RepositoryError>;
    
    /// Gets the latest transfer record for a property
    async fn get_latest_transfer(
        &self,
        property_id: Uuid
    ) -> Result<Option<PropertyTransfer>, RepositoryError>;
    
    /// Begins a new transaction
    async fn begin_transaction(&self) -> Result<Box<dyn PropertyTransaction>, RepositoryError>;
}

/// Represents a transaction for property operations
#[async_trait]
pub trait PropertyTransaction: Send + Sync {
    /// Commits the transaction
    async fn commit(self: Box<Self>) -> Result<(), RepositoryError>;
    
    /// Rolls back the transaction
    async fn rollback(self: Box<Self>) -> Result<(), RepositoryError>;
    
    /// Creates a new property within the transaction
    async fn create(&mut self, property: Property) -> Result<Property, RepositoryError>;
    
    /// Updates a property within the transaction
    async fn update(&mut self, property: Property) -> Result<Property, RepositoryError>;
    
    /// Deletes a property within the transaction
    async fn delete(&mut self, id: Uuid) -> Result<(), RepositoryError>;
}

/// Provides a way to mock the repository for testing
#[cfg(test)]
pub mod mock {
    use super::*;
    use std::sync::Mutex;
    use std::collections::HashMap;

    /// A mock implementation of PropertyRepository for testing
    pub struct MockPropertyRepository {
        properties: Mutex<HashMap<Uuid, Property>>,
        transfers: Mutex<HashMap<Uuid, Vec<PropertyTransfer>>>,
    }

    impl MockPropertyRepository {
        pub fn new() -> Self {
            Self {
                properties: Mutex::new(HashMap::new()),
                transfers: Mutex::new(HashMap::new()),
            }
        }
    }

    #[async_trait]
    impl PropertyRepository for MockPropertyRepository {
        async fn create(&self, property: Property) -> Result<Property, RepositoryError> {
            let mut properties = self.properties.lock().unwrap();
            let id = property.id();
            properties.insert(id, property.clone());
            Ok(property)
        }

        async fn get_by_id(&self, id: Uuid) -> Result<Property, RepositoryError> {
            let properties = self.properties.lock().unwrap();
            properties.get(&id)
                .cloned()
                .ok_or(RepositoryError::NotFound)
        }

        async fn update(&self, property: Property) -> Result<Property, RepositoryError> {
            let mut properties = self.properties.lock().unwrap();
            let id = property.id();
            if properties.contains_key(&id) {
                properties.insert(id, property.clone());
                Ok(property)
            } else {
                Err(RepositoryError::NotFound)
            }
        }

        async fn delete(&self, id: Uuid) -> Result<(), RepositoryError> {
            let mut properties = self.properties.lock().unwrap();
            if properties.remove(&id).is_some() {
                Ok(())
            } else {
                Err(RepositoryError::NotFound)
            }
        }

        async fn search(&self, criteria: PropertySearchCriteria) -> Result<Vec<Property>, RepositoryError> {
            let properties = self.properties.lock().unwrap();
            let mut result: Vec<Property> = properties.values().cloned().collect();
            
            if let Some(category) = criteria.category {
                result.retain(|p| p.category() == &category);
            }
            
            if let Some(is_sensitive) = criteria.is_sensitive {
                result.retain(|p| p.is_sensitive() == is_sensitive);
            }
            
            if let Some(status) = criteria.status {
                result.retain(|p| p.status() == &status);
            }
            
            if let Some(custodian) = criteria.custodian {
                result.retain(|p| p.custodian() == Some(&custodian));
            }
            
            Ok(result)
        }

        async fn get_by_custodian(&self, custodian: &str) -> Result<Vec<Property>, RepositoryError> {
            let properties = self.properties.lock().unwrap();
            Ok(properties.values()
                .filter(|p| p.custodian()
                    .map(|c| c.as_str() == custodian)
                    .unwrap_or(false))
                .cloned()
                .collect())
        }

        async fn get_by_command(&self, command_id: &str) -> Result<Vec<Property>, RepositoryError> {
            let properties = self.properties.lock().unwrap();
            Ok(properties.values()
                .filter(|p| p.command_id()
                    .map(|c| c.as_str() == command_id)
                    .unwrap_or(false))
                .cloned()
                .collect())
        }

        async fn get_by_status(&self, status: PropertyStatus) -> Result<Vec<Property>, RepositoryError> {
            let properties = self.properties.lock().unwrap();
            Ok(properties.values()
                .filter(|p| p.status() == &status)
                .cloned()
                .collect())
        }

        async fn get_by_category(&self, category: PropertyCategory) -> Result<Vec<Property>, RepositoryError> {
            let properties = self.properties.lock().unwrap();
            Ok(properties.values()
                .filter(|p| p.category() == &category)
                .cloned()
                .collect())
        }

        async fn get_by_nsn(&self, nsn: &str) -> Result<Vec<Property>, RepositoryError> {
            let properties = self.properties.lock().unwrap();
            Ok(properties.values()
                .filter(|p| p.nsn() == Some(&nsn.to_string()))
                .cloned()
                .collect())
        }

        async fn get_by_serial_number(&self, serial: &str) -> Result<Vec<Property>, RepositoryError> {
            let properties = self.properties.lock().unwrap();
            Ok(properties.values()
                .filter(|p| p.serial_number() == Some(&serial.to_string()))
                .cloned()
                .collect())
        }

        async fn get_by_hand_receipt(&self, receipt_number: &str) -> Result<Vec<Property>, RepositoryError> {
            let properties = self.properties.lock().unwrap();
            Ok(properties.values()
                .filter(|p| p.hand_receipt_number() == Some(&receipt_number.to_string()))
                .cloned()
                .collect())
        }

        async fn get_by_location(&self, _bounds: GeoBounds) -> Result<Vec<Property>, RepositoryError> {
            Ok(Vec::new()) // Simplified mock implementation
        }

        async fn get_pending_verification(
            &self,
            _threshold: chrono::Duration,
            _category: Option<PropertyCategory>
        ) -> Result<Vec<Property>, RepositoryError> {
            Ok(Vec::new()) // Simplified mock implementation
        }

        async fn get_latest_transfer(
            &self,
            property_id: Uuid
        ) -> Result<Option<PropertyTransfer>, RepositoryError> {
            let transfers = self.transfers.lock().unwrap();
            Ok(transfers.get(&property_id)
                .and_then(|transfers| transfers.last().cloned()))
        }

        async fn begin_transaction(&self) -> Result<Box<dyn PropertyTransaction>, RepositoryError> {
            let properties = self.properties.lock().unwrap().clone();
            Ok(Box::new(MockPropertyTransaction::new(properties)))
        }
    }

    /// Mock transaction implementation
    pub struct MockPropertyTransaction {
        properties: Mutex<HashMap<Uuid, Property>>,
    }

    impl MockPropertyTransaction {
        fn new(properties: HashMap<Uuid, Property>) -> Self {
            Self {
                properties: Mutex::new(properties)
            }
        }
    }

    #[async_trait]
    impl PropertyTransaction for MockPropertyTransaction {
        async fn commit(self: Box<Self>) -> Result<(), RepositoryError> {
            Ok(())
        }

        async fn rollback(self: Box<Self>) -> Result<(), RepositoryError> {
            Ok(())
        }

        async fn create(&mut self, property: Property) -> Result<Property, RepositoryError> {
            let mut properties = self.properties.lock().unwrap();
            let id = property.id();
            properties.insert(id, property.clone());
            Ok(property)
        }

        async fn update(&mut self, property: Property) -> Result<Property, RepositoryError> {
            let mut properties = self.properties.lock().unwrap();
            let id = property.id();
            if properties.contains_key(&id) {
                properties.insert(id, property.clone());
                Ok(property)
            } else {
                Err(RepositoryError::NotFound)
            }
        }

        async fn delete(&mut self, id: Uuid) -> Result<(), RepositoryError> {
            let mut properties = self.properties.lock().unwrap();
            if properties.remove(&id).is_some() {
                Ok(())
            } else {
                Err(RepositoryError::NotFound)
            }
        }
    }

    #[cfg(test)]
    #[async_trait]
    impl PropertyRepository for Arc<MockPropertyRepository> {
        async fn create(&self, property: Property) -> Result<Property, RepositoryError> {
            self.as_ref().create(property).await
        }

        async fn get_by_id(&self, id: Uuid) -> Result<Property, RepositoryError> {
            self.as_ref().get_by_id(id).await
        }

        async fn update(&self, property: Property) -> Result<Property, RepositoryError> {
            self.as_ref().update(property).await
        }

        async fn delete(&self, id: Uuid) -> Result<(), RepositoryError> {
            self.as_ref().delete(id).await
        }

        async fn search(&self, criteria: PropertySearchCriteria) -> Result<Vec<Property>, RepositoryError> {
            self.as_ref().search(criteria).await
        }

        async fn get_by_custodian(&self, custodian: &str) -> Result<Vec<Property>, RepositoryError> {
            self.as_ref().get_by_custodian(custodian).await
        }

        async fn get_by_command(&self, command_id: &str) -> Result<Vec<Property>, RepositoryError> {
            self.as_ref().get_by_command(command_id).await
        }

        async fn get_by_status(&self, status: PropertyStatus) -> Result<Vec<Property>, RepositoryError> {
            self.as_ref().get_by_status(status).await
        }

        async fn get_by_category(&self, category: PropertyCategory) -> Result<Vec<Property>, RepositoryError> {
            self.as_ref().get_by_category(category).await
        }

        async fn get_by_nsn(&self, nsn: &str) -> Result<Vec<Property>, RepositoryError> {
            self.as_ref().get_by_nsn(nsn).await
        }

        async fn get_by_serial_number(&self, serial: &str) -> Result<Vec<Property>, RepositoryError> {
            self.as_ref().get_by_serial_number(serial).await
        }

        async fn get_by_hand_receipt(&self, receipt_number: &str) -> Result<Vec<Property>, RepositoryError> {
            self.as_ref().get_by_hand_receipt(receipt_number).await
        }

        async fn get_by_location(&self, bounds: GeoBounds) -> Result<Vec<Property>, RepositoryError> {
            self.as_ref().get_by_location(bounds).await
        }

        async fn get_pending_verification(
            &self,
            threshold: chrono::Duration,
            category: Option<PropertyCategory>
        ) -> Result<Vec<Property>, RepositoryError> {
            self.as_ref().get_pending_verification(threshold, category).await
        }

        async fn get_latest_transfer(&self, property_id: Uuid) -> Result<Option<PropertyTransfer>, RepositoryError> {
            self.as_ref().get_latest_transfer(property_id).await
        }

        async fn begin_transaction(&self) -> Result<Box<dyn PropertyTransaction>, RepositoryError> {
            let properties = self.properties.lock().unwrap().clone();
            Ok(Box::new(MockPropertyTransaction::new(properties)))
        }
    }
}
