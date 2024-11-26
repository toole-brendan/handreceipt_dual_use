use async_trait::async_trait;
use crate::error::RepositoryError;
use super::entity::Property;

#[async_trait]
pub trait PropertyRepository: Send + Sync {
    async fn create_property(&self, property: Property) -> Result<Property, RepositoryError>;
    async fn update_property(&self, property: &Property) -> Result<(), RepositoryError>;
    async fn delete_property(&self, id: i32) -> Result<(), RepositoryError>;
    async fn get_property(&self, id: i32) -> Result<Option<Property>, RepositoryError>;
    async fn list_properties(&self) -> Result<Vec<Property>, RepositoryError>;
}
