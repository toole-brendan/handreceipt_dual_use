// backend/src/services/database/mod.rs

use std::sync::Arc;
use deadpool_postgres::Pool;
use tokio_postgres::Row;
use uuid::Uuid;

use crate::types::{
    app::DatabaseService,
    error::CoreError,
    security::SecurityContext,
    asset::Asset,
};

use super::storage::{
    connection::PostgresConnection,
    repositories::{Repository, asset::AssetRepository},
};

pub struct DatabaseModule {
    pool: Pool,
    asset_repo: Arc<dyn Repository<Item = Asset, Id = Uuid> + Send + Sync>,
}

impl DatabaseModule {
    pub fn new(pool: Pool) -> Self {
        Self {
            pool,
            asset_repo: Arc::new(AssetRepository::default()),
        }
    }

    pub async fn get_connection(&self) -> Result<PostgresConnection, CoreError> {
        let client = self.pool
            .get()
            .await
            .map_err(|e| CoreError::Database(e.to_string()))?;
        
        let client = client.into_inner();
        Ok(PostgresConnection::new(client))
    }
}

#[async_trait::async_trait]
impl DatabaseService for DatabaseModule {
    async fn execute_query(
        &self,
        query: &str,
        params: &[&(dyn tokio_postgres::types::ToSql + Sync)],
        _security_context: &SecurityContext,
    ) -> Result<Vec<Row>, CoreError> {
        let mut conn = self.get_connection().await?;
        conn.query(query, params).await
    }

    async fn get_asset(
        &self,
        id: Uuid,
        security_context: &SecurityContext,
    ) -> Result<Option<Asset>, CoreError> {
        let mut conn = self.get_connection().await?;
        self.asset_repo.get_by_id(&conn, id, security_context).await
    }

    async fn update_asset(
        &self,
        asset: &Asset,
        security_context: &SecurityContext,
    ) -> Result<(), CoreError> {
        let mut conn = self.get_connection().await?;
        self.asset_repo.update(&conn, asset, security_context).await
    }

    async fn list_assets(
        &self,
        security_context: &SecurityContext,
    ) -> Result<Vec<Asset>, CoreError> {
        let mut conn = self.get_connection().await?;
        self.asset_repo.list(&conn, security_context).await
    }
}

#[cfg(test)]
pub mod tests {
    use super::*;
    use deadpool_postgres::Config;

    pub async fn create_test_db() -> Result<DatabaseModule, CoreError> {
        let mut cfg = Config::new();
        cfg.host = Some("localhost".to_string());
        cfg.port = Some(5432);
        cfg.dbname = Some("test_db".to_string());
        cfg.user = Some("test_user".to_string());
        cfg.password = Some("test_pass".to_string());

        let pool = cfg.create_pool(None, tokio_postgres::NoTls)
            .map_err(|e| CoreError::Database(e.to_string()))?;

        Ok(DatabaseModule::new(pool))
    }
}