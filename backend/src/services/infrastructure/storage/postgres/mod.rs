use std::sync::Arc;
use deadpool_postgres::{Config, Pool, Runtime};
use tokio_postgres::NoTls;
use std::env;

use crate::{
    types::error::DatabaseError,
    services::core::security::SecurityModule,
};

pub mod repositories;
pub mod queries;
pub mod models;

/// PostgreSQL connection pool wrapper
pub struct PostgresPool {
    pool: Pool,
    security: Arc<SecurityModule>,
}

impl PostgresPool {
    pub async fn new(security: Arc<SecurityModule>) -> Result<Self, DatabaseError> {
        let mut cfg = Config::new();
        cfg.host = env::var("DB_HOST").ok();
        cfg.port = env::var("DB_PORT").ok().and_then(|p| p.parse().ok());
        cfg.user = env::var("DB_USER").ok();
        cfg.password = env::var("DB_PASSWORD").ok();
        cfg.dbname = env::var("DB_NAME").ok();
        
        cfg.pool = Some(deadpool_postgres::PoolConfig {
            max_size: 16,
            timeouts: deadpool_postgres::Timeouts::default(),
        });

        let pool = cfg.create_pool(Some(Runtime::Tokio1), NoTls)
            .map_err(|e| DatabaseError::ConnectionError(e.to_string()))?;

        // Test connection
        let client = pool.get().await
            .map_err(|e| DatabaseError::ConnectionError(e.to_string()))?;
        
        client.execute("SELECT 1", &[])
            .await
            .map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        Ok(Self { pool, security })
    }

    /// Get a connection from the pool
    pub async fn get_client(&self) -> Result<deadpool_postgres::Client, DatabaseError> {
        self.pool.get().await
            .map_err(|e| DatabaseError::ConnectionError(e.to_string()))
    }

    /// Begin a transaction
    pub async fn begin_transaction(&self) -> Result<deadpool_postgres::Transaction<'_>, DatabaseError> {
        let client = self.get_client().await?;
        client.transaction().await
            .map_err(|e| DatabaseError::TransactionError(e.to_string()))
    }

    /// Get the security module
    pub fn security(&self) -> Arc<SecurityModule> {
        self.security.clone()
    }
}

/// Helper trait for converting database rows to domain types
pub trait FromRow {
    fn from_row(row: tokio_postgres::Row) -> Result<Self, DatabaseError>
    where
        Self: Sized;
}

/// Helper trait for converting domain types to database parameters
pub trait ToRow {
    fn to_row(&self) -> Vec<Box<dyn tokio_postgres::types::ToSql + Sync>>;
}

/// Helper for building SQL queries
pub struct QueryBuilder {
    query: String,
    params: Vec<Box<dyn tokio_postgres::types::ToSql + Sync>>,
}

impl QueryBuilder {
    pub fn new(base_query: &str) -> Self {
        Self {
            query: base_query.to_string(),
            params: Vec::new(),
        }
    }

    pub fn add_param<T: 'static + tokio_postgres::types::ToSql + Sync>(&mut self, param: T) -> usize {
        self.params.push(Box::new(param));
        self.params.len()
    }

    pub fn add_where(&mut self, condition: &str) -> &mut Self {
        if !self.query.contains("WHERE") {
            self.query.push_str(" WHERE ");
        } else {
            self.query.push_str(" AND ");
        }
        self.query.push_str(condition);
        self
    }

    pub fn build(self) -> (String, Vec<Box<dyn tokio_postgres::types::ToSql + Sync>>) {
        (self.query, self.params)
    }
}
