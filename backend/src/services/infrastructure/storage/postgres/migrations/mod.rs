//! Database migrations module
//! Contains SQL migrations and migration management

use std::path::Path;
use tokio::fs;
use crate::types::error::DatabaseError;

/// List of all migrations in order
const MIGRATIONS: &[&str] = &[
    include_str!("2024_03_24_combined_schema.sql"),
    include_str!("audit_logs.sql"),
    include_str!("base_schema.sql"),
    include_str!("core_schema.sql"),
    include_str!("init_extensions.sql"),
    include_str!("init_schema.sql"),
    include_str!("offline_mesh.sql"),
    include_str!("partitioning.sql"),
    include_str!("qr_verification.sql"),
    include_str!("rfid_support.sql"),
    include_str!("security_schema.sql"),
];

/// Migration manager
pub struct MigrationManager {
    pool: deadpool_postgres::Pool,
}

impl MigrationManager {
    pub fn new(pool: deadpool_postgres::Pool) -> Self {
        Self { pool }
    }

    /// Run all migrations
    pub async fn run_migrations(&self) -> Result<(), DatabaseError> {
        let client = self.pool.get().await
            .map_err(|e| DatabaseError::ConnectionError(e.to_string()))?;

        // Create migrations table if it doesn't exist
        client.execute(
            "CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )",
            &[],
        ).await.map_err(|e| DatabaseError::MigrationError(e.to_string()))?;

        // Run each migration in a transaction
        for migration in MIGRATIONS {
            let transaction = client.transaction().await
                .map_err(|e| DatabaseError::TransactionError(e.to_string()))?;

            // Check if migration has already been applied
            let already_applied = transaction.query_one(
                "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE name = $1)",
                &[&migration],
            ).await.map_err(|e| DatabaseError::QueryError(e.to_string()))?;

            if !already_applied.get(0) {
                // Apply migration
                transaction.batch_execute(migration)
                    .await
                    .map_err(|e| DatabaseError::MigrationError(e.to_string()))?;

                // Record migration
                transaction.execute(
                    "INSERT INTO schema_migrations (name) VALUES ($1)",
                    &[&migration],
                ).await.map_err(|e| DatabaseError::QueryError(e.to_string()))?;

                transaction.commit().await
                    .map_err(|e| DatabaseError::TransactionError(e.to_string()))?;
            }
        }

        Ok(())
    }

    /// Get list of applied migrations
    pub async fn get_applied_migrations(&self) -> Result<Vec<String>, DatabaseError> {
        let client = self.pool.get().await
            .map_err(|e| DatabaseError::ConnectionError(e.to_string()))?;

        let rows = client.query(
            "SELECT name FROM schema_migrations ORDER BY applied_at",
            &[],
        ).await.map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        Ok(rows.iter().map(|row| row.get("name")).collect())
    }
}
