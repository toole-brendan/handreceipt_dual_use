use std::sync::Arc;
use async_trait::async_trait;
use deadpool_postgres::Pool;
use tokio_postgres::Row;
use uuid::Uuid;

use crate::types::{
    app::DatabaseService,
    error::CoreError,
    security::SecurityContext,
    asset::Asset,
};

use self::storage::{
    DatabaseConnection,
    postgres::{
        PostgresConnection,
        repositories::PostgresAssetRepository,
        migrations,
    },
};

pub mod storage;

pub struct InfrastructureService {
    db_pool: Pool,
    asset_repo: PostgresAssetRepository,
}

impl InfrastructureService {
    pub fn new(db_pool: Pool) -> Self {
        Self {
            db_pool,
            asset_repo: PostgresAssetRepository::default(),
        }
    }

    pub async fn get_connection(&self) -> Result<PostgresConnection, CoreError> {
        let pool_conn = self.db_pool
            .get()
            .await
            .map_err(|e| CoreError::Database(e.to_string()))?;
        
        let client = pool_conn.into_inner();
        Ok(PostgresConnection::new(client))
    }

    pub async fn initialize(&self) -> Result<(), CoreError> {
        let pool_conn = self.db_pool
            .get()
            .await
            .map_err(|e| CoreError::Database(e.to_string()))?;

        let client = pool_conn.into_inner();
        migrations::run_migrations(&client).await?;
        Ok(())
    }
}

#[async_trait]
impl DatabaseService for InfrastructureService {
    async fn execute_query(
        &self,
        query: &str,
        params: &[&(dyn tokio_postgres::types::ToSql + Sync)],
        _security_context: &SecurityContext,
    ) -> Result<Vec<Row>, CoreError> {
        let conn = self.get_connection().await?;
        conn.query(query, params).await
    }

    async fn get_asset(
        &self,
        id: Uuid,
        security_context: &SecurityContext,
    ) -> Result<Option<Asset>, CoreError> {
        let conn = self.get_connection().await?;
        self.asset_repo.get_by_id(&conn, id, security_context).await
    }

    async fn update_asset(
        &self,
        asset: &Asset,
        security_context: &SecurityContext,
    ) -> Result<(), CoreError> {
        let conn = self.get_connection().await?;
        self.asset_repo.update(&conn, asset, security_context).await
    }

    async fn list_assets(
        &self,
        security_context: &SecurityContext,
    ) -> Result<Vec<Asset>, CoreError> {
        let conn = self.get_connection().await?;
        self.asset_repo.list(&conn, security_context).await
    }
}
