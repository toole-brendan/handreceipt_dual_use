// src/services/location/postgis/geofence.rs

use postgis::ewkb::{Point, Polygon};
use uuid::Uuid;
use serde::{Serialize, Deserialize};
use crate::services::database::postgresql::connection::DbPool;

#[derive(Debug, Serialize, Deserialize)]
pub struct GeofencePoint {
    pub latitude: f64,
    pub longitude: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GeofenceCreate {
    pub name: String,
    pub description: Option<String>,
    pub points: Vec<GeofencePoint>,
    pub classification_level: i32,
    pub alert_on_enter: bool,
    pub alert_on_exit: bool,
    pub active: bool,
}

pub struct GeofenceManager {
    pool: DbPool,
}

impl GeofenceManager {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn create_geofence_table(&self) -> Result<(), Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        client.execute(
            "CREATE TABLE IF NOT EXISTS geofences (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                boundary GEOMETRY(Polygon, 4326) NOT NULL,
                classification_level INT NOT NULL,
                alert_on_enter BOOLEAN NOT NULL DEFAULT true,
                alert_on_exit BOOLEAN NOT NULL DEFAULT true,
                active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )", &[]
        ).await?;

        // Create spatial index for geofence boundaries
        client.execute(
            "CREATE INDEX IF NOT EXISTS geofence_boundary_idx 
             ON geofences USING GIST (boundary)", &[]
        ).await?;

        // Create table for geofence violations
        client.execute(
            "CREATE TABLE IF NOT EXISTS geofence_violations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                geofence_id UUID NOT NULL REFERENCES geofences(id),
                asset_id UUID NOT NULL REFERENCES assets(id),
                violation_type VARCHAR(50) NOT NULL,
                location GEOMETRY(Point, 4326) NOT NULL,
                timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT valid_violation_type CHECK (violation_type IN ('ENTER', 'EXIT', 'DWELL'))
            )", &[]
        ).await?;

        Ok(())
    }

    pub async fn create_geofence(&self, geofence: GeofenceCreate) -> Result<Uuid, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        // Convert points to PostGIS polygon format
        let points_str = geofence.points.iter()
            .map(|p| format!("{} {}", p.longitude, p.latitude))
            .collect::<Vec<String>>()
            .join(",");
        
        let polygon_str = format!("SRID=4326;POLYGON(({}))", points_str);

        let row = client.query_one(
            "INSERT INTO geofences (
                name, description, boundary, classification_level, 
                alert_on_enter, alert_on_exit, active
            ) VALUES (
                $1, $2, ST_GeomFromEWKT($3), $4, $5, $6, $7
            ) RETURNING id",
            &[
                &geofence.name,
                &geofence.description,
                &polygon_str,
                &geofence.classification_level,
                &geofence.alert_on_enter,
                &geofence.alert_on_exit,
                &geofence.active,
            ],
        ).await?;

        Ok(row.get("id"))
    }

    pub async fn check_asset_location(
        &self,
        asset_id: Uuid,
        point: Point,
        asset_classification: i32,
    ) -> Result<Vec<Uuid>, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        // Only check active geofences with appropriate classification level
        let rows = client.query(
            "SELECT id FROM geofences 
            WHERE active = true 
            AND classification_level <= $1
            AND ST_Contains(boundary, $2::geometry)",
            &[&asset_classification, &point],
        ).await?;

        let geofence_ids = rows.iter()
            .map(|row| row.get::<_, Uuid>("id"))
            .collect();

        Ok(geofence_ids)
    }

    pub async fn record_violation(
        &self,
        geofence_id: Uuid,
        asset_id: Uuid,
        violation_type: &str,
        location: Point,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        client.execute(
            "INSERT INTO geofence_violations (
                geofence_id, asset_id, violation_type, location
            ) VALUES ($1, $2, $3, $4)",
            &[&geofence_id, &asset_id, &violation_type, &location],
        ).await?;

        Ok(())
    }

    pub async fn get_active_geofences(
        &self,
        classification_level: i32,
    ) -> Result<Vec<(Uuid, String, Polygon)>, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        let rows = client.query(
            "SELECT id, name, ST_AsEWKB(boundary) as boundary 
            FROM geofences 
            WHERE active = true 
            AND classification_level <= $1",
            &[&classification_level],
        ).await?;

        let geofences = rows.iter().map(|row| {
            let id: Uuid = row.get("id");
            let name: String = row.get("name");
            let boundary: Polygon = row.get("boundary");
            (id, name, boundary)
        }).collect();

        Ok(geofences)
    }
}
