use std::sync::Arc;
use uuid::Uuid;
use deadpool_postgres::Pool;

use crate::{
    domain::property::entity::Property,
    error::DatabaseError,
    types::security::SecurityContext,
};

use super::{
    connection::PostgresConnection,
    repositories::{Repository, property::PropertyRepository},
};

pub struct Database {
    pool: Pool,
    property_repo: Arc<dyn Repository<Item = Property, Id = Uuid> + Send + Sync>,
}

impl Database {
    pub fn new(pool: Pool) -> Self {
        Self {
            pool,
            property_repo: Arc::new(PropertyRepository::default()),
        }
    }

    pub async fn get_connection(&self) -> Result<PostgresConnection, DatabaseError> {
        let client = self.pool
            .get()
            .await
            .map_err(|e| DatabaseError::ConnectionError(e.to_string()))?;

        Ok(PostgresConnection::new(client))
    }

    pub async fn get_property(
        &self,
        id: Uuid,
        security_context: &SecurityContext,
    ) -> Result<Property, DatabaseError> {
        let mut conn = self.get_connection().await?;
        self.property_repo.get_by_id(&conn, id, security_context).await
    }

    pub async fn update_property(
        &self,
        property: &Property,
        security_context: &SecurityContext,
    ) -> Result<Property, DatabaseError> {
        let mut conn = self.get_connection().await?;
        self.property_repo.update(&conn, property, security_context).await
    }

    pub async fn list_properties(
        &self,
        security_context: &SecurityContext,
    ) -> Result<Vec<Property>, DatabaseError> {
        let mut conn = self.get_connection().await?;
        self.property_repo.list(&conn, security_context).await
    }

    pub async fn begin_transaction(&self) -> Result<PostgresConnection, DatabaseError> {
        let mut conn = self.get_connection().await?;
        conn.begin_transaction().await?;
        Ok(conn)
    }

    pub async fn commit_transaction(&self, conn: &mut PostgresConnection) -> Result<(), DatabaseError> {
        conn.commit_transaction().await
    }

    pub async fn rollback_transaction(&self, conn: &mut PostgresConnection) -> Result<(), DatabaseError> {
        conn.rollback_transaction().await
    }
}
