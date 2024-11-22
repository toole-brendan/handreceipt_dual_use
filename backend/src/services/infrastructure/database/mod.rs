// backend/src/services/database/mod.rs

use serde_json::Value;
use postgres_types::{accepts, to_sql_checked, ToSql, Type, IsNull};
use bytes::BytesMut;
use std::error::Error as StdError;
use std::sync::Arc;
use uuid::Uuid;
use std::str::FromStr;

use crate::core::{SecurityContext, CoreError, Asset, AssetStatus};
use crate::services::SecurityModule;
use crate::models::UuidWrapper;
use tokio_postgres::types::FromSql;
use crate::models::{LocationMetadata};

pub mod config;

pub struct DatabaseConnection {
    pool: Arc<deadpool_postgres::Pool>,
    security: Arc<SecurityModule>,
}

impl DatabaseConnection {
    pub fn new(
        pool: Arc<deadpool_postgres::Pool>,
        security: Arc<SecurityModule>,
    ) -> Self {
        Self { pool, security }
    }

    pub async fn execute_query(
        &self,
        query: &str,
        params: &[&(dyn ToSql + Sync)],
        _security_context: &SecurityContext,
    ) -> Result<Vec<tokio_postgres::Row>, CoreError> {
        let client = self.pool
            .get()
            .await
            .map_err(|e| CoreError::DatabaseError(e.to_string()))?;

        let stmt = client
            .prepare(query)
            .await
            .map_err(|e| CoreError::DatabaseError(e.to_string()))?;

        client
            .query(&stmt, params)
            .await
            .map_err(|e| CoreError::DatabaseError(e.to_string()))
    }

    pub async fn get_asset(&self, id: Uuid, security_context: &SecurityContext) -> Result<Option<Asset>, CoreError> {
        let rows = self.execute_query(
            "SELECT * FROM assets WHERE id = $1 AND classification <= $2",
            &[&UuidWrapper(id), &security_context.classification],
            security_context,
        ).await?;

        if let Some(row) = rows.get(0) {
            let metadata_json: JsonWrapper = row.get("metadata");
            let metadata = metadata_json.0.as_object()
                .map(|obj| obj.iter()
                    .map(|(k, v)| (k.clone(), v.to_string()))
                    .collect())
                .unwrap_or_default();

            let status_str: String = row.get("status");
            let status = AssetStatus::from_str(&status_str)
                .map_err(|e| CoreError::DatabaseError(format!("Invalid status: {}", e)))?;

            let asset = Asset {
                id: row.get::<_, UuidWrapper>("id").into(),
                name: row.get("name"),
                description: row.get("description"),
                status,
                classification: row.get("classification"),
                metadata,
                signatures: vec![],
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
                qr_code: row.get("qr_code"),
                last_verified: row.get("last_verified"),
                verification_count: row.get("verification_count"),
                rfid_tag_id: row.get("rfid_tag_id"),
                rfid_last_scanned: row.get("rfid_last_scanned"),
                token_id: row.get::<_, Option<UuidWrapper>>("token_id").map(|u| u.into()),
                current_custodian: row.get("current_custodian"),
                hand_receipt_hash: row.get("hand_receipt_hash"),
                last_known_location: row.get("last_known_location"),
                location_history: row.get("location_history"),
                geofence_restrictions: row.get("geofence_restrictions"),
                location_classification: row.get("location_classification"),
            };
            Ok(Some(asset))
        } else {
            Ok(None)
        }
    }

    pub async fn update_asset(&self, asset: &Asset, security_context: &SecurityContext) -> Result<(), CoreError> {
        self.execute_query(
            "UPDATE assets SET ... WHERE id = $1",
            &[&UuidWrapper(asset.id)],
            security_context,
        ).await?;
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct JsonWrapper(pub Value);

impl ToSql for JsonWrapper {
    fn to_sql(&self, ty: &Type, out: &mut BytesMut) -> Result<IsNull, Box<dyn StdError + Send + Sync>> {
        serde_json::to_string(&self.0)
            .map_err(|e| Box::new(e) as Box<dyn StdError + Send + Sync>)?
            .to_sql(ty, out)
    }

    accepts!(JSON, JSONB);
    to_sql_checked!();
}

impl<'a> FromSql<'a> for JsonWrapper {
    fn from_sql(ty: &Type, raw: &'a [u8]) -> Result<Self, Box<dyn StdError + Send + Sync>> {
        let str_value = <&str as FromSql>::from_sql(ty, raw)?;
        let json_value = serde_json::from_str(str_value)
            .map_err(|e| Box::new(e) as Box<dyn StdError + Send + Sync>)?;
        Ok(JsonWrapper(json_value))
    }

    accepts!(JSON, JSONB);
}

impl<'a> FromSql<'a> for LocationMetadata {
    fn from_sql(ty: &Type, raw: &'a [u8]) -> Result<Self, Box<dyn StdError + Send + Sync>> {
        let value = serde_json::Value::from_sql(ty, raw)?;
        serde_json::from_value(value)
            .map_err(|e| Box::new(e) as Box<dyn StdError + Send + Sync>)
    }

    accepts!(JSON, JSONB);
}