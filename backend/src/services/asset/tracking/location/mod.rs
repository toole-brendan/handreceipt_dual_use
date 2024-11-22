use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};
use crate::asset::location::postgis::tracker::GeoPoint;
use crate::asset::location::accuracy::LocationAccuracy;
use crate::asset::location::battery::BatteryStatus;
use crate::infrastructure::database::DatabaseService;
use crate::asset::tracking::history::{TrackingHistory, TrackingEventType};

#[derive(Debug, Clone)]
pub struct LocationUpdate {
    pub asset_id: String,
    pub location: GeoPoint,
    pub accuracy: LocationAccuracy,
    pub battery: Option<BatteryStatus>,
    pub timestamp: DateTime<Utc>,
}

pub struct LocationTracker {
    db: DatabaseService,
    history: TrackingHistory,
    active_trackers: Arc<RwLock<std::collections::HashMap<String, LocationUpdate>>>,
}

impl LocationTracker {
    pub fn new(db: DatabaseService) -> Self {
        let history = TrackingHistory::new(db.clone());
        Self {
            db,
            history,
            active_trackers: Arc::new(RwLock::new(std::collections::HashMap::new())),
        }
    }

    pub async fn update_location(
        &self,
        update: LocationUpdate,
    ) -> Result<(), LocationError> {
        // Validate accuracy
        if !update.accuracy.is_acceptable() {
            return Err(LocationError::InsufficientAccuracy);
        }

        // Store in active trackers
        {
            let mut trackers = self.active_trackers.write().await;
            trackers.insert(update.asset_id.clone(), update.clone());
        }

        // Record in history
        self.history.record_event(
            &update.asset_id,
            update.location,
            TrackingEventType::LocationUpdate,
            Some(serde_json::json!({
                "accuracy": update.accuracy,
                "battery": update.battery,
            })),
        ).await.map_err(|e| LocationError::HistoryError(e.to_string()))?;

        // Update last known location in database
        self.db.update_asset_location(&update).await
            .map_err(|e| LocationError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    pub async fn get_current_location(&self, asset_id: &str) -> Result<Option<LocationUpdate>, LocationError> {
        // Check active trackers first
        {
            let trackers = self.active_trackers.read().await;
            if let Some(update) = trackers.get(asset_id) {
                return Ok(Some(update.clone()));
            }
        }

        // Fall back to database
        self.db.get_asset_location(asset_id).await
            .map_err(|e| LocationError::DatabaseError(e.to_string()))
    }

    pub async fn start_tracking(&self, asset_id: &str) -> Result<(), LocationError> {
        self.db.start_asset_tracking(asset_id).await
            .map_err(|e| LocationError::DatabaseError(e.to_string()))
    }

    pub async fn stop_tracking(&self, asset_id: &str) -> Result<(), LocationError> {
        // Remove from active trackers
        {
            let mut trackers = self.active_trackers.write().await;
            trackers.remove(asset_id);
        }

        self.db.stop_asset_tracking(asset_id).await
            .map_err(|e| LocationError::DatabaseError(e.to_string()))
    }
}

#[derive(Debug)]
pub enum LocationError {
    DatabaseError(String),
    HistoryError(String),
    InsufficientAccuracy,
    InvalidData(String),
    NotFound(String),
}
