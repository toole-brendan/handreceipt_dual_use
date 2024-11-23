use async_trait::async_trait;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::domain::entities::property::{
    Property,
    PropertyStatus,
    PropertyCategory,
    Location,
};

/// Custom error type for repository operations
#[derive(Debug, thiserror::Error)]
pub enum RepositoryError {
    #[error("Entity not found")]
    NotFound,
    
    #[error("Validation error: {0}")]
    Validation(String),
    
    #[error("Storage error: {0}")]
    Storage(String),
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
    pub hand_receipt_number: Option<String>,
    pub verified_after: Option<DateTime<Utc>>,
    pub location_bounds: Option<GeoBounds>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

/// Geographical bounds for location-based queries
#[derive(Debug)]
pub struct GeoBounds {
    pub min_latitude: f64,
    pub max_latitude: f64,
    pub min_longitude: f64,
    pub max_longitude: f64,
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
    }

    impl MockPropertyRepository {
        pub fn new() -> Self {
            Self {
                properties: Mutex::new(HashMap::new()),
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
                .filter(|p| p.custodian() == Some(custodian))
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

        async fn begin_transaction(&self) -> Result<Box<dyn PropertyTransaction>, RepositoryError> {
            Ok(Box::new(MockPropertyTransaction::new(self.properties.clone())))
        }
    }

    /// Mock transaction implementation
    pub struct MockPropertyTransaction {
        properties: Mutex<HashMap<Uuid, Property>>,
    }

    impl MockPropertyTransaction {
        fn new(properties: Mutex<HashMap<Uuid, Property>>) -> Self {
            Self { properties }
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
}
