// src/services/location/postgis/postgis.rs

use super::super::postgresql::connection::{DatabaseConnection, DatabaseError};
use std::sync::Arc;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct GeoPoint {
    pub latitude: f64,
    pub longitude: f64,
}

pub struct PostGISManager {
    conn: Arc<DatabaseConnection>,
}

impl PostGISManager {
    pub fn new(conn: Arc<DatabaseConnection>) -> Self {
        Self { conn }
    }

    pub async fn create_point(&self, point: &GeoPoint) -> Result<String, DatabaseError> {
        let query = "SELECT ST_MakePoint($1, $2)::text";
        self.conn.execute_with_security(
            query,
            &[&point.longitude, &point.latitude],
            &crate::core::SecurityContext {
                classification: super::super::postgresql::classification::SecurityClassification::Unclassified,
            },
        )
        .await
    }

    pub async fn calculate_distance(
        &self,
        point1: &GeoPoint,
        point2: &GeoPoint,
    ) -> Result<f64, DatabaseError> {
        let query = "
            SELECT ST_Distance(
                ST_MakePoint($1, $2)::geography,
                ST_MakePoint($3, $4)::geography
            )";

        self.conn.execute_with_security(
            query,
            &[
                &point1.longitude,
                &point1.latitude,
                &point2.longitude,
                &point2.latitude,
            ],
            &crate::core::SecurityContext {
                classification: super::super::postgresql::classification::SecurityClassification::Unclassified,
            },
        )
        .await
    }

    pub async fn find_points_within_radius(
        &self,
        center: &GeoPoint,
        radius_meters: f64,
    ) -> Result<Vec<GeoPoint>, DatabaseError> {
        let query = "
            SELECT ST_X(geom) as longitude, ST_Y(geom) as latitude
            FROM asset_locations
            WHERE ST_DWithin(
                geom::geography,
                ST_MakePoint($1, $2)::geography,
                $3
            )";

        let client = self.conn.begin_transaction().await?;
        
        let rows = client
            .query(
                query,
                &[&center.longitude, &center.latitude, &radius_meters],
            )
            .await
            .map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        let points = rows
            .iter()
            .map(|row| GeoPoint {
                longitude: row.get("longitude"),
                latitude: row.get("latitude"),
            })
            .collect();

        Ok(points)
    }
}
