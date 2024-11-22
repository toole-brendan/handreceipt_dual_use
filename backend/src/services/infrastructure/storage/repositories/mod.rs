use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::types::{
    asset::{Asset, AssetStatus, LocationMetadata},
    audit::{AuditEvent, AuditStatus},
    security::{SecurityClassification, SecurityContext},
    error::DatabaseError,
};

/// Generic repository trait for basic CRUD operations
#[async_trait]
pub trait Repository<T, ID> {
    /// Create a new entity
    async fn create(&self, entity: &T, context: &SecurityContext) -> Result<ID, DatabaseError>;
    
    /// Read an entity by ID
    async fn read(&self, id: &ID, context: &SecurityContext) -> Result<Option<T>, DatabaseError>;
    
    /// Update an existing entity
    async fn update(&self, id: &ID, entity: &T, context: &SecurityContext) -> Result<bool, DatabaseError>;
    
    /// Delete an entity by ID
    async fn delete(&self, id: &ID, context: &SecurityContext) -> Result<bool, DatabaseError>;
}

/// Asset repository interface
#[async_trait]
pub trait AssetRepository: Repository<Asset, Uuid> + Send + Sync {
    /// Find assets by status
    async fn find_by_status(
        &self,
        status: AssetStatus,
        context: &SecurityContext,
    ) -> Result<Vec<Asset>, DatabaseError>;

    /// Find assets by classification level
    async fn find_by_classification(
        &self,
        classification: SecurityClassification,
        context: &SecurityContext,
    ) -> Result<Vec<Asset>, DatabaseError>;

    /// Find assets by location within radius
    async fn find_by_location(
        &self,
        latitude: f64,
        longitude: f64,
        radius_meters: f64,
        context: &SecurityContext,
    ) -> Result<Vec<Asset>, DatabaseError>;

    /// Update asset status
    async fn update_status(
        &self,
        id: &Uuid,
        status: AssetStatus,
        context: &SecurityContext,
    ) -> Result<bool, DatabaseError>;

    /// Get asset location history
    async fn get_location_history(
        &self,
        id: &Uuid,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
        context: &SecurityContext,
    ) -> Result<Vec<LocationMetadata>, DatabaseError>;
}

/// Audit repository interface
#[async_trait]
pub trait AuditRepository: Repository<AuditEvent, Uuid> + Send + Sync {
    /// Find audit events by status
    async fn find_by_status(
        &self,
        status: AuditStatus,
        context: &SecurityContext,
    ) -> Result<Vec<AuditEvent>, DatabaseError>;

    /// Find audit events by time range
    async fn find_by_time_range(
        &self,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
        context: &SecurityContext,
    ) -> Result<Vec<AuditEvent>, DatabaseError>;

    /// Find audit events by resource
    async fn find_by_resource(
        &self,
        resource_type: &str,
        resource_id: Option<Uuid>,
        context: &SecurityContext,
    ) -> Result<Vec<AuditEvent>, DatabaseError>;

    /// Clean up old audit events
    async fn cleanup_old_events(
        &self,
        older_than: DateTime<Utc>,
        context: &SecurityContext,
    ) -> Result<u64, DatabaseError>;
}

/// Security repository interface
#[async_trait]
pub trait SecurityRepository: Send + Sync {
    /// Store security classification for a resource
    async fn store_classification(
        &self,
        resource_id: Uuid,
        classification: SecurityClassification,
        context: &SecurityContext,
    ) -> Result<(), DatabaseError>;

    /// Get security classification for a resource
    async fn get_classification(
        &self,
        resource_id: Uuid,
        context: &SecurityContext,
    ) -> Result<SecurityClassification, DatabaseError>;

    /// Update security classification for a resource
    async fn update_classification(
        &self,
        resource_id: Uuid,
        classification: SecurityClassification,
        context: &SecurityContext,
    ) -> Result<bool, DatabaseError>;

    /// Get all resources with a specific classification
    async fn get_resources_by_classification(
        &self,
        classification: SecurityClassification,
        context: &SecurityContext,
    ) -> Result<Vec<Uuid>, DatabaseError>;
}

pub mod asset;
pub mod audit;
pub mod security;
