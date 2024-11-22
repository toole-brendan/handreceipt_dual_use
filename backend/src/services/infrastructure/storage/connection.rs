use async_trait::async_trait;
use tokio_postgres::{Client, Row, Transaction};
use std::pin::Pin;
use futures::Future;
use crate::types::error::CoreError;

pub type StorageResult<T> = Result<T, CoreError>;

#[async_trait]
pub trait DatabaseConnection: Send + Sync {
    async fn execute(&self, query: &str, params: &[&(dyn tokio_postgres::types::ToSql + Sync)]) -> StorageResult<u64>;
    async fn query(&self, query: &str, params: &[&(dyn tokio_postgres::types::ToSql + Sync)]) -> StorageResult<Vec<Row>>;
}

pub struct PostgresConnection {
    client: Client,
}

impl PostgresConnection {
    pub fn new(client: Client) -> Self {
        Self { client }
    }

    pub async fn transaction<'a, F, T>(&'a mut self, f: F) -> StorageResult<T>
    where
        F: FnOnce(&'a mut Transaction<'_>) -> Pin<Box<dyn Future<Output = StorageResult<T>> + Send + 'a>> + Send + 'a,
        T: Send + 'static,
    {
        let tx = self.client.transaction()
            .await
            .map_err(|e| CoreError::Database(e.to_string()))?;

        let result = {
            let mut tx = tx;
            f(&mut tx).await
        };

        match result {
            Ok(value) => {
                tx.commit()
                    .await
                    .map_err(|e| CoreError::Database(e.to_string()))?;
                Ok(value)
            }
            Err(e) => {
                tx.rollback()
                    .await
                    .map_err(|e| CoreError::Database(e.to_string()))?;
                Err(e)
            }
        }
    }
}

#[async_trait]
impl DatabaseConnection for PostgresConnection {
    async fn execute(&self, query: &str, params: &[&(dyn tokio_postgres::types::ToSql + Sync)]) -> StorageResult<u64> {
        self.client.execute(query, params)
            .await
            .map_err(|e| CoreError::Database(e.to_string()))
    }

    async fn query(&self, query: &str, params: &[&(dyn tokio_postgres::types::ToSql + Sync)]) -> StorageResult<Vec<Row>> {
        self.client.query(query, params)
            .await
            .map_err(|e| CoreError::Database(e.to_string()))
    }
} 