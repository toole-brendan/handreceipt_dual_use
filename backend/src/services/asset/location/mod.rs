// src/services/location/mod.rs

pub mod postgis;
pub mod history;
pub mod accuracy;
pub mod battery;

use postgis::PostGisService;
use history::LocationHistoryManager;
use accuracy::AccuracyManager;
use battery::BatteryManager;
use crate::services::database::postgresql::connection::DbPool;

pub struct LocationService {
    postgis: PostGisService,
    history: LocationHistoryManager,
    accuracy: AccuracyManager,
    battery: BatteryManager,
}

impl LocationService {
    pub fn new(pool: DbPool) -> Self {
        Self {
            postgis: PostGisService::new(pool.clone()),
            history: LocationHistoryManager::new(pool.clone()),
            accuracy: AccuracyManager::new(pool.clone()),
            battery: BatteryManager::new(pool, None),
        }
    }

    pub async fn initialize(&self) -> Result<(), Box<dyn std::error::Error>> {
        // Initialize PostGIS extensions and tables
        self.postgis.init_extensions().await?;
        self.postgis.create_spatial_tables().await?;
        self.postgis.init_geofencing().await?;
        
        // Initialize history tracking
        self.history.setup_history_table().await?;
        
        // Initialize accuracy tracking
        self.accuracy.setup_accuracy_table().await?;

        // Initialize battery tracking
        self.battery.setup_battery_table().await?;
        
        Ok(())
    }

    pub async fn should_update_location(
        &self,
        asset_id: Uuid,
        current_location: (f64, f64),
        battery_level: i32,
    ) -> Result<bool, Box<dyn std::error::Error>> {
        // Get last known location from history
        let last_location = self.history.get_asset_history(
            asset_id,
            chrono::Utc::now() - chrono::Duration::hours(1),
            chrono::Utc::now(),
            0, // System level access
        ).await?
        .first()
        .map(|hist| {
            let point = &hist.location;
            (point.x, point.y)
        });

        self.battery.should_update_location(
            asset_id,
            last_location,
            current_location,
            battery_level,
        ).await
    }
}
