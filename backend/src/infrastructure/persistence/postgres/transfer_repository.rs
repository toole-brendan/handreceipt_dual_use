use async_trait::async_trait;
use sqlx::{PgPool, Row};
use crate::{
    domain::transfer::{
        entity::{Transfer, TransferStatus},
        repository::TransferRepository,
    },
    error::repository::RepositoryError,
    domain::models::location::Location,
};

pub struct PgTransferRepository {
    pool: PgPool,
}

impl PgTransferRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl TransferRepository for PgTransferRepository {
    async fn create_transfer(&self, transfer: Transfer) -> Result<Transfer, RepositoryError> {
        let record = sqlx::query!(
            r#"
            INSERT INTO transfers (
                property_id, from_holder_id, to_holder_id, status, location,
                notes, metadata
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, created_at, updated_at
            "#,
            transfer.property_id,
            transfer.from_holder_id,
            transfer.to_holder_id,
            transfer.status as TransferStatus,
            serde_json::to_value(&transfer.location).map_err(|e| RepositoryError::Serialization(e.to_string()))?,
            transfer.notes,
            transfer.metadata,
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;

        Ok(Transfer {
            id: record.id,
            property_id: transfer.property_id,
            from_holder_id: transfer.from_holder_id,
            to_holder_id: transfer.to_holder_id,
            status: transfer.status,
            location: transfer.location,
            created_at: record.created_at,
            updated_at: record.updated_at,
            approved_at: None,
            approved_by_id: None,
            notes: transfer.notes,
            metadata: transfer.metadata,
        })
    }

    async fn update_transfer(&self, transfer: &Transfer) -> Result<(), RepositoryError> {
        sqlx::query!(
            r#"
            UPDATE transfers
            SET status = $1, location = $2, notes = $3, metadata = $4,
                approved_at = $5, approved_by_id = $6, updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            "#,
            transfer.status as TransferStatus,
            serde_json::to_value(&transfer.location).map_err(|e| RepositoryError::Serialization(e.to_string()))?,
            transfer.notes,
            transfer.metadata,
            transfer.approved_at,
            transfer.approved_by_id,
            transfer.id,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;

        Ok(())
    }

    async fn get_transfer(&self, id: i32) -> Result<Option<Transfer>, RepositoryError> {
        let record = sqlx::query!(
            r#"
            SELECT 
                id, property_id, from_holder_id, to_holder_id,
                status as "status: TransferStatus",
                location, created_at, updated_at,
                approved_at, approved_by_id, notes, metadata
            FROM transfers 
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;

        match record {
            Some(r) => {
                let location: Location = serde_json::from_value(r.location)
                    .map_err(|e| RepositoryError::Serialization(e.to_string()))?;

                Ok(Some(Transfer {
                    id: r.id,
                    property_id: r.property_id,
                    from_holder_id: r.from_holder_id,
                    to_holder_id: r.to_holder_id,
                    status: r.status,
                    location,
                    created_at: r.created_at,
                    updated_at: r.updated_at,
                    approved_at: r.approved_at,
                    approved_by_id: r.approved_by_id,
                    notes: r.notes,
                    metadata: r.metadata,
                }))
            }
            None => Ok(None),
        }
    }

    async fn delete_transfer(&self, id: i32) -> Result<(), RepositoryError> {
        sqlx::query!(
            "DELETE FROM transfers WHERE id = $1",
            id
        )
        .execute(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;

        Ok(())
    }

    async fn list_transfers(&self) -> Result<Vec<Transfer>, RepositoryError> {
        let records = sqlx::query!(
            r#"
            SELECT 
                id, property_id, from_holder_id, to_holder_id,
                status as "status: TransferStatus",
                location, created_at, updated_at,
                approved_at, approved_by_id, notes, metadata
            FROM transfers
            ORDER BY created_at DESC
            "#
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;

        let mut transfers = Vec::new();
        for r in records {
            let location: Location = serde_json::from_value(r.location)
                .map_err(|e| RepositoryError::Serialization(e.to_string()))?;

            transfers.push(Transfer {
                id: r.id,
                property_id: r.property_id,
                from_holder_id: r.from_holder_id,
                to_holder_id: r.to_holder_id,
                status: r.status,
                location,
                created_at: r.created_at,
                updated_at: r.updated_at,
                approved_at: r.approved_at,
                approved_by_id: r.approved_by_id,
                notes: r.notes,
                metadata: r.metadata,
            });
        }

        Ok(transfers)
    }

    async fn list_by_property(&self, property_id: i32) -> Result<Vec<Transfer>, RepositoryError> {
        let records = sqlx::query!(
            r#"
            SELECT 
                id, property_id, from_holder_id, to_holder_id,
                status as "status: TransferStatus",
                location, created_at, updated_at,
                approved_at, approved_by_id, notes, metadata
            FROM transfers 
            WHERE property_id = $1
            ORDER BY created_at DESC
            "#,
            property_id
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;

        let mut transfers = Vec::new();
        for r in records {
            let location: Location = serde_json::from_value(r.location)
                .map_err(|e| RepositoryError::Serialization(e.to_string()))?;

            transfers.push(Transfer {
                id: r.id,
                property_id: r.property_id,
                from_holder_id: r.from_holder_id,
                to_holder_id: r.to_holder_id,
                status: r.status,
                location,
                created_at: r.created_at,
                updated_at: r.updated_at,
                approved_at: r.approved_at,
                approved_by_id: r.approved_by_id,
                notes: r.notes,
                metadata: r.metadata,
            });
        }

        Ok(transfers)
    }
}
