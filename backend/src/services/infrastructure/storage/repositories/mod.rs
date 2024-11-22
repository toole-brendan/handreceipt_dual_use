use async_trait::async_trait;
use uuid::Uuid;

use crate::types::{
    error::CoreError,
    security::SecurityContext,
    asset::Asset,
};

use super::DatabaseConnection;

#[async_trait]
pub trait AssetRepository: Send + Sync {
    async fn get_by_id<'a>(
        &'a self,
        conn: &'a impl DatabaseConnection,
        id: Uuid,
        context: &'a SecurityContext,
    ) -> Result<Option<Asset>, CoreError>;

    async fn update<'a>(
        &'a self,
        conn: &'a impl DatabaseConnection,
        asset: &'a Asset,
        context: &'a SecurityContext,
    ) -> Result<(), CoreError>;

    async fn list<'a>(
        &'a self,
        conn: &'a impl DatabaseConnection,
        context: &'a SecurityContext,
    ) -> Result<Vec<Asset>, CoreError>;

    async fn delete<'a>(
        &'a self,
        conn: &'a impl DatabaseConnection,
        id: Uuid,
        context: &'a SecurityContext,
    ) -> Result<bool, CoreError>;
}

// Re-export the postgres implementation
pub use super::postgres::repositories::asset::PostgresAssetRepository;
