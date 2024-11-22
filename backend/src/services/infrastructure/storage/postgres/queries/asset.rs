use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::{
    types::{
        asset::{Asset, AssetStatus},
        security::{SecurityClassification, SecurityContext},
    },
    services::infrastructure::storage::postgres::{QueryBuilder, ToRow},
};

/// Asset-specific query builders
pub struct AssetQueries;

impl AssetQueries {
    /// Build query to create a new asset
    pub fn create(asset: &Asset) -> (String, Vec<Box<dyn tokio_postgres::types::ToSql + Sync>>) {
        let mut builder = QueryBuilder::new(
            "INSERT INTO assets (
                id, name, description, status, classification,
                metadata, created_at, updated_at, qr_code,
                last_verified, verification_count, rfid_tag_id,
                rfid_last_scanned, token_id, current_custodian,
                hand_receipt_hash, last_known_location,
                location_history, geofence_restrictions,
                location_classification
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
            RETURNING id"
        );

        let params = asset.to_row();
        for param in params {
            builder.add_param(param);
        }

        builder.build()
    }

    /// Build query to read an asset by ID
    pub fn read_by_id(id: Uuid, context: &SecurityContext) -> (String, Vec<Box<dyn tokio_postgres::types::ToSql + Sync>>) {
        let mut builder = QueryBuilder::new(
            "SELECT * FROM assets WHERE id = $1"
        );
        
        builder.add_param(id);
        builder.add_where("classification <= $2");
        builder.add_param(context.classification);

        builder.build()
    }

    /// Build query to find assets by status
    pub fn find_by_status(status: AssetStatus, context: &SecurityContext) -> (String, Vec<Box<dyn tokio_postgres::types::ToSql + Sync>>) {
        let mut builder = QueryBuilder::new(
            "SELECT * FROM assets WHERE status = $1"
        );
        
        builder.add_param(status);
        builder.add_where("classification <= $2");
        builder.add_param(context.classification);

        builder.build()
    }

    /// Build query to find assets by classification
    pub fn find_by_classification(classification: SecurityClassification, context: &SecurityContext) -> (String, Vec<Box<dyn tokio_postgres::types::ToSql + Sync>>) {
        let mut builder = QueryBuilder::new(
            "SELECT * FROM assets WHERE classification = $1"
        );
        
        builder.add_param(classification);
        builder.add_where("classification <= $2");
        builder.add_param(context.classification);

        builder.build()
    }

    /// Build query to find assets by location
    pub fn find_by_location(
        latitude: f64,
        longitude: f64,
        radius_meters: f64,
        context: &SecurityContext,
    ) -> (String, Vec<Box<dyn tokio_postgres::types::ToSql + Sync>>) {
        let mut builder = QueryBuilder::new(
            "SELECT *, ST_Distance(
                last_known_location::geography,
                ST_MakePoint($1, $2)::geography
            ) as distance
            FROM assets
            WHERE ST_DWithin(
                last_known_location::geography,
                ST_MakePoint($1, $2)::geography,
                $3
            )"
        );
        
        builder.add_param(longitude);
        builder.add_param(latitude);
        builder.add_param(radius_meters);
        builder.add_where("classification <= $4");
        builder.add_param(context.classification);
        
        builder.build()
    }

    /// Build query to update asset status
    pub fn update_status(
        id: Uuid,
        status: AssetStatus,
        context: &SecurityContext,
    ) -> (String, Vec<Box<dyn tokio_postgres::types::ToSql + Sync>>) {
        let mut builder = QueryBuilder::new(
            "UPDATE assets SET status = $1, updated_at = $2
            WHERE id = $3"
        );
        
        builder.add_param(status);
        builder.add_param(Utc::now());
        builder.add_param(id);
        builder.add_where("classification <= $4");
        builder.add_param(context.classification);

        builder.build()
    }

    /// Build query to get asset location history
    pub fn get_location_history(
        id: Uuid,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
        context: &SecurityContext,
    ) -> (String, Vec<Box<dyn tokio_postgres::types::ToSql + Sync>>) {
        let mut builder = QueryBuilder::new(
            "SELECT * FROM asset_location_history
            WHERE asset_id = $1
            AND timestamp BETWEEN $2 AND $3"
        );
        
        builder.add_param(id);
        builder.add_param(start_time);
        builder.add_param(end_time);
        builder.add_where("classification <= $4");
        builder.add_param(context.classification);
        
        builder.build()
    }
}
