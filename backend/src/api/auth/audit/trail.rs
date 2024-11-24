// backend/src/security/audit/trail.rs

use super::logger::{AuditError, AuditEvent, AuditEventType, AuditSeverity};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditTrail {
    pub id: Uuid,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub resource_id: String,
    pub user_id: Option<Uuid>,
    pub operation_type: String,
    pub events: Vec<Uuid>,
    pub status: TrailStatus,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TrailStatus {
    InProgress,
    Completed,
    Failed,
    Suspicious,
}

pub struct AuditTrailManager {
    db_pool: Arc<deadpool_postgres::Pool>,
    active_trails: Arc<RwLock<Vec<AuditTrail>>>,
}

impl AuditTrailManager {
    pub fn new(db_pool: Arc<deadpool_postgres::Pool>) -> Self {
        Self {
            db_pool,
            active_trails: Arc::new(RwLock::new(Vec::new())),
        }
    }

    /// Start a new audit trail
    pub async fn start_trail(
        &self,
        resource_id: String,
        user_id: Option<Uuid>,
        operation_type: String,
        metadata: serde_json::Value,
    ) -> Result<Uuid, AuditError> {
        let trail = AuditTrail {
            id: Uuid::new_v4(),
            start_time: Utc::now(),
            end_time: None,
            resource_id,
            user_id,
            operation_type,
            events: Vec::new(),
            status: TrailStatus::InProgress,
            metadata,
        };

        // Store in memory
        self.active_trails.write().await.push(trail.clone());

        // Persist to database
        self.persist_trail(&trail).await?;

        Ok(trail.id)
    }

    /// Add an event to an audit trail
    pub async fn add_event(
        &self,
        trail_id: Uuid,
        event_id: Uuid,
    ) -> Result<(), AuditError> {
        let mut trails = self.active_trails.write().await;
        let trail = trails
            .iter_mut()
            .find(|t| t.id == trail_id)
            .ok_or_else(|| AuditError::ChainValidationError("Trail not found".to_string()))?;

        trail.events.push(event_id);

        // Update in database
        self.update_trail_events(trail_id, &trail.events).await?;

        Ok(())
    }

    /// Complete an audit trail
    pub async fn complete_trail(
        &self,
        trail_id: Uuid,
        status: TrailStatus,
    ) -> Result<(), AuditError> {
        let mut trails = self.active_trails.write().await;
        let trail = trails
            .iter_mut()
            .find(|t| t.id == trail_id)
            .ok_or_else(|| AuditError::ChainValidationError("Trail not found".to_string()))?;

        trail.end_time = Some(Utc::now());
        trail.status = status;

        // Update in database
        self.update_trail_status(trail_id, &trail.status, trail.end_time).await?;

        Ok(())
    }

    /// Analyze a trail for suspicious patterns
    pub async fn analyze_trail(&self, trail_id: Uuid) -> Result<TrailStatus, AuditError> {
        let events = self.get_trail_events(trail_id).await?;
        
        // Example analysis criteria
        let has_failures = events.iter().any(|e| e.status == "failure");
        let has_critical = events.iter().any(|e| matches!(e.severity, AuditSeverity::Critical));
        let rapid_events = self.check_rapid_events(&events);

        if has_critical || (has_failures && rapid_events) {
            Ok(TrailStatus::Suspicious)
        } else {
            Ok(TrailStatus::Completed)
        }
    }

    /// Check for suspiciously rapid event sequences
    fn check_rapid_events(&self, events: &[AuditEvent]) -> bool {
        if events.len() < 2 {
            return false;
        }

        for window in events.windows(2) {
            if let [prev, curr] = window {
                let duration = curr.timestamp - prev.timestamp;
                if duration < Duration::milliseconds(100) {
                    return true;
                }
            }
        }
        false
    }

    /// Persist trail to database
    async fn persist_trail(&self, trail: &AuditTrail) -> Result<(), AuditError> {
        let client = self.db_pool.get().await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        client
            .execute(
                "INSERT INTO audit_trails (
                    id, start_time, end_time, resource_id, user_id,
                    operation_type, events, status, metadata
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                &[
                    &trail.id,
                    &trail.start_time,
                    &trail.end_time,
                    &trail.resource_id,
                    &trail.user_id,
                    &trail.operation_type,
                    &serde_json::to_value(&trail.events).unwrap(),
                    &serde_json::to_value(&trail.status).unwrap(),
                    &trail.metadata,
                ],
            )
            .await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    /// Update trail events in database
    async fn update_trail_events(&self, trail_id: Uuid, events: &[Uuid]) -> Result<(), AuditError> {
        let client = self.db_pool.get().await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        client
            .execute(
                "UPDATE audit_trails SET events = $1 WHERE id = $2",
                &[&serde_json::to_value(events).unwrap(), &trail_id],
            )
            .await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    /// Update trail status in database
    async fn update_trail_status(
        &self,
        trail_id: Uuid,
        status: &TrailStatus,
        end_time: Option<DateTime<Utc>>,
    ) -> Result<(), AuditError> {
        let client = self.db_pool.get().await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        client
            .execute(
                "UPDATE audit_trails SET status = $1, end_time = $2 WHERE id = $3",
                &[&serde_json::to_value(status).unwrap(), &end_time, &trail_id],
            )
            .await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    /// Retrieve events for a trail
    async fn get_trail_events(&self, trail_id: Uuid) -> Result<Vec<AuditEvent>, AuditError> {
        let client = self.db_pool.get().await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        let trail = client
            .query_one("SELECT events FROM audit_trails WHERE id = $1", &[&trail_id])
            .await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        let event_ids: Vec<Uuid> = serde_json::from_value(trail.get("events"))
            .map_err(|e| AuditError::SerializationError(e.to_string()))?;

        let events = client
            .query(
                "SELECT * FROM audit_events WHERE id = ANY($1) ORDER BY timestamp",
                &[&event_ids],
            )
            .await
            .map_err(|e| AuditError::DatabaseError(e.to_string()))?;

        events
            .into_iter()
            .map(|row| self.row_to_event(&row))
            .collect()
    }

    /// Convert database row to AuditEvent
    fn row_to_event(&self, row: &tokio_postgres::Row) -> Result<AuditEvent, AuditError> {
        Ok(AuditEvent {
            id: row.get("id"),
            timestamp: row.get("timestamp"),
            event_type: serde_json::from_value(row.get("event_type"))
                .map_err(|e| AuditError::SerializationError(e.to_string()))?,
            severity: serde_json::from_value(row.get("severity"))
                .map_err(|e| AuditError::SerializationError(e.to_string()))?,
            user_id: row.get("user_id"),
            resource_id: row.get("resource_id"),
            action: row.get("action"),
            status: row.get("status"),
            details: row.get("details"),
            metadata: row.get("metadata"),
            previous_hash: row.get("previous_hash"),
            hash: row.get("hash"),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use deadpool_postgres::Config;
    use tokio_postgres::NoTls;

    async fn create_test_pool() -> Arc<deadpool_postgres::Pool> {
        let mut cfg = Config::new();
        cfg.host = Some("localhost".to_string());
        cfg.dbname = Some("test_db".to_string());
        cfg.user = Some("test_user".to_string());
        cfg.password = Some("test_password".to_string());
        
        Arc::new(cfg.create_pool(NoTls).unwrap())
    }

    #[tokio::test]
    async fn test_audit_trail() {
        let pool = create_test_pool().await;
        let trail_manager = AuditTrailManager::new(pool);

        // Start trail
        let trail_id = trail_manager
            .start_trail(
                "resource123".to_string(),
                Some(Uuid::new_v4()),
                "test_operation".to_string(),
                serde_json::json!({}),
            )
            .await
            .unwrap();

        // Add events
        let event_id = Uuid::new_v4();
        trail_manager.add_event(trail_id, event_id).await.unwrap();

        // Complete trail
        trail_manager
            .complete_trail(trail_id, TrailStatus::Completed)
            .await
            .unwrap();

        // Analyze trail
        let status = trail_manager.analyze_trail(trail_id).await.unwrap();
        assert_eq!(status, TrailStatus::Completed);
    }
}
