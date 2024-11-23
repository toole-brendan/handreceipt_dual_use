use std::sync::Arc;
use actix_web::web;
use deadpool_postgres::Pool;
use std::collections::HashMap;

use crate::{
    services::{
        core::{
            CoreServiceImpl,
            audit::AuditManagerImpl,
            verification::VerificationManagerImpl,
        },
        infrastructure::storage::DatabaseModule,
        network::{
            mesh::service::MeshServiceImpl,
            p2p::P2PServiceImpl,
            sync::service::SyncManagerImpl,
        },
    },
    security::SecurityModule,
    types::{
        app::{AppState, AppConfig},
        security::{SecurityContext, SecurityClassification, SecurityLevel, SecurityZone},
    },
    error::CoreError,
};

pub struct AppBuilder {
    db_pool: Option<Pool>,
    config: Option<AppConfig>,
}

impl AppBuilder {
    pub fn new() -> Self {
        Self {
            db_pool: None,
            config: None,
        }
    }

    pub fn with_database(mut self, db_pool: Pool) -> Self {
        self.db_pool = Some(db_pool);
        self
    }

    pub fn with_config(mut self, config: AppConfig) -> Self {
        self.config = Some(config);
        self
    }

    pub fn build(self) -> Result<web::Data<AppState>, CoreError> {
        let db_pool = self.db_pool.ok_or_else(|| {
            CoreError::Configuration("Database pool not configured".to_string())
        })?;

        let config = self.config.unwrap_or_default();

        // Create database module
        let database = Arc::new(DatabaseModule::new(db_pool));

        // Create security module
        let security = Arc::new(SecurityModule::new_default());

        // Create verification service
        let verification = Arc::new(VerificationManagerImpl::new(
            database.clone(),
            security.clone(),
        ));

        // Create audit service
        let audit = Arc::new(AuditManagerImpl::new(
            database.clone(),
            security.clone(),
        ));

        // Create mesh service
        let mesh = Arc::new(MeshServiceImpl::new());

        // Create P2P service
        let p2p = Arc::new(P2PServiceImpl::new());

        // Create sync manager
        let sync = Arc::new(SyncManagerImpl::new(
            database.clone(),
            mesh.clone(),
            p2p.clone(),
        ));

        Ok(web::Data::new(AppState {
            config,
            database,
            security,
            verification,
            audit,
            sync_manager: sync,
            mesh_service: mesh,
            p2p_service: p2p,
        }))
    }
}

impl Default for AppBuilder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_builder() {
        let db_config = deadpool_postgres::Config {
            host: Some("localhost".to_string()),
            port: Some(5432),
            dbname: Some("test_db".to_string()),
            user: Some("test_user".to_string()),
            password: Some("test_password".to_string()),
            ..Default::default()
        };

        let pool = db_config.create_pool(None, tokio_postgres::NoTls)
            .expect("Failed to create pool");

        let app_state = AppBuilder::new()
            .with_database(pool)
            .build()
            .expect("Failed to build app state");

        assert!(app_state.database.is_some());
        assert!(app_state.security.is_some());
        assert!(app_state.verification.is_some());
        assert!(app_state.audit.is_some());
        assert!(app_state.sync_manager.is_some());
        assert!(app_state.mesh_service.is_some());
        assert!(app_state.p2p_service.is_some());
    }
}
