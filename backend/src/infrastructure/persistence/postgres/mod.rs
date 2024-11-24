pub mod property_repository;
pub mod transfer_repository;

use sqlx::PgPool;
use std::sync::Arc;

pub struct PostgresConnection {
    pool: Arc<PgPool>,
}

impl PostgresConnection {
    pub fn new(pool: PgPool) -> Self {
        Self {
            pool: Arc::new(pool)
        }
    }

    pub fn get_pool(&self) -> &PgPool {
        &self.pool
    }
}

pub trait DatabaseConnection: Send + Sync {
    async fn execute(&self, query: &str) -> Result<(), sqlx::Error>;
}

impl DatabaseConnection for PostgresConnection {
    async fn execute(&self, query: &str) -> Result<(), sqlx::Error> {
        sqlx::query(query)
            .execute(&*self.pool)
            .await?;
        Ok(())
    }
}
