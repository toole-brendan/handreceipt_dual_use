pub mod connection;
pub mod models;
pub mod queries;
pub mod repositories;

// Re-export commonly used types
pub use connection::DatabaseConnection;
pub use models::StorageModel;
pub use repositories::Repository;

use crate::types::error::DatabaseError;

/// Result type for storage operations
pub type StorageResult<T> = Result<T, DatabaseError>;

/// Trait for database-backed models
pub trait StorageModel: Send + Sync {
    /// The type of the model's primary key
    type Id;

    /// Convert the model to a database-friendly format
    fn to_storage(&self) -> StorageResult<serde_json::Value>;

    /// Create a model from database data
    fn from_storage(data: serde_json::Value) -> StorageResult<Self>
    where
        Self: Sized;
}

/// Trait for database connections
#[async_trait::async_trait]
pub trait DatabaseConnection: Send + Sync {
    /// Execute a query that returns no rows
    async fn execute(&self, query: &str, params: &[&(dyn tokio_postgres::types::ToSql + Sync)]) -> StorageResult<u64>;

    /// Execute a query that returns rows
    async fn query(&self, query: &str, params: &[&(dyn tokio_postgres::types::ToSql + Sync)]) -> StorageResult<Vec<tokio_postgres::Row>>;

    /// Begin a transaction
    async fn transaction<F, T>(&self, f: F) -> StorageResult<T>
    where
        F: FnOnce(&tokio_postgres::Transaction<'_>) -> futures::future::BoxFuture<'_, StorageResult<T>> + Send,
        T: Send + 'static;
}
