// src/services/location/history.rs

use crate::services::database::postgresql::connection::DbPool;
use postgis::ewkb::Point;
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct LocationHistory {
    pub asset_id: Uuid,
    pub location: Point,
    pub timestamp: DateTime<Utc>,
    pub accuracy: Option<f64>,
    pub altitude: Option<f64>,
    pub heading: Option<f64>,
    pub speed: Option<f64>,
    pub classification_level: i32,
}

pub struct LocationHistoryManager {
    pool: DbPool,
}

impl LocationHistoryManager {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn setup_history_table(&self) -> Result<(), Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        // Create history table with RLS
        client.execute(
            "CREATE TABLE IF NOT EXISTS location_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                asset_id UUID NOT NULL,
                location GEOMETRY(Point, 4326) NOT NULL,
                timestamp TIMESTAMPTZ NOT NULL,
                accuracy FLOAT,
                altitude FLOAT,
                heading FLOAT,
                speed FLOAT,
                classification_level INT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                FOREIGN KEY (asset_id) REFERENCES assets(id)
            )", &[]
        ).await?;

        // Enable Row Level Security
        client.execute(
            "ALTER TABLE location_history ENABLE ROW LEVEL SECURITY",
            &[],
        ).await?;

        // Create policy for reading based on classification level
        client.execute(
            "CREATE POLICY location_history_access ON location_history
             FOR SELECT
             USING (classification_level <= current_setting('app.user_classification')::integer)",
            &[],
        ).await?;

        // Create spatial and temporal indexes
        client.execute(
            "CREATE INDEX IF NOT EXISTS location_history_gix 
             ON location_history USING GIST (location)",
            &[],
        ).await?;

        client.execute(
            "CREATE INDEX IF NOT EXISTS location_history_time_idx 
             ON location_history (timestamp DESC)",
            &[],
        ).await?;

        Ok(())
    }

    pub async fn record_history(
        &self,
        history: LocationHistory,
    ) -> Result<Uuid, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        let row = client.query_one(
            "INSERT INTO location_history (
                asset_id, location, timestamp, accuracy, altitude,
                heading, speed, classification_level
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id",
            &[
                &history.asset_id,
                &history.location,
                &history.timestamp,
                &history.accuracy,
                &history.altitude,
                &history.heading,
                &history.speed,
                &history.classification_level,
            ],
        ).await?;

        Ok(row.get("id"))
    }

    pub async fn get_asset_history(
        &self,
        asset_id: Uuid,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
        user_classification: i32,
    ) -> Result<Vec<LocationHistory>, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        // Set user classification for RLS
        client.execute(
            &format!("SET app.user_classification = '{}'", user_classification),
            &[],
        ).await?;

        let rows = client.query(
            "SELECT asset_id, location, timestamp, accuracy, altitude,
                    heading, speed, classification_level
             FROM location_history
             WHERE asset_id = $1
             AND timestamp BETWEEN $2 AND $3
             ORDER BY timestamp DESC",
            &[&asset_id, &start_time, &end_time],
        ).await?;

        let history = rows.iter().map(|row| LocationHistory {
            asset_id: row.get("asset_id"),
            location: row.get("location"),
            timestamp: row.get("timestamp"),
            accuracy: row.get("accuracy"),
            altitude: row.get("altitude"),
            heading: row.get("heading"),
            speed: row.get("speed"),
            classification_level: row.get("classification_level"),
        }).collect();

        Ok(history)
    }

    pub async fn cleanup_old_history(
        &self,
        retention_days: i32,
    ) -> Result<u64, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        let result = client.execute(
            "DELETE FROM location_history 
             WHERE timestamp < NOW() - interval '1 day' * $1",
            &[&retention_days],
        ).await?;

        Ok(result)
    }
}
