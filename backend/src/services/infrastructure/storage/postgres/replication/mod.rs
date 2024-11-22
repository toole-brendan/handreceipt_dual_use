//! PostgreSQL replication module
//! Handles logical replication and synchronization between database instances

use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::types::error::DatabaseError;

/// Replication status
#[derive(Debug, Clone, PartialEq)]
pub enum ReplicationStatus {
    Healthy,
    Degraded,
    Failed,
}

/// Replication configuration
#[derive(Debug, Clone)]
pub struct ReplicationConfig {
    pub enabled: bool,
    pub primary_host: String,
    pub primary_port: u16,
    pub replication_slot: String,
    pub publication_name: String,
    pub subscription_name: String,
    pub max_lag_seconds: i64,
}

impl Default for ReplicationConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            primary_host: "localhost".to_string(),
            primary_port: 5432,
            replication_slot: "mats26_replication".to_string(),
            publication_name: "mats26_pub".to_string(),
            subscription_name: "mats26_sub".to_string(),
            max_lag_seconds: 300, // 5 minutes
        }
    }
}

/// Replication manager
pub struct ReplicationManager {
    pool: deadpool_postgres::Pool,
    config: ReplicationConfig,
    status: Arc<RwLock<ReplicationStatus>>,
}

impl ReplicationManager {
    pub fn new(pool: deadpool_postgres::Pool, config: ReplicationConfig) -> Self {
        Self {
            pool,
            config,
            status: Arc::new(RwLock::new(ReplicationStatus::Healthy)),
        }
    }

    /// Initialize replication
    pub async fn init_replication(&self) -> Result<(), DatabaseError> {
        if !self.config.enabled {
            return Ok(());
        }

        let client = self.pool.get().await
            .map_err(|e| DatabaseError::ConnectionError(e.to_string()))?;

        // Create publication on primary
        client.execute(&format!(
            "CREATE PUBLICATION {} FOR ALL TABLES",
            self.config.publication_name
        ), &[]).await.map_err(|e| DatabaseError::ReplicationError(e.to_string()))?;

        // Create replication slot
        client.execute(&format!(
            "SELECT pg_create_logical_replication_slot('{}', 'pgoutput')",
            self.config.replication_slot
        ), &[]).await.map_err(|e| DatabaseError::ReplicationError(e.to_string()))?;

        // Create subscription on replica
        client.execute(&format!(
            "CREATE SUBSCRIPTION {} 
            CONNECTION 'host={} port={} dbname=mats26 user=replicator'
            PUBLICATION {}",
            self.config.subscription_name,
            self.config.primary_host,
            self.config.primary_port,
            self.config.publication_name
        ), &[]).await.map_err(|e| DatabaseError::ReplicationError(e.to_string()))?;

        Ok(())
    }

    /// Check replication status
    pub async fn check_status(&self) -> Result<ReplicationStatus, DatabaseError> {
        if !self.config.enabled {
            return Ok(ReplicationStatus::Healthy);
        }

        let client = self.pool.get().await
            .map_err(|e| DatabaseError::ConnectionError(e.to_string()))?;

        // Check replication lag
        let row = client.query_one(
            "SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) as lag",
            &[],
        ).await.map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        let lag: f64 = row.get("lag");

        let status = if lag > self.config.max_lag_seconds as f64 {
            ReplicationStatus::Degraded
        } else {
            ReplicationStatus::Healthy
        };

        let mut current_status = self.status.write().await;
        *current_status = status.clone();

        Ok(status)
    }

    /// Get current replication status
    pub async fn get_status(&self) -> ReplicationStatus {
        self.status.read().await.clone()
    }

    /// Stop replication
    pub async fn stop_replication(&self) -> Result<(), DatabaseError> {
        if !self.config.enabled {
            return Ok(());
        }

        let client = self.pool.get().await
            .map_err(|e| DatabaseError::ConnectionError(e.to_string()))?;

        // Drop subscription
        client.execute(&format!(
            "DROP SUBSCRIPTION IF EXISTS {}",
            self.config.subscription_name
        ), &[]).await.map_err(|e| DatabaseError::ReplicationError(e.to_string()))?;

        // Drop publication
        client.execute(&format!(
            "DROP PUBLICATION IF EXISTS {}",
            self.config.publication_name
        ), &[]).await.map_err(|e| DatabaseError::ReplicationError(e.to_string()))?;

        // Drop replication slot
        client.execute(&format!(
            "SELECT pg_drop_replication_slot('{}')",
            self.config.replication_slot
        ), &[]).await.map_err(|e| DatabaseError::ReplicationError(e.to_string()))?;

        Ok(())
    }
}
