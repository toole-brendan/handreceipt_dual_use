use std::sync::Arc;
use actix_web::web;
use deadpool_postgres::Pool;

use crate::{
    services::{
        core::CoreServiceImpl,
        infrastructure::InfrastructureService,
        network::{
            mesh::MeshServiceImpl,
            p2p::P2PServiceImpl,
            sync::service::SyncManagerImpl,
        },
        security::SecurityModuleImpl,
        verification::VerificationManagerImpl,
        audit::AuditManagerImpl,
    },
    types::{
        app::AppState,
        error::CoreError,
    },
};

pub struct AppBuilder {
    db_pool: Option<Pool>,
}

impl AppBuilder {
    pub fn new() -> Self {
        Self {
            db_pool: None,
        }
    }

    pub fn with_database(mut self, db_pool: Pool) -> Self {
        self.db_pool = Some(db_pool);
        self
    }

    pub fn build(self) -> Result<web::Data<AppState>, CoreError> {
        let db_pool = self.db_pool.ok_or_else(|| {
            CoreError::Configuration("Database pool not configured".to_string())
        })?;

        let infrastructure = Arc::new(InfrastructureService::new(db_pool));
        let security = Arc::new(SecurityModuleImpl::new());
        let verification = Arc::new(VerificationManagerImpl::new());
        let audit = Arc::new(AuditManagerImpl::new());
        let core = Arc::new(CoreServiceImpl::new(
            infrastructure.clone(),
            security.clone(),
            verification.clone(),
            audit.clone(),
        ));

        let mesh = Arc::new(MeshServiceImpl::new());
        let p2p = Arc::new(P2PServiceImpl::new());
        let sync = Arc::new(SyncManagerImpl::new(
            infrastructure.clone(),
            mesh.clone(),
            p2p.clone(),
        ));

        Ok(web::Data::new(AppState {
            core,
            infrastructure,
            security,
            verification,
            audit,
            mesh,
            p2p,
            sync,
        }))
    }
}

impl Default for AppBuilder {
    fn default() -> Self {
        Self::new()
    }
}
