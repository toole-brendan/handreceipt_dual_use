use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;

use super::entity::{Property, PropertyStatus, PropertyCondition};

/// Error types for repository operations
#[derive(Debug, thiserror::Error)]
pub enum RepositoryError {
    #[error("Property not found")]
    NotFound,
    
    #[error("Validation error: {0}")]
    Validation(String),
    
    #[error("Storage error: {0}")]
    Storage(String),
    
    #[error("Concurrency error: {0}")]
    Concurrency(String),
}

/// Search criteria for finding property
#[derive(Debug, Default)]
pub struct PropertySearchCriteria {
    pub nsn: Option<String>,
    pub serial_number: Option<String>,
    pub custodian: Option<String>,
    pub status: Option<PropertyStatus>,
    pub condition: Option<PropertyCondition>,
    pub is_sensitive: Option<bool>,
    pub location_building: Option<String>,
    pub last_inventoried_before: Option<DateTime<Utc>>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

/// Repository interface for property management
#[async_trait]
pub trait PropertyRepository: Send + Sync {
    /// Creates a new property record
    async fn create(&self, property: Property) -> Result<Property, RepositoryError>;
    
    /// Retrieves a property by its ID
    async fn get_by_id(&self, id: Uuid) -> Result<Property, RepositoryError>;
    
    /// Updates an existing property
    async fn update(&self, property: Property) -> Result<Property, RepositoryError>;
    
    /// Deletes a property (soft delete)
    async fn delete(&self, id: Uuid) -> Result<(), RepositoryError>;
    
    /// Searches for property based on criteria
    async fn search(&self, criteria: PropertySearchCriteria) -> Result<Vec<Property>, RepositoryError>;
    
    /// Gets property by NSN
    async fn get_by_nsn(&self, nsn: &str) -> Result<Vec<Property>, RepositoryError>;
    
    /// Gets property by serial number
    async fn get_by_serial(&self, serial: &str) -> Result<Option<Property>, RepositoryError>;
    
    /// Gets property assigned to a custodian
    async fn get_by_custodian(&self, custodian: &str) -> Result<Vec<Property>, RepositoryError>;
    
    /// Gets sensitive items for a custodian
    async fn get_sensitive_by_custodian(&self, custodian: &str) -> Result<Vec<Property>, RepositoryError> {
        let mut items = self.get_by_custodian(custodian).await?;
        items.retain(|item| item.is_sensitive());
        Ok(items)
    }
    
    /// Gets property needing inventory
    async fn get_needing_inventory(
        &self,
        threshold: chrono::Duration
    ) -> Result<Vec<Property>, RepositoryError>;
    
    /// Gets property by QR code
    async fn get_by_qr_code(&self, qr_code: &str) -> Result<Option<Property>, RepositoryError>;
    
    /// Begins a new transaction
    async fn begin_transaction(&self) -> Result<Box<dyn PropertyTransaction>, RepositoryError>;
}

/// Transaction interface for property operations
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

/// Mock implementation for testing
#[cfg(test)]
pub mod mock {
    use super::*;
    use std::collections::HashMap;
    use std::sync::Mutex;

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
            let mut results: Vec<Property> = properties.values().cloned().collect();

            // Apply filters
            if let Some(status) = criteria.status {
                results.retain(|p| p.status() == &status);
            }
            if let Some(is_sensitive) = criteria.is_sensitive {
                results.retain(|p| p.is_sensitive() == is_sensitive);
            }
            if let Some(custodian) = criteria.custodian {
                results.retain(|p| p.custodian() == Some(&custodian));
            }

            // Apply pagination
            if let Some(offset) = criteria.offset {
                results = results.into_iter().skip(offset as usize).collect();
            }
            if let Some(limit) = criteria.limit {
                results = results.into_iter().take(limit as usize).collect();
            }

            Ok(results)
        }

        async fn get_by_nsn(&self, nsn: &str) -> Result<Vec<Property>, RepositoryError> {
            let properties = self.properties.lock().unwrap();
            Ok(properties.values()
                .filter(|p| p.nsn() == Some(&nsn.to_string()))
                .cloned()
                .collect())
        }

        async fn get_by_serial(&self, serial: &str) -> Result<Option<Property>, RepositoryError> {
            let properties = self.properties.lock().unwrap();
            Ok(properties.values()
                .find(|p| p.serial_number() == Some(&serial.to_string()))
                .cloned())
        }

        async fn get_by_custodian(&self, custodian: &str) -> Result<Vec<Property>, RepositoryError> {
            let properties = self.properties.lock().unwrap();
            Ok(properties.values()
                .filter(|p| p.custodian() == Some(&custodian.to_string()))
                .cloned()
                .collect())
        }

        async fn get_needing_inventory(
            &self,
            threshold: chrono::Duration
        ) -> Result<Vec<Property>, RepositoryError> {
            // Simplified mock implementation
            Ok(Vec::new())
        }

        async fn get_by_qr_code(&self, _qr_code: &str) -> Result<Option<Property>, RepositoryError> {
            // Simplified mock implementation
            Ok(None)
        }

        async fn begin_transaction(&self) -> Result<Box<dyn PropertyTransaction>, RepositoryError> {
            Ok(Box::new(MockPropertyTransaction::new(self.properties.clone())))
        }
    }

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
