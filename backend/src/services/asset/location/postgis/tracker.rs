// src/services/location/postgis/tracker.rs

use postgis::ewkb::Point;
use uuid::Uuid;
use crate::services::database::postgresql::connection::DbPool;

pub struct LocationTracker {
    pool: DbPool,
}

impl LocationTracker {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn record_location(
        &self,
        asset_id: Uuid,
        latitude: f64,
        longitude: f64,
        accuracy: Option<f64>,
        classification_level: i32,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;
        
        let point = Point::new(longitude, latitude, Some(4326));

        client.execute(
            "INSERT INTO asset_locations (asset_id, location, accuracy, classification_level) 
             VALUES ($1, $2, $3, $4)",
            &[&asset_id, &point, &accuracy, &classification_level]
        ).await?;

        Ok(())
    }

    pub async fn get_latest_location(
        &self,
        asset_id: Uuid,
    ) -> Result<Option<(f64, f64, Option<f64>)>, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        let row = client.query_opt(
            "SELECT ST_X(location::geometry) as longitude, 
                    ST_Y(location::geometry) as latitude,
                    accuracy
             FROM asset_locations 
             WHERE asset_id = $1 
             ORDER BY timestamp DESC 
             LIMIT 1",
            &[&asset_id]
        ).await?;

        Ok(row.map(|row| {
            let longitude: f64 = row.get("longitude");
            let latitude: f64 = row.get("latitude");
            let accuracy: Option<f64> = row.get("accuracy");
            (longitude, latitude, accuracy)
        }))
    }
}
