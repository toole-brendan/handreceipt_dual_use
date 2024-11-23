pub mod property_repository;

use sqlx::PgPool;
use std::sync::Arc;

/// Error type for PostgreSQL operations
#[derive(Debug, thiserror::Error)]
pub enum PostgresError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Connection error: {0}")]
    Connection(String),

    #[error("Transaction error: {0}")]
    Transaction(String),
}

/// Helper functions for PostgreSQL operations
pub(crate) mod helpers {
    use super::*;
    use sqlx::postgres::PgRow;
    use sqlx::Row;

    /// Converts a string to an enum, with a default value if conversion fails
    pub fn string_to_enum<T: std::str::FromStr>(
        value: &str,
        default: T
    ) -> T {
        value.parse().unwrap_or(default)
    }

    /// Extracts a JSON value from a row, with proper error handling
    pub fn extract_json<T: serde::de::DeserializeOwned>(
        row: &PgRow,
        column: &str
    ) -> Result<Option<T>, PostgresError> {
        match row.try_get::<Option<serde_json::Value>, _>(column) {
            Ok(Some(value)) => {
                serde_json::from_value(value)
                    .map_err(|e| PostgresError::Database(sqlx::Error::Protocol(e.to_string().into())))
                    .map(Some)
            }
            Ok(None) => Ok(None),
            Err(e) => Err(PostgresError::Database(e)),
        }
    }

    /// Builds a dynamic WHERE clause for search queries
    pub struct QueryBuilder {
        query: String,
        params: Vec<String>,
        param_count: usize,
    }

    impl QueryBuilder {
        pub fn new(base_query: &str) -> Self {
            Self {
                query: base_query.to_string(),
                params: Vec::new(),
                param_count: 0,
            }
        }

        pub fn add_filter(
            &mut self,
            condition: &str,
            value: Option<impl ToString>,
        ) -> &mut Self {
            if let Some(value) = value {
                self.param_count += 1;
                self.query.push_str(&format!(" AND {} = ${}", condition, self.param_count));
                self.params.push(value.to_string());
            }
            self
        }

        pub fn add_like_filter(
            &mut self,
            condition: &str,
            value: Option<impl ToString>,
        ) -> &mut Self {
            if let Some(value) = value {
                self.param_count += 1;
                self.query.push_str(&format!(" AND {} ILIKE ${}", condition, self.param_count));
                self.params.push(format!("%{}%", value.to_string()));
            }
            self
        }

        pub fn add_in_filter<T: ToString>(
            &mut self,
            condition: &str,
            values: &[T],
        ) -> &mut Self {
            if !values.is_empty() {
                self.param_count += 1;
                self.query.push_str(&format!(" AND {} = ANY(${:?})", condition, self.param_count));
                self.params.push(
                    values
                        .iter()
                        .map(|v| v.to_string())
                        .collect::<Vec<_>>()
                        .join(",")
                );
            }
            self
        }

        pub fn add_pagination(
            &mut self,
            limit: Option<i64>,
            offset: Option<i64>,
        ) -> &mut Self {
            if let Some(limit) = limit {
                self.param_count += 1;
                self.query.push_str(&format!(" LIMIT ${}", self.param_count));
                self.params.push(limit.to_string());
            }
            if let Some(offset) = offset {
                self.param_count += 1;
                self.query.push_str(&format!(" OFFSET ${}", self.param_count));
                self.params.push(offset.to_string());
            }
            self
        }

        pub fn build(&self) -> (String, Vec<String>) {
            (self.query.clone(), self.params.clone())
        }
    }
}

/// Transaction management for PostgreSQL
pub struct PostgresTransaction<'c> {
    tx: sqlx::Transaction<'c, sqlx::Postgres>,
}

impl<'c> PostgresTransaction<'c> {
    pub async fn new(pool: &'c PgPool) -> Result<Self, PostgresError> {
        let tx = pool.begin()
            .await
            .map_err(PostgresError::Database)?;
        
        Ok(Self { tx })
    }

    pub async fn commit(self) -> Result<(), PostgresError> {
        self.tx
            .commit()
            .await
            .map_err(PostgresError::Database)
    }

    pub async fn rollback(self) -> Result<(), PostgresError> {
        self.tx
            .rollback()
            .await
            .map_err(PostgresError::Database)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::infrastructure::persistence::test_utils;

    #[sqlx::test]
    async fn test_query_builder() {
        let mut builder = helpers::QueryBuilder::new("SELECT * FROM test");
        
        builder
            .add_filter("status", Some("ACTIVE"))
            .add_like_filter("name", Some("Test"))
            .add_pagination(Some(10), Some(0));

        let (query, params) = builder.build();
        
        assert!(query.contains("status = $1"));
        assert!(query.contains("name ILIKE $2"));
        assert!(query.contains("LIMIT $3"));
        assert!(query.contains("OFFSET $4"));
        assert_eq!(params.len(), 4);
    }

    #[sqlx::test]
    async fn test_transaction_management() {
        let pool = test_utils::setup_test_db().await.unwrap();
        
        // Test successful transaction
        let tx = PostgresTransaction::new(&pool).await.unwrap();
        tx.commit().await.unwrap();

        // Test rollback
        let tx = PostgresTransaction::new(&pool).await.unwrap();
        tx.rollback().await.unwrap();

        test_utils::teardown_test_db(pool).await.unwrap();
    }
}
