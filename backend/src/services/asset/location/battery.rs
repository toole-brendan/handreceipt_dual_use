// src/services/location/battery.rs

use serde::{Serialize, Deserialize};
use uuid::Uuid;
use crate::services::database::postgresql::connection::DbPool;
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub enum BatteryStatus {
    Critical,    // < 15%
    Low,         // < 30%
    Medium,      // < 70%
    High,        // >= 70%
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatteryConfig {
    pub critical_threshold: i32,    // 15%
    pub low_threshold: i32,         // 30%
    pub medium_threshold: i32,      // 70%
    pub min_interval: i32,          // Minimum seconds between updates
    pub max_interval: i32,          // Maximum seconds between updates
    pub movement_threshold: f64,    // Minimum movement in meters to trigger update
}

impl Default for BatteryConfig {
    fn default() -> Self {
        Self {
            critical_threshold: 15,
            low_threshold: 30,
            medium_threshold: 70,
            min_interval: 30,    // 30 seconds
            max_interval: 300,   // 5 minutes
            movement_threshold: 10.0, // 10 meters
        }
    }
}

pub struct BatteryManager {
    pool: DbPool,
    config: BatteryConfig,
}

impl BatteryManager {
    pub fn new(pool: DbPool, config: Option<BatteryConfig>) -> Self {
        Self {
            pool,
            config: config.unwrap_or_default(),
        }
    }

    pub async fn setup_battery_table(&self) -> Result<(), Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        client.execute(
            "CREATE TABLE IF NOT EXISTS battery_levels (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                asset_id UUID NOT NULL,
                battery_level INT NOT NULL,
                charging BOOLEAN NOT NULL DEFAULT false,
                timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                FOREIGN KEY (asset_id) REFERENCES assets(id)
            )", &[]
        ).await?;

        // Create index for quick lookups
        client.execute(
            "CREATE INDEX IF NOT EXISTS battery_levels_asset_time_idx 
             ON battery_levels (asset_id, timestamp DESC)",
            &[]
        ).await?;

        Ok(())
    }

    pub async fn record_battery_level(
        &self,
        asset_id: Uuid,
        battery_level: i32,
        charging: bool,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        client.execute(
            "INSERT INTO battery_levels (asset_id, battery_level, charging)
             VALUES ($1, $2, $3)",
            &[&asset_id, &battery_level, &charging],
        ).await?;

        Ok(())
    }

    pub fn get_battery_status(&self, battery_level: i32) -> BatteryStatus {
        match battery_level {
            level if level < self.config.critical_threshold => BatteryStatus::Critical,
            level if level < self.config.low_threshold => BatteryStatus::Low,
            level if level < self.config.medium_threshold => BatteryStatus::Medium,
            _ => BatteryStatus::High,
        }
    }

    pub fn get_update_interval(&self, battery_status: BatteryStatus, is_moving: bool) -> Duration {
        let base_interval = match battery_status {
            BatteryStatus::Critical => self.config.max_interval,
            BatteryStatus::Low => self.config.max_interval / 2,
            BatteryStatus::Medium => self.config.max_interval / 3,
            BatteryStatus::High => self.config.min_interval,
        };

        if is_moving {
            Duration::from_secs(base_interval as u64)
        } else {
            Duration::from_secs((base_interval * 2) as u64)
        }
    }

    pub async fn should_update_location(
        &self,
        asset_id: Uuid,
        last_location: Option<(f64, f64)>,
        current_location: (f64, f64),
        battery_level: i32,
    ) -> Result<bool, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        // Check last update time
        let last_update = client.query_opt(
            "SELECT timestamp 
             FROM battery_levels 
             WHERE asset_id = $1 
             ORDER BY timestamp DESC 
             LIMIT 1",
            &[&asset_id],
        ).await?;

        let battery_status = self.get_battery_status(battery_level);
        let is_moving = if let Some(last_loc) = last_location {
            self.calculate_movement(last_loc, current_location) > self.config.movement_threshold
        } else {
            true
        };

        let update_interval = self.get_update_interval(battery_status, is_moving);

        if let Some(row) = last_update {
            let last_timestamp: chrono::DateTime<chrono::Utc> = row.get("timestamp");
            let elapsed = chrono::Utc::now() - last_timestamp;
            
            Ok(elapsed > chrono::Duration::from_std(update_interval).unwrap())
        } else {
            Ok(true)
        }
    }

    fn calculate_movement(&self, last_location: (f64, f64), current_location: (f64, f64)) -> f64 {
        // Haversine formula for distance calculation
        let earth_radius = 6371000.0; // Earth radius in meters
        let lat1 = last_location.0.to_radians();
        let lat2 = current_location.0.to_radians();
        let delta_lat = (current_location.0 - last_location.0).to_radians();
        let delta_lon = (current_location.1 - last_location.1).to_radians();

        let a = (delta_lat / 2.0).sin() * (delta_lat / 2.0).sin()
            + lat1.cos() * lat2.cos() * (delta_lon / 2.0).sin() * (delta_lon / 2.0).sin();
        let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());

        earth_radius * c
    }

    pub async fn get_battery_history(
        &self,
        asset_id: Uuid,
        hours: i32,
    ) -> Result<Vec<(i32, bool, chrono::DateTime<chrono::Utc>)>, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        let rows = client.query(
            "SELECT battery_level, charging, timestamp
             FROM battery_levels
             WHERE asset_id = $1
             AND timestamp > NOW() - interval '1 hour' * $2
             ORDER BY timestamp DESC",
            &[&asset_id, &hours],
        ).await?;

        Ok(rows.iter().map(|row| {
            (
                row.get("battery_level"),
                row.get("charging"),
                row.get("timestamp"),
            )
        }).collect())
    }
} 