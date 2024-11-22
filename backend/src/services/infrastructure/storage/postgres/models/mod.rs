use chrono::{DateTime, Utc};
use serde_json::Value;
use tokio_postgres::Row;
use uuid::Uuid;

use crate::{
    types::{
        asset::{Asset, AssetStatus, LocationMetadata},
        security::SecurityClassification,
        error::DatabaseError,
    },
    services::infrastructure::storage::postgres::{FromRow, ToRow},
};

/// Wrapper for JSON database type
#[derive(Debug, Clone)]
pub struct JsonWrapper(pub Value);

impl From<Value> for JsonWrapper {
    fn from(value: Value) -> Self {
        Self(value)
    }
}

impl From<JsonWrapper> for Value {
    fn from(wrapper: JsonWrapper) -> Self {
        wrapper.0
    }
}

/// Implementation of FromRow for Asset
impl FromRow for Asset {
    fn from_row(row: Row) -> Result<Self, DatabaseError> {
        let metadata: JsonWrapper = row.try_get("metadata")
            .map_err(|e| DatabaseError::ConversionError(e.to_string()))?;

        let status_str: String = row.try_get("status")
            .map_err(|e| DatabaseError::ConversionError(e.to_string()))?;
        let status = AssetStatus::try_from(status_str.as_str())
            .map_err(|e| DatabaseError::ConversionError(e.to_string()))?;

        Ok(Asset {
            id: row.try_get("id")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            name: row.try_get("name")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            description: row.try_get("description")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            status,
            classification: row.try_get("classification")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            metadata: serde_json::from_value(metadata.0)
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            created_at: row.try_get("created_at")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            updated_at: row.try_get("updated_at")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            qr_code: row.try_get("qr_code")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            last_verified: row.try_get("last_verified")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            verification_count: row.try_get("verification_count")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            rfid_tag_id: row.try_get("rfid_tag_id")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            rfid_last_scanned: row.try_get("rfid_last_scanned")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            token_id: row.try_get("token_id")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            current_custodian: row.try_get("current_custodian")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            hand_receipt_hash: row.try_get("hand_receipt_hash")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            last_known_location: row.try_get("last_known_location")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            location_history: row.try_get("location_history")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            geofence_restrictions: row.try_get("geofence_restrictions")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            location_classification: row.try_get("location_classification")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
        })
    }
}

/// Implementation of ToRow for Asset
impl ToRow for Asset {
    fn to_row(&self) -> Vec<Box<dyn tokio_postgres::types::ToSql + Sync>> {
        vec![
            Box::new(self.id),
            Box::new(self.name.clone()),
            Box::new(self.description.clone()),
            Box::new(self.status.to_string()),
            Box::new(self.classification),
            Box::new(JsonWrapper(serde_json::to_value(&self.metadata).unwrap())),
            Box::new(self.created_at),
            Box::new(self.updated_at),
            Box::new(self.qr_code.clone()),
            Box::new(self.last_verified),
            Box::new(self.verification_count),
            Box::new(self.rfid_tag_id.clone()),
            Box::new(self.rfid_last_scanned),
            Box::new(self.token_id),
            Box::new(self.current_custodian.clone()),
            Box::new(self.hand_receipt_hash.clone()),
            Box::new(self.last_known_location.clone()),
            Box::new(JsonWrapper(serde_json::to_value(&self.location_history).unwrap())),
            Box::new(JsonWrapper(serde_json::to_value(&self.geofence_restrictions).unwrap())),
            Box::new(self.location_classification),
        ]
    }
}

/// Implementation of FromRow for LocationMetadata
impl FromRow for LocationMetadata {
    fn from_row(row: Row) -> Result<Self, DatabaseError> {
        Ok(LocationMetadata {
            timestamp: row.try_get("timestamp")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            latitude: row.try_get("latitude")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            longitude: row.try_get("longitude")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            accuracy: row.try_get("accuracy")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            source: row.try_get("source")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?,
            metadata: row.try_get::<_, JsonWrapper>("metadata")
                .map_err(|e| DatabaseError::ConversionError(e.to_string()))?
                .0,
        })
    }
}
