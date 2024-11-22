use chrono::{DateTime, Utc};
use crate::infrastructure::database::DatabaseService;
use crate::asset::location::postgis::tracker::GeoPoint;

#[derive(Debug)]
pub struct TrackingRecord {
    pub asset_id: String,
    pub location: GeoPoint,
    pub timestamp: DateTime<Utc>,
    pub event_type: TrackingEventType,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug)]
pub enum TrackingEventType {
    LocationUpdate,
    TransferInitiated,
    TransferCompleted,
    Scan,
    Maintenance,
    Custom(String),
}

pub struct TrackingHistory {
    db: DatabaseService,
}

impl TrackingHistory {
    pub fn new(db: DatabaseService) -> Self {
        Self { db }
    }

    pub async fn record_event(
        &self,
        asset_id: &str,
        location: GeoPoint,
        event_type: TrackingEventType,
        metadata: Option<serde_json::Value>,
    ) -> Result<(), TrackingError> {
        let record = TrackingRecord {
            asset_id: asset_id.to_string(),
            location,
            timestamp: Utc::now(),
            event_type,
            metadata,
        };

        self.db.save_tracking_record(&record).await
            .map_err(|e| TrackingError::DatabaseError(e.to_string()))
    }

    pub async fn get_asset_history(
        &self,
        asset_id: &str,
        from: DateTime<Utc>,
        to: DateTime<Utc>,
    ) -> Result<Vec<TrackingRecord>, TrackingError> {
        self.db.get_tracking_records(asset_id, from, to).await
            .map_err(|e| TrackingError::DatabaseError(e.to_string()))
    }

    pub async fn get_last_known_location(&self, asset_id: &str) -> Result<Option<GeoPoint>, TrackingError> {
        self.db.get_last_location(asset_id).await
            .map_err(|e| TrackingError::DatabaseError(e.to_string()))
    }
}

#[derive(Debug)]
pub enum TrackingError {
    DatabaseError(String),
    InvalidData(String),
    NotFound(String),
}
