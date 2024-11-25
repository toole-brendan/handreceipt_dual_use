use sqlx::{sqlite::SqlitePool, Pool, Sqlite};
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use uuid::Uuid;

use crate::{Result, error::Error, scanner::ScanResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SyncStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoredTransfer {
    pub id: Uuid,
    pub property_id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub scan_data: ScanResult,
    pub sync_status: SyncStatus,
    pub retry_count: i32,
}

pub struct Storage {
    pool: Pool<Sqlite>,
}

impl Storage {
    pub async fn new() -> Result<Self> {
        let pool = SqlitePool::connect("sqlite::memory:")
            .await
            .map_err(Error::Database)?;

        // Initialize database
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS transfers (
                id TEXT PRIMARY KEY,
                property_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                scan_data TEXT NOT NULL,
                sync_status TEXT NOT NULL,
                retry_count INTEGER NOT NULL DEFAULT 0
            )
            "#,
        )
        .execute(&pool)
        .await
        .map_err(Error::Database)?;

        Ok(Self { pool })
    }

    pub async fn store_scan(&self, scan: &ScanResult) -> Result<()> {
        let id = Uuid::new_v4();
        let transfer = StoredTransfer {
            id,
            property_id: scan.property_id,
            timestamp: Utc::now(),
            scan_data: scan.clone(),
            sync_status: SyncStatus::Pending,
            retry_count: 0,
        };

        sqlx::query(
            r#"
            INSERT INTO transfers (id, property_id, timestamp, scan_data, sync_status, retry_count)
            VALUES (?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(transfer.id.to_string())
        .bind(transfer.property_id.to_string())
        .bind(transfer.timestamp.to_rfc3339())
        .bind(serde_json::to_string(&transfer.scan_data)?)
        .bind(serde_json::to_string(&transfer.sync_status)?)
        .bind(transfer.retry_count)
        .execute(&self.pool)
        .await
        .map_err(Error::Database)?;

        Ok(())
    }

    pub async fn get_pending_transfers(&self) -> Result<Vec<StoredTransfer>> {
        let rows = sqlx::query(
            r#"
            SELECT id, property_id, timestamp, scan_data, sync_status, retry_count
            FROM transfers
            WHERE sync_status = ?
            ORDER BY timestamp ASC
            "#,
        )
        .bind(serde_json::to_string(&SyncStatus::Pending)?)
        .fetch_all(&self.pool)
        .await
        .map_err(Error::Database)?;

        let mut transfers = Vec::new();
        for row in rows {
            let id: String = row.get(0);
            let property_id: String = row.get(1);
            let timestamp: String = row.get(2);
            let scan_data: String = row.get(3);
            let sync_status: String = row.get(4);
            let retry_count: i32 = row.get(5);

            transfers.push(StoredTransfer {
                id: Uuid::parse_str(&id).map_err(|e| Error::Storage(e.to_string()))?,
                property_id: Uuid::parse_str(&property_id).map_err(|e| Error::Storage(e.to_string()))?,
                timestamp: DateTime::parse_from_rfc3339(&timestamp)
                    .map_err(|e| Error::Storage(e.to_string()))?
                    .with_timezone(&Utc),
                scan_data: serde_json::from_str(&scan_data)?,
                sync_status: serde_json::from_str(&sync_status)?,
                retry_count,
            });
        }

        Ok(transfers)
    }

    pub async fn update_transfer_status(&self, id: Uuid, status: SyncStatus) -> Result<()> {
        sqlx::query(
            r#"
            UPDATE transfers
            SET sync_status = ?, retry_count = retry_count + 1
            WHERE id = ?
            "#,
        )
        .bind(serde_json::to_string(&status)?)
        .bind(id.to_string())
        .execute(&self.pool)
        .await
        .map_err(Error::Database)?;

        Ok(())
    }
} 