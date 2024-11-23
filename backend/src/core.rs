use std::sync::Arc;

use crate::{
    error::CoreError,
    services::{
        CoreModule,
        SecurityModule,
        DatabaseModule,
        MeshModule,
        P2PModule,
        SyncModule,
    },
    types::app::{
        AppConfig,
        DatabaseService,
        SecurityService,
        AssetVerification,
        AuditLogger,
        MeshService,
        P2PService,
        SyncManager,
    },
};

pub struct Core {
    pub config: AppConfig,
    pub database: Arc<dyn DatabaseService>,
    pub security: Arc<dyn SecurityService>,
    pub verification: Arc<dyn AssetVerification>,
    pub audit: Arc<dyn AuditLogger>,
    pub mesh: Arc<dyn MeshService>,
    pub p2p: Arc<dyn P2PService>,
    pub sync: Arc<dyn SyncManager>,
}

impl Core {
    pub fn new(config: AppConfig) -> Result<Self, CoreError> {
        let database = Arc::new(DatabaseModule::new(config.database.clone()));
        let security = Arc::new(SecurityModule::new());
        let verification = Arc::new(CoreModule::new(
            database.clone(),
            security.clone(),
            config.clone(),
            None,
        ));
        let audit = Arc::new(CoreModule::new(
            database.clone(),
            security.clone(),
            config.clone(),
            None,
        ));
        let mesh = Arc::new(MeshModule::new());
        let p2p = Arc::new(P2PModule::new());
        let sync = Arc::new(SyncModule::new(
            database.clone(),
            mesh.clone(),
            p2p.clone(),
        ));

        Ok(Self {
            config,
            database,
            security,
            verification,
            audit,
            mesh,
            p2p,
            sync,
        })
    }

    pub async fn initialize(&self) -> Result<(), CoreError> {
        // Initialize all services
        Ok(())
    }

    pub async fn shutdown(&self) -> Result<(), CoreError> {
        // Shutdown all services
        Ok(())
    }
}
