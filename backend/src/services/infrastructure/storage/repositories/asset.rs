use async_trait::async_trait;
use uuid::Uuid;
use crate::types::{
    asset::Asset,
    error::CoreError,
    security::SecurityContext,
};
use super::Repository;
use super::super::connection::DatabaseConnection;

pub struct AssetRepository;

impl Default for AssetRepository {
    fn default() -> Self {
        Self
    }
}

#[async_trait]
impl Repository<Asset, Uuid> for AssetRepository {
    async fn get_by_id(
        &self,
        conn: &dyn DatabaseConnection,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<Option<Asset>, CoreError> {
        let rows = conn.query(
            "SELECT * FROM assets WHERE id = $1 AND classification <= $2",
            &[&id, &context.classification],
        ).await?;

        if let Some(row) = rows.get(0) {
            Ok(Some(Asset::from_row(row)?))
        } else {
            Ok(None)
        }
    }

    async fn update(
        &self,
        conn: &dyn DatabaseConnection,
        asset: &Asset,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        conn.execute(
            "UPDATE assets SET data = $1 WHERE id = $2 AND classification <= $3",
            &[
                &serde_json::to_value(asset)?,
                &asset.id,
                &context.classification,
            ],
        ).await?;

        Ok(())
    }

    async fn list(
        &self,
        conn: &dyn DatabaseConnection,
        context: &SecurityContext,
    ) -> Result<Vec<Asset>, CoreError> {
        let rows = conn.query(
            "SELECT * FROM assets WHERE classification <= $1",
            &[&context.classification],
        ).await?;

        let mut assets = Vec::with_capacity(rows.len());
        for row in rows {
            assets.push(Asset::from_row(&row)?);
        }
        Ok(assets)
    }

    async fn delete(
        &self,
        conn: &dyn DatabaseConnection,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<bool, CoreError> {
        let result = conn.execute(
            "DELETE FROM assets WHERE id = $1 AND classification <= $2",
            &[&id, &context.classification],
        ).await?;

        Ok(result > 0)
    }
} 