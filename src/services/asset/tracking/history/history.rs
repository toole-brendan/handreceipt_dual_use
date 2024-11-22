use std::sync::Arc;
use uuid::Uuid;
use chrono::{DateTime, Utc, Duration};
use serde::{Serialize, Deserialize};
use crate::services::infrastructure::database::DatabaseService;
use super::location::{AssetLocation, LocationError};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocationHistory {
    pub asset_id: Uuid,
    pub locations: Vec<HistoryEntry>,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub location: AssetLocation,
    pub recorded_at: DateTime<Utc>,
    pub metadata: serde_json::Value,
}

pub struct HistoryManager {
    database: Arc<DatabaseService>,
    retention_period: Duration,
}

impl HistoryManager {
    pub fn new(database: Arc<DatabaseService>) -> Self {
        Self {
            database,
            retention_period: Duration::days(90), // Default 90 days retention
        }
    }

    pub fn set_retention_period(&mut self, period: Duration) {
        self.retention_period = period;
    }

    pub async fn get_history(
        &self, 
        asset_id: Uuid,
        start_time: Option<DateTime<Utc>>,
        end_time: Option<DateTime<Utc>>
    ) -> Result<LocationHistory, HistoryError> {
        let end = end_time.unwrap_or_else(Utc::now);
        let start = start_time.unwrap_or_else(|| end - self.retention_period);

        // Fetch locations from database
        let locations = self.database.get_asset_location_history(
            asset_id,
            start,
            end
        ).await.map_err(|e| HistoryError::Database(e.to_string()))?;

        let entries = locations.into_iter()
            .map(|loc| HistoryEntry {
                location: loc.clone(),
                recorded_at: loc.timestamp,
                metadata: loc.metadata,
            })
            .collect();

        Ok(LocationHistory {
            asset_id,
            locations: entries,
            start_time: start,
            end_time: end,
        })
    }

    pub async fn add_history_entry(
        &self,
        asset_id: Uuid,
        location: AssetLocation,
        metadata: serde_json::Value
    ) -> Result<(), HistoryError> {
        let entry = HistoryEntry {
            location,
            recorded_at: Utc::now(),
            metadata,
        };

        self.database.add_location_history_entry(asset_id, &entry)
            .await
            .map_err(|e| HistoryError::Database(e.to_string()))?;

        // Cleanup old entries if needed
        self.cleanup_old_entries(asset_id).await?;

        Ok(())
    }

    async fn cleanup_old_entries(&self, asset_id: Uuid) -> Result<(), HistoryError> {
        let cutoff_date = Utc::now() - self.retention_period;
        
        self.database.delete_old_location_history(asset_id, cutoff_date)
            .await
            .map_err(|e| HistoryError::Database(e.to_string()))?;

        Ok(())
    }
}

#[derive(Debug, thiserror::Error)]
pub enum HistoryError {
    #[error("Database error: {0}")]
    Database(String),
    
    #[error("Location error: {0}")]
    Location(#[from] LocationError),
    
    #[error("Invalid time range: {0}")]
    InvalidTimeRange(String),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_history_manager() {
        let database = Arc::new(DatabaseService::new().await.unwrap());
        let mut manager = HistoryManager::new(database);

        // Test retention period
        let new_period = Duration::days(30);
        manager.set_retention_period(new_period);
        assert_eq!(manager.retention_period, new_period);

        // Test adding and retrieving history
        let asset_id = Uuid::new_v4();
        let location = AssetLocation {
            asset_id,
            latitude: 37.7749,
            longitude: -122.4194,
            altitude: Some(10.0),
            accuracy: Some(5.0),
            timestamp: Utc::now(),
            source: super::super::location::LocationSource::GPS,
            metadata: serde_json::json!({}),
        };

        manager.add_history_entry(
            asset_id,
            location.clone(),
            serde_json::json!({"test": true})
        ).await.unwrap();

        let history = manager.get_history(asset_id, None, None).await.unwrap();
        assert_eq!(history.locations.len(), 1);
        assert_eq!(history.locations[0].location.latitude, location.latitude);
    }
} 