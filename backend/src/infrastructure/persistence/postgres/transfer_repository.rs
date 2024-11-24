use async_trait::async_trait;
use sqlx::PgPool;
use uuid::Uuid;
use chrono::Utc;

use crate::domain::transfer::{
    entity::Transfer,
    repository::{TransferRepository, TransferError},
};

pub struct PostgresTransferRepository {
    pool: PgPool,
}

impl PostgresTransferRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl TransferRepository for PostgresTransferRepository {
    async fn create(&self, transfer: Transfer) -> Result<Transfer, TransferError> {
        let mut tx = self.pool
            .begin()
            .await
            .map_err(|e| TransferError::Repository(e.to_string()))?;

        sqlx::query(
            r#"
            INSERT INTO transfers (
                id, property_id, from_custodian, to_custodian,
                status, requires_approval, notes, blockchain_verification,
                officer_id, officer_notes, hand_receipt_number,
                sub_hand_receipt_number, created_at, updated_at, completed_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            )
            "#,
        )
        .bind(transfer.id())
        .bind(transfer.property_id())
        .bind(transfer.from_custodian())
        .bind(transfer.to_custodian())
        .bind(format!("{:?}", transfer.status()))
        .bind(transfer.requires_approval())
        .bind(transfer.notes())
        .bind(transfer.blockchain_verification())
        .bind(None::<String>) // officer_id
        .bind(None::<String>) // officer_notes
        .bind(transfer.hand_receipt_number())
        .bind(transfer.sub_hand_receipt_number())
        .bind(transfer.created_at())
        .bind(Utc::now())
        .bind(transfer.completed_at())
        .execute(&mut *tx)
        .await
        .map_err(|e| TransferError::Repository(e.to_string()))?;

        tx.commit()
            .await
            .map_err(|e| TransferError::Repository(e.to_string()))?;

        Ok(transfer)
    }

    async fn get_by_id(&self, id: Uuid) -> Result<Transfer, TransferError> {
        let row = sqlx::query(
            r#"
            SELECT * FROM transfers WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| TransferError::Repository(e.to_string()))?;

        // TODO: Implement transfer row mapping
        unimplemented!("Transfer row mapping not implemented")
    }

    async fn update(&self, transfer: Transfer) -> Result<Transfer, TransferError> {
        let mut tx = self.pool
            .begin()
            .await
            .map_err(|e| TransferError::Repository(e.to_string()))?;

        sqlx::query(
            r#"
            UPDATE transfers SET
                status = $1,
                notes = $2,
                blockchain_verification = $3,
                officer_id = $4,
                officer_notes = $5,
                hand_receipt_number = $6,
                sub_hand_receipt_number = $7,
                updated_at = $8,
                completed_at = $9
            WHERE id = $10
            "#,
        )
        .bind(format!("{:?}", transfer.status()))
        .bind(transfer.notes())
        .bind(transfer.blockchain_verification())
        .bind(None::<String>) // officer_id
        .bind(None::<String>) // officer_notes
        .bind(transfer.hand_receipt_number())
        .bind(transfer.sub_hand_receipt_number())
        .bind(Utc::now())
        .bind(transfer.completed_at())
        .bind(transfer.id())
        .execute(&mut *tx)
        .await
        .map_err(|e| TransferError::Repository(e.to_string()))?;

        tx.commit()
            .await
            .map_err(|e| TransferError::Repository(e.to_string()))?;

        Ok(transfer)
    }

    async fn get_by_custodian(
        &self,
        custodian: &str,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<Transfer>, TransferError> {
        let rows = sqlx::query(
            r#"
            SELECT * FROM transfers 
            WHERE from_custodian = $1 OR to_custodian = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(custodian)
        .bind(limit.unwrap_or(100))
        .bind(offset.unwrap_or(0))
        .fetch_all(&self.pool)
        .await
        .map_err(|e| TransferError::Repository(e.to_string()))?;

        // TODO: Implement transfer row mapping
        unimplemented!("Transfer row mapping not implemented")
    }

    async fn get_pending_approvals(
        &self,
        commander_id: &str,
    ) -> Result<Vec<Transfer>, TransferError> {
        let rows = sqlx::query(
            r#"
            SELECT t.* FROM transfers t
            JOIN command_hierarchy ch ON t.to_custodian = ch.unit_id
            WHERE ch.commander_id = $1 AND t.status = 'PENDING_APPROVAL'
            "#,
        )
        .bind(commander_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| TransferError::Repository(e.to_string()))?;

        // TODO: Implement transfer row mapping
        unimplemented!("Transfer row mapping not implemented")
    }

    async fn get_by_property(
        &self,
        property_id: Uuid,
    ) -> Result<Vec<Transfer>, TransferError> {
        let rows = sqlx::query(
            r#"
            SELECT * FROM transfers WHERE property_id = $1
            ORDER BY created_at DESC
            "#,
        )
        .bind(property_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| TransferError::Repository(e.to_string()))?;

        // TODO: Implement transfer row mapping
        unimplemented!("Transfer row mapping not implemented")
    }

    async fn get_pending_transfers(&self, user_id: &str) -> Result<Vec<Transfer>, TransferError> {
        let rows = sqlx::query(
            r#"
            SELECT * FROM transfers 
            WHERE (from_custodian = $1 OR to_custodian = $1)
            AND (status = 'PENDING' OR status = 'PENDING_APPROVAL')
            ORDER BY created_at DESC
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| TransferError::Repository(e.to_string()))?;

        // TODO: Implement transfer row mapping
        unimplemented!("Transfer row mapping not implemented")
    }

    async fn begin_transaction(&self) -> Result<Box<dyn crate::domain::transfer::repository::TransferTransaction>, TransferError> {
        let tx = self.pool
            .begin()
            .await
            .map_err(|e| TransferError::Repository(e.to_string()))?;

        Ok(Box::new(PostgresTransferTransaction { tx }))
    }
}

pub struct PostgresTransferTransaction {
    tx: sqlx::Transaction<'static, sqlx::Postgres>,
}

#[async_trait]
impl crate::domain::transfer::repository::TransferTransaction for PostgresTransferTransaction {
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
        // TODO: Implement transaction-aware create
        unimplemented!("Transaction create not implemented")
    }

    async fn update(&mut self, transfer: Transfer) -> Result<Transfer, TransferError> {
        // TODO: Implement transaction-aware update
        unimplemented!("Transaction update not implemented")
    }
}
