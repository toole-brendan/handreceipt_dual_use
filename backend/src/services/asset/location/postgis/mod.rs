// src/services/location/postgis/mod.rs

use postgis::ewkb::{Point, Polygon};
use tokio_postgres::Client;
use crate::services::database::postgresql::connection::DbPool;

pub mod tracker;
pub mod geofence;

pub struct PostGisService {
    pool: DbPool,
}

impl PostGisService {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn init_extensions(&self) -> Result<(), Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;
        
        // Enable PostGIS extension if not already enabled
        client.execute("CREATE EXTENSION IF NOT EXISTS postgis", &[]).await?;
        client.execute("CREATE EXTENSION IF NOT EXISTS postgis_topology", &[]).await?;

        Ok(())
    }

    pub async fn create_spatial_tables(&self) -> Result<(), Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        // Create table for asset locations with PostGIS geometry
        client.execute(
            "CREATE TABLE IF NOT EXISTS asset_locations (
                id SERIAL PRIMARY KEY,
                asset_id UUID NOT NULL,
                location GEOMETRY(Point, 4326) NOT NULL,
                timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                accuracy FLOAT,
                altitude FLOAT,
                heading FLOAT,
                speed FLOAT,
                battery_level INT,
                classification_level INT NOT NULL DEFAULT 0,
                FOREIGN KEY (asset_id) REFERENCES assets(id)
            )", &[]
        ).await?;

        // Create spatial index
        client.execute(
            "CREATE INDEX IF NOT EXISTS asset_locations_gix 
             ON asset_locations USING GIST (location)", &[]
        ).await?;

        Ok(())
    }

    pub async fn init_geofencing(&self) -> Result<(), Box<dyn std::error::Error>> {
        let geofence_manager = GeofenceManager::new(self.pool.clone());
        geofence_manager.create_geofence_table().await?;
        Ok(())
    }
}
