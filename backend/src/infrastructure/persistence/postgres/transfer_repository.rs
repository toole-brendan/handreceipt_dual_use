use std::sync::Arc;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use crate::domain::transfer::{
    Transfer,
    TransferStatus,
    TransferError,
    TransferRepository,
    TransferTransaction,
};

/// PostgreSQL implementation of TransferRepository
pub struct PostgresTransferRepository {
    pool: Arc<PgPool>,
}

impl PostgresTransferRepository {
    pub fn new(pool: Arc<PgPool>) -> Self {
        Self { pool }
    }

    /// Maps database errors to transfer errors
    fn map_error(&self, error: sqlx::Error) -> TransferError {
        match error {
            sqlx::Error::RowNotFound => {
                TransferError::Repository("Transfer not found".to_string())
            }
            sqlx::Error::Database(db_error) => {
                if db_error.is_unique_violation() {
                    TransferError::Repository("Duplicate transfer".to_string())
                } else {
                    TransferError::Repository(db_error.to_string())
                }
            }
            _ => TransferError::Repository(error.to_string()),
        }
    }

    /// Converts a database row to a Transfer entity
    async fn row_to_transfer(&self, row: sqlx::postgres::PgRow) -> Result<Transfer, TransferError> {
        let status: String = row.try_get("status")?;
        let status = match status.as_str() {
            "PENDING" => TransferStatus::Pending,
            "PENDING_APPROVAL" => TransferStatus::PendingApproval,
            "APPROVED" => TransferStatus::Approved,
            "REJECTED" => TransferStatus::Rejected,
            "COMPLETED" => TransferStatus::Completed,
            "CANCELLED" => TransferStatus::Cancelled,
            _ => return Err(TransferError::Repository("Invalid status".to_string())),
        };

        let location = if let (Some(building), Some(room)) = (
            row.try_get::<Option<String>, _>("location_building")?,
            row.try_get::<Option<String>, _>("location_room")?,
        ) {
            Some(crate::domain::property::Location {
                building,
                room: Some(room),
                notes: row.try_get("location_notes")?,
                grid_coordinates: row.try_get("location_grid")?,
            })
        } else {
            None
        };

        Ok(Transfer {
            id: row.try_get("id")?,
            property_id: row.try_get("property_id")?,
            from_custodian: row.try_get("from_custodian")?,
            to_custodian: row.try_get("to_custodian")?,
            status,
            requires_approval: row.try_get("requires_approval")?,
            location,
            notes: row.try_get("notes")?,
            blockchain_verification: row.try_get("blockchain_verification")?,
            created_at: row.try_get("created_at")?,
            updated_at: row.try_get("updated_at")?,
            completed_at: row.try_get("completed_at")?,
        })
    }
}

