//! PostgreSQL extensions module
//! Handles initialization and management of PostgreSQL extensions

use crate::types::error::DatabaseError;

pub mod pgaudit;
pub mod pgcrypto;

/// Extension manager
pub struct ExtensionManager {
    pool: deadpool_postgres::Pool,
}

impl ExtensionManager {
    pub fn new(pool: deadpool_postgres::Pool) -> Self {
        Self { pool }
    }

    /// Initialize all required extensions
    pub async fn init_extensions(&self) -> Result<(), DatabaseError> {
        let client = self.pool.get().await
            .map_err(|e| DatabaseError::ConnectionError(e.to_string()))?;

        // Create extensions in a transaction
        let transaction = client.transaction().await
            .map_err(|e| DatabaseError::TransactionError(e.to_string()))?;

        // pgcrypto for encryption functions
        transaction.execute(
            "CREATE EXTENSION IF NOT EXISTS pgcrypto",
            &[],
        ).await.map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        // pgaudit for audit logging
        transaction.execute(
            "CREATE EXTENSION IF NOT EXISTS pgaudit",
            &[],
        ).await.map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        // postgis for location data
        transaction.execute(
            "CREATE EXTENSION IF NOT EXISTS postgis",
            &[],
        ).await.map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        transaction.commit().await
            .map_err(|e| DatabaseError::TransactionError(e.to_string()))?;

        Ok(())
    }

    /// Configure pgaudit extension
    pub async fn configure_audit(&self) -> Result<(), DatabaseError> {
        let client = self.pool.get().await
            .map_err(|e| DatabaseError::ConnectionError(e.to_string()))?;

        // Configure pgaudit settings
        client.batch_execute("
            ALTER SYSTEM SET pgaudit.log = 'write, function, role, ddl';
            ALTER SYSTEM SET pgaudit.log_catalog = off;
            ALTER SYSTEM SET pgaudit.log_client = on;
            ALTER SYSTEM SET pgaudit.log_level = 'log';
            ALTER SYSTEM SET pgaudit.log_parameter = on;
            ALTER SYSTEM SET pgaudit.log_relation = on;
            ALTER SYSTEM SET pgaudit.log_statement_once = off;
            ALTER SYSTEM SET pgaudit.role = 'auditor';
        ").await.map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        Ok(())
    }

    /// Configure pgcrypto extension
    pub async fn configure_crypto(&self) -> Result<(), DatabaseError> {
        let client = self.pool.get().await
            .map_err(|e| DatabaseError::ConnectionError(e.to_string()))?;

        // Create encryption keys table if it doesn't exist
        client.execute("
            CREATE TABLE IF NOT EXISTS encryption_keys (
                id UUID PRIMARY KEY,
                key_type TEXT NOT NULL,
                public_key TEXT,
                private_key TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                expires_at TIMESTAMP WITH TIME ZONE,
                metadata JSONB
            )", &[]
        ).await.map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        Ok(())
    }

    /// Get list of installed extensions
    pub async fn get_installed_extensions(&self) -> Result<Vec<String>, DatabaseError> {
        let client = self.pool.get().await
            .map_err(|e| DatabaseError::ConnectionError(e.to_string()))?;

        let rows = client.query(
            "SELECT extname FROM pg_extension",
            &[],
        ).await.map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        Ok(rows.iter().map(|row| row.get("extname")).collect())
    }
}
