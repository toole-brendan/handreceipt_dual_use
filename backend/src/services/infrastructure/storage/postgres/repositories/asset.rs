use std::sync::Arc;
use async_trait::async_trait;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::{
    types::{
        asset::{Asset, AssetStatus, LocationMetadata},
        security::{SecurityClassification, SecurityContext},
        error::DatabaseError,
    },
    services::infrastructure::storage::{
        repositories::AssetRepository,
        postgres::{
            PostgresPool,
            queries::asset::AssetQueries,
            FromRow,
        },
    },
};

/// PostgreSQL implementation of the asset repository
pub struct PostgresAssetRepository {
    pool: Arc<PostgresPool>,
}

impl PostgresAssetRepository {
    pub fn new(pool: Arc<PostgresPool>) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl AssetRepository for PostgresAssetRepository {
    async fn create(&self, asset: &Asset, context: &SecurityContext) -> Result<Uuid, DatabaseError> {
        let (query, params) = AssetQueries::create(asset);
        
        let client = self.pool.get_client().await?;
        let row = client.query_one(&query, &params.iter().map(|p| p.as_ref()).collect::<Vec<_>>())
            .await
            .map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        Ok(row.get("id"))
    }

    async fn read(&self, id: &Uuid, context: &SecurityContext) -> Result<Option<Asset>, DatabaseError> {
        let (query, params) = AssetQueries::read_by_id(*id, context);
        
        let client = self.pool.get_client().await?;
        let row = match client.query_opt(&query, &params.iter().map(|p| p.as_ref()).collect::<Vec<_>>())
            .await
            .map_err(|e| DatabaseError::QueryError(e.to_string()))? {
                Some(row) => row,
                None => return Ok(None),
            };

        Ok(Some(Asset::from_row(row)?))
    }

    async fn update(&self, id: &Uuid, asset: &Asset, context: &SecurityContext) -> Result<bool, DatabaseError> {
        let (query, params) = AssetQueries::create(asset); // Reuse create query for now
        
        let client = self.pool.get_client().await?;
        let result = client.execute(&query, &params.iter().map(|p| p.as_ref()).collect::<Vec<_>>())
            .await
            .map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        Ok(result > 0)
    }

    async fn delete(&self, id: &Uuid, context: &SecurityContext) -> Result<bool, DatabaseError> {
        let mut builder = QueryBuilder::new("DELETE FROM assets WHERE id = $1");
        builder.add_param(*id);
        builder.add_where("classification <= $2");
        builder.add_param(context.classification);
        
        let (query, params) = builder.build();
        
        let client = self.pool.get_client().await?;
        let result = client.execute(&query, &params.iter().map(|p| p.as_ref()).collect::<Vec<_>>())
            .await
            .map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        Ok(result > 0)
    }

    async fn find_by_status(
        &self,
        status: AssetStatus,
        context: &SecurityContext,
    ) -> Result<Vec<Asset>, DatabaseError> {
        let (query, params) = AssetQueries::find_by_status(status, context);
        
        let client = self.pool.get_client().await?;
        let rows = client.query(&query, &params.iter().map(|p| p.as_ref()).collect::<Vec<_>>())
            .await
            .map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        rows.into_iter()
            .map(Asset::from_row)
            .collect()
    }

    async fn find_by_classification(
        &self,
        classification: SecurityClassification,
        context: &SecurityContext,
    ) -> Result<Vec<Asset>, DatabaseError> {
        let (query, params) = AssetQueries::find_by_classification(classification, context);
        
        let client = self.pool.get_client().await?;
        let rows = client.query(&query, &params.iter().map(|p| p.as_ref()).collect::<Vec<_>>())
            .await
            .map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        rows.into_iter()
            .map(Asset::from_row)
            .collect()
    }

    async fn find_by_location(
        &self,
        latitude: f64,
        longitude: f64,
        radius_meters: f64,
        context: &SecurityContext,
    ) -> Result<Vec<Asset>, DatabaseError> {
        let (query, params) = AssetQueries::find_by_location(latitude, longitude, radius_meters, context);
        
        let client = self.pool.get_client().await?;
        let rows = client.query(&query, &params.iter().map(|p| p.as_ref()).collect::<Vec<_>>())
            .await
            .map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        rows.into_iter()
            .map(Asset::from_row)
            .collect()
    }

    async fn update_status(
        &self,
        id: &Uuid,
        status: AssetStatus,
        context: &SecurityContext,
    ) -> Result<bool, DatabaseError> {
        let (query, params) = AssetQueries::update_status(*id, status, context);
        
        let client = self.pool.get_client().await?;
        let result = client.execute(&query, &params.iter().map(|p| p.as_ref()).collect::<Vec<_>>())
            .await
            .map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        Ok(result > 0)
    }

    async fn get_location_history(
        &self,
        id: &Uuid,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
        context: &SecurityContext,
    ) -> Result<Vec<LocationMetadata>, DatabaseError> {
        let (query, params) = AssetQueries::get_location_history(*id, start_time, end_time, context);
        
        let client = self.pool.get_client().await?;
        let rows = client.query(&query, &params.iter().map(|p| p.as_ref()).collect::<Vec<_>>())
            .await
            .map_err(|e| DatabaseError::QueryError(e.to_string()))?;

        rows.into_iter()
            .map(LocationMetadata::from_row)
            .collect()
    }
}
