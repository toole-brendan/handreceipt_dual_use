// src/services/location/accuracy.rs

use serde::{Serialize, Deserialize};
use postgis::ewkb::Point;
use uuid::Uuid;
use crate::services::database::postgresql::connection::DbPool;

#[derive(Debug, Serialize, Deserialize)]
pub struct AccuracyMetrics {
    pub horizontal_accuracy: f64,  // In meters
    pub vertical_accuracy: Option<f64>, // In meters
    pub confidence_level: f64,     // Between 0 and 1
    pub hdop: Option<f64>,        // Horizontal dilution of precision
    pub pdop: Option<f64>,        // Position dilution of precision
    pub satellite_count: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LocationUncertainty {
    pub center: Point,
    pub radius: f64,              // Uncertainty radius in meters
    pub confidence_level: f64,    // Statistical confidence level (e.g., 0.95 for 95%)
    pub classification_level: i32,
}

pub struct AccuracyManager {
    pool: DbPool,
}

impl AccuracyManager {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn setup_accuracy_table(&self) -> Result<(), Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        client.execute(
            "CREATE TABLE IF NOT EXISTS location_accuracy (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                asset_id UUID NOT NULL,
                timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                horizontal_accuracy FLOAT NOT NULL,
                vertical_accuracy FLOAT,
                confidence_level FLOAT NOT NULL,
                hdop FLOAT,
                pdop FLOAT,
                satellite_count INT,
                classification_level INT NOT NULL,
                FOREIGN KEY (asset_id) REFERENCES assets(id)
            )", &[]
        ).await?;

        // Create index on asset_id and timestamp
        client.execute(
            "CREATE INDEX IF NOT EXISTS location_accuracy_asset_time_idx 
             ON location_accuracy (asset_id, timestamp DESC)",
            &[]
        ).await?;

        Ok(())
    }

    pub async fn record_accuracy(
        &self,
        asset_id: Uuid,
        metrics: AccuracyMetrics,
        classification_level: i32,
    ) -> Result<Uuid, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        let row = client.query_one(
            "INSERT INTO location_accuracy (
                asset_id, horizontal_accuracy, vertical_accuracy,
                confidence_level, hdop, pdop, satellite_count,
                classification_level
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id",
            &[
                &asset_id,
                &metrics.horizontal_accuracy,
                &metrics.vertical_accuracy,
                &metrics.confidence_level,
                &metrics.hdop,
                &metrics.pdop,
                &metrics.satellite_count,
                &classification_level,
            ],
        ).await?;

        Ok(row.get("id"))
    }

    pub async fn calculate_uncertainty(
        &self,
        point: Point,
        horizontal_accuracy: f64,
        confidence_level: f64,
    ) -> LocationUncertainty {
        LocationUncertainty {
            center: point,
            radius: horizontal_accuracy * confidence_level,
            confidence_level,
            classification_level: 0, // Default classification, should be set based on context
        }
    }

    pub async fn get_latest_accuracy(
        &self,
        asset_id: Uuid,
    ) -> Result<Option<AccuracyMetrics>, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        let row = client.query_opt(
            "SELECT horizontal_accuracy, vertical_accuracy, confidence_level,
                    hdop, pdop, satellite_count
             FROM location_accuracy
             WHERE asset_id = $1
             ORDER BY timestamp DESC
             LIMIT 1",
            &[&asset_id],
        ).await?;

        Ok(row.map(|row| AccuracyMetrics {
            horizontal_accuracy: row.get("horizontal_accuracy"),
            vertical_accuracy: row.get("vertical_accuracy"),
            confidence_level: row.get("confidence_level"),
            hdop: row.get("hdop"),
            pdop: row.get("pdop"),
            satellite_count: row.get("satellite_count"),
        }))
    }

    pub async fn calculate_average_accuracy(
        &self,
        asset_id: Uuid,
        window_minutes: i32,
    ) -> Result<Option<f64>, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        let row = client.query_opt(
            "SELECT AVG(horizontal_accuracy) as avg_accuracy
             FROM location_accuracy
             WHERE asset_id = $1
             AND timestamp > NOW() - interval '1 minute' * $2",
            &[&asset_id, &window_minutes],
        ).await?;

        Ok(row.and_then(|row| row.get("avg_accuracy")))
    }
}