#[async_trait]
impl TransferRepository for PostgresTransferRepository {
    async fn create(&self, transfer: Transfer) -> Result<Transfer, TransferError> {
        let mut tx = self.pool.begin().await.map_err(|e| self.map_error(e))?;

        // Insert transfer record
        sqlx::query!(
            r#"
            INSERT INTO transfers (
                id, property_id, from_custodian, to_custodian,
                status, requires_approval, notes, blockchain_verification,
                created_at, updated_at, completed_at,
                location_building, location_room, location_notes, location_grid
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            "#,
            transfer.id(),
            transfer.property_id(),
            transfer.from_custodian(),
            transfer.to_custodian(),
            transfer.status().to_string(),
            transfer.requires_approval(),
            transfer.notes(),
            transfer.blockchain_verification(),
            transfer.created_at(),
            transfer.updated_at(),
            transfer.completed_at(),
            transfer.location().map(|l| l.building.clone()),
            transfer.location().and_then(|l| l.room.clone()),
            transfer.location().and_then(|l| l.notes.clone()),
            transfer.location().and_then(|l| l.grid_coordinates.clone()),
        )
        .execute(&mut tx)
        .await
        .map_err(|e| self.map_error(e))?;

        tx.commit().await.map_err(|e| self.map_error(e))?;

        Ok(transfer)
    }

    async fn get_by_id(&self, id: Uuid) -> Result<Transfer, TransferError> {
        let row = sqlx::query!(
            r#"
            SELECT * FROM transfers WHERE id = $1
            "#,
            id
        )
        .fetch_one(&*self.pool)
        .await
        .map_err(|e| self.map_error(e))?;

        self.row_to_transfer(row).await
    }

    async fn update(&self, transfer: Transfer) -> Result<Transfer, TransferError> {
        let mut tx = self.pool.begin().await.map_err(|e| self.map_error(e))?;

        sqlx::query!(
            r#"
            UPDATE transfers SET
                status = $1,
                notes = $2,
                blockchain_verification = $3,
                updated_at = $4,
                completed_at = $5,
                location_building = $6,
                location_room = $7,
                location_notes = $8,
                location_grid = $9
            WHERE id = $10
            "#,
            transfer.status().to_string(),
            transfer.notes(),
            transfer.blockchain_verification(),
            transfer.updated_at(),
            transfer.completed_at(),
            transfer.location().map(|l| l.building.clone()),
            transfer.location().and_then(|l| l.room.clone()),
            transfer.location().and_then(|l| l.notes.clone()),
            transfer.location().and_then(|l| l.grid_coordinates.clone()),
            transfer.id(),
        )
        .execute(&mut tx)
        .await
        .map_err(|e| self.map_error(e))?;

        tx.commit().await.map_err(|e| self.map_error(e))?;

        Ok(transfer)
    }

    async fn get_by_custodian(
        &self,
        custodian: &str,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<Transfer>, TransferError> {
        let rows = sqlx::query!(
            r#"
            SELECT * FROM transfers
            WHERE from_custodian = $1 OR to_custodian = $1
            ORDER BY created_at DESC
            LIMIT $2
            OFFSET $3
            "#,
            custodian,
            limit.unwrap_or(50),
            offset.unwrap_or(0),
        )
        .fetch_all(&*self.pool)
        .await
        .map_err(|e| self.map_error(e))?;

        let mut transfers = Vec::new();
        for row in rows {
            transfers.push(self.row_to_transfer(row).await?);
        }

        Ok(transfers)
    }

    async fn get_pending_approvals(
        &self,
        commander_id: &str,
    ) -> Result<Vec<Transfer>, TransferError> {
        let rows = sqlx::query!(
            r#"
            SELECT t.* FROM transfers t
            JOIN property p ON t.property_id = p.id
            WHERE t.status = 'PENDING_APPROVAL'
            AND p.unit = (
                SELECT unit FROM users WHERE id = $1
            )
            ORDER BY t.created_at ASC
            "#,
            commander_id,
        )
        .fetch_all(&*self.pool)
        .await
        .map_err(|e| self.map_error(e))?;

        let mut transfers = Vec::new();
        for row in rows {
            transfers.push(self.row_to_transfer(row).await?);
        }

        Ok(transfers)
    }

    async fn get_by_property(
        &self,
        property_id: Uuid,
    ) -> Result<Vec<Transfer>, TransferError> {
        let rows = sqlx::query!(
            r#"
            SELECT * FROM transfers
            WHERE property_id = $1
            ORDER BY created_at DESC
            "#,
            property_id,
        )
        .fetch_all(&*self.pool)
        .await
        .map_err(|e| self.map_error(e))?;

        let mut transfers = Vec::new();
        for row in rows {
            transfers.push(self.row_to_transfer(row).await?);
        }

        Ok(transfers)
    }

    async fn begin_transaction(&self) -> Result<Box<dyn TransferTransaction>, TransferError> {
        let tx = self.pool.begin().await.map_err(|e| self.map_error(e))?;
        Ok(Box::new(PostgresTransferTransaction { tx }))
    }
}

/// PostgreSQL implementation of TransferTransaction
pub struct PostgresTransferTransaction {
    tx: Transaction<'static, Postgres>,
}

#[async_trait]
impl TransferTransaction for PostgresTransferTransaction {
    async fn commit(self: Box<Self>) -> Result<(), TransferError> {
        self.tx
            .commit()
            .await
            .map_err(|e| TransferError::Repository(e.to_string()))
    }

    async fn rollback(self: Box<Self>) -> Result<(), TransferError> {
        self.tx
            .rollback()
            .await
            .map_err(|e| TransferError::Repository(e.to_string()))
    }

    async fn create(&mut self, transfer: Transfer) -> Result<Transfer, TransferError> {
        sqlx::query!(
            r#"
            INSERT INTO transfers (
                id, property_id, from_custodian, to_custodian,
                status, requires_approval, notes, blockchain_verification,
                created_at, updated_at, completed_at,
                location_building, location_room, location_notes, location_grid
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            "#,
            transfer.id(),
            transfer.property_id(),
            transfer.from_custodian(),
            transfer.to_custodian(),
            transfer.status().to_string(),
            transfer.requires_approval(),
            transfer.notes(),
            transfer.blockchain_verification(),
            transfer.created_at(),
            transfer.updated_at(),
            transfer.completed_at(),
            transfer.location().map(|l| l.building.clone()),
            transfer.location().and_then(|l| l.room.clone()),
            transfer.location().and_then(|l| l.notes.clone()),
            transfer.location().and_then(|l| l.grid_coordinates.clone()),
        )
        .execute(&mut self.tx)
        .await
        .map_err(|e| TransferError::Repository(e.to_string()))?;

        Ok(transfer)
    }

    async fn update(&mut self, transfer: Transfer) -> Result<Transfer, TransferError> {
        sqlx::query!(
            r#"
            UPDATE transfers SET
                status = $1,
                notes = $2,
                blockchain_verification = $3,
                updated_at = $4,
                completed_at = $5,
                location_building = $6,
                location_room = $7,
                location_notes = $8,
                location_grid = $9
            WHERE id = $10
            "#,
            transfer.status().to_string(),
            transfer.notes(),
            transfer.blockchain_verification(),
            transfer.updated_at(),
            transfer.completed_at(),
            transfer.location().map(|l| l.building.clone()),
            transfer.location().and_then(|l| l.room.clone()),
            transfer.location().and_then(|l| l.notes.clone()),
            transfer.location().and_then(|l| l.grid_coordinates.clone()),
            transfer.id(),
        )
        .execute(&mut self.tx)
        .await
        .map_err(|e| TransferError::Repository(e.to_string()))?;

        Ok(transfer)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::postgres::PgPoolOptions;
    use std::env;

    async fn create_test_pool() -> Arc<PgPool> {
        let database_url = env::var("DATABASE_URL")
            .expect("DATABASE_URL must be set for tests");
        
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await
            .expect("Failed to create connection pool");

        Arc::new(pool)
    }

    #[sqlx::test]
    async fn test_transfer_crud() {
        let pool = create_test_pool().await;
        let repository = PostgresTransferRepository::new(pool);

        // Create transfer
        let transfer = Transfer::new(
            Uuid::new_v4(),
            Some("OLD_CUSTODIAN".to_string()),
            "NEW_CUSTODIAN".to_string(),
            true,
            None,
            None,
        );

        let created = repository.create(transfer.clone()).await.unwrap();
        assert_eq!(created.id(), transfer.id());

        // Get transfer
        let retrieved = repository.get_by_id(created.id()).await.unwrap();
        assert_eq!(retrieved.to_custodian(), created.to_custodian());

        // Update transfer
        let mut updated = retrieved.clone();
        updated.approve().unwrap();
        let updated = repository.update(updated).await.unwrap();
        assert_eq!(updated.status(), &TransferStatus::Approved);

        // Get by custodian
        let transfers = repository
            .get_by_custodian("NEW_CUSTODIAN", Some(10), Some(0))
            .await
            .unwrap();
        assert!(!transfers.is_empty());
        assert_eq!(transfers[0].id(), created.id());
    }
}
