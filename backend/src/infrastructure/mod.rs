use std::sync::Arc;
use async_trait::async_trait;
use uuid::Uuid;

use crate::{
    error::CoreError,
    types::{
        security::SecurityContext,
        asset::Asset,
    },
};

pub mod blockchain;
pub mod persistence;

pub use persistence::{
    DatabaseConfig,
    create_pool,
    create_repositories,
    Repositories,
};

pub use persistence::postgres;

#[async_trait]
pub trait DatabaseConnection: Send + Sync {
    async fn execute(&self, query: &str) -> Result<(), sqlx::Error>;
}

pub struct DatabaseServiceImpl {
    connection: Arc<dyn DatabaseConnection>,
}

impl DatabaseServiceImpl {
    pub fn new(connection: Arc<dyn DatabaseConnection>) -> Self {
        Self {
            connection,
        }
    }
}

#[async_trait]
pub trait DatabaseService: Send + Sync {
    async fn execute_query(&self, query: &str) -> Result<(), CoreError>;
    async fn get_asset(&self, id: Uuid) -> Result<Option<Asset>, CoreError>;
    async fn update_asset(&self, asset: &Asset, context: &SecurityContext) -> Result<(), CoreError>;
    async fn list_assets(&self, context: &SecurityContext) -> Result<Vec<Asset>, CoreError>;
    async fn delete_asset(&self, id: Uuid, context: &SecurityContext) -> Result<(), CoreError>;
}

#[async_trait]
impl DatabaseService for DatabaseServiceImpl {
    async fn execute_query(&self, query: &str) -> Result<(), CoreError> {
        self.connection.execute(query)
            .await
            .map_err(|e| CoreError::Database(e.to_string()))
    }

    async fn get_asset(&self, id: Uuid) -> Result<Option<Asset>, CoreError> {
        // TODO: Implement actual database query
        Ok(None)
    }

    async fn update_asset(&self, asset: &Asset, context: &SecurityContext) -> Result<(), CoreError> {
        // TODO: Implement actual database update
        Ok(())
    }

    async fn list_assets(&self, context: &SecurityContext) -> Result<Vec<Asset>, CoreError> {
        // TODO: Implement actual database query
        Ok(vec![])
    }

    async fn delete_asset(&self, id: Uuid, context: &SecurityContext) -> Result<(), CoreError> {
        // TODO: Implement actual database deletion
        Ok(())
    }
}
