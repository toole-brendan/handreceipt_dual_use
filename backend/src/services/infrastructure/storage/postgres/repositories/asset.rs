use async_trait::async_trait;
use uuid::Uuid;
use crate::types::{
    asset::Asset,
    error::CoreError,
    security::SecurityContext,
};
use crate::services::infrastructure::storage::{DatabaseConnection, FromRow};
use super::super::models::{JsonMetadata, JsonSignatures, JsonLocationHistory, GeometryWrapper};

pub struct PostgresAssetRepository;

impl Default for PostgresAssetRepository {
    fn default() -> Self {
        Self
    }
}

impl FromRow for Asset {
    fn from_row(row: &tokio_postgres::Row) -> Result<Self, CoreError> {
        let metadata = row.try_get::<_, JsonMetadata>("metadata")?.0;
        let signatures = row.try_get::<_, JsonSignatures>("signatures")?.0;
        let location_history = row.try_get::<_, JsonLocationHistory>("location_history")?.0;
        let last_known_location = row.try_get::<_, Option<GeometryWrapper>>("last_known_location")?
            .map(|wrapper| wrapper.0.into());

        Ok(Asset {
            id: row.try_get("id")?,
            name: row.try_get("name")?,
            description: row.try_get("description")?,
            status: row.try_get("status")?,
            classification: row.try_get::<_, String>("classification")?
                .parse()
                .map_err(|e| CoreError::Database(e.to_string()))?,
            metadata,
            signatures,
            created_at: row.try_get("created_at")?,
            updated_at: row.try_get("updated_at")?,
            qr_code: row.try_get("qr_code")?,
            last_verified: row.try_get("last_verified")?,
            verification_count: row.try_get("verification_count")?,
            rfid_tag_id: row.try_get("rfid_tag_id")?,
            rfid_last_scanned: row.try_get("rfid_last_scanned")?,
            token_id: row.try_get("token_id")?,
            current_custodian: row.try_get("current_custodian")?,
            hand_receipt_hash: row.try_get("hand_receipt_hash")?,
            last_known_location,
            location_history,
            geofence_restrictions: row.try_get("geofence_restrictions")?,
            location_classification: row.try_get::<_, String>("location_classification")?
                .parse()
                .map_err(|e| CoreError::Database(e.to_string()))?,
        })
    }
}

impl PostgresAssetRepository {
    pub async fn get_by_id<'a>(
        &'a self,
        conn: &'a impl DatabaseConnection,
        id: Uuid,
        context: &'a SecurityContext,
    ) -> Result<Option<Asset>, CoreError> {
        let rows = conn.query(
            "SELECT * FROM assets WHERE id = $1 AND classification <= $2",
            &[&id, &context.classification.to_string()],
        ).await?;

        if let Some(row) = rows.get(0) {
            Ok(Some(Asset::from_row(row)?))
        } else {
            Ok(None)
        }
    }

    pub async fn update<'a>(
        &'a self,
        conn: &'a impl DatabaseConnection,
        asset: &'a Asset,
        context: &'a SecurityContext,
    ) -> Result<(), CoreError> {
        if asset.classification > context.classification {
            return Err(CoreError::ValidationError("Insufficient clearance".to_string()));
        }

        let metadata = JsonMetadata(asset.metadata.clone());
        let signatures = JsonSignatures(asset.signatures.clone());
        let location_history = JsonLocationHistory(asset.location_history.clone());
        let last_known_location = asset.last_known_location.as_ref()
            .map(|point| GeometryWrapper(point.clone().into()));

        conn.execute(
            "UPDATE assets SET 
                name = $1,
                description = $2,
                status = $3,
                classification = $4,
                metadata = $5,
                signatures = $6,
                updated_at = $7,
                qr_code = $8,
                last_verified = $9,
                verification_count = $10,
                rfid_tag_id = $11,
                rfid_last_scanned = $12,
                token_id = $13,
                current_custodian = $14,
                hand_receipt_hash = $15,
                last_known_location = $16,
                location_history = $17,
                geofence_restrictions = $18,
                location_classification = $19
            WHERE id = $20 AND classification <= $21",
            &[
                &asset.name,
                &asset.description,
                &asset.status,
                &asset.classification.to_string(),
                &metadata,
                &signatures,
                &asset.updated_at,
                &asset.qr_code,
                &asset.last_verified,
                &asset.verification_count,
                &asset.rfid_tag_id,
                &asset.rfid_last_scanned,
                &asset.token_id,
                &asset.current_custodian,
                &asset.hand_receipt_hash,
                &last_known_location,
                &location_history,
                &asset.geofence_restrictions,
                &asset.location_classification.to_string(),
                &asset.id,
                &context.classification.to_string(),
            ],
        ).await?;

        Ok(())
    }

    pub async fn list<'a>(
        &'a self,
        conn: &'a impl DatabaseConnection,
        context: &'a SecurityContext,
    ) -> Result<Vec<Asset>, CoreError> {
        let rows = conn.query(
            "SELECT * FROM assets WHERE classification <= $1",
            &[&context.classification.to_string()],
        ).await?;

        let mut assets = Vec::with_capacity(rows.len());
        for row in rows {
            assets.push(Asset::from_row(&row)?);
        }
        Ok(assets)
    }

    pub async fn delete<'a>(
        &'a self,
        conn: &'a impl DatabaseConnection,
        id: Uuid,
        context: &'a SecurityContext,
    ) -> Result<bool, CoreError> {
        let result = conn.execute(
            "DELETE FROM assets WHERE id = $1 AND classification <= $2",
            &[&id, &context.classification.to_string()],
        ).await?;

        Ok(result > 0)
    }
}
