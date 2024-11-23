use std::sync::Arc;
use actix_web::web;
use deadpool_postgres::Pool;

use crate::{
    services::{
        property::PropertyService,
        transfer::TransferService,
    },
    security::SecurityModule,
    types::{
        app::{AppState, AppConfig},
        security::{SecurityContext, SecurityClassification, SecurityLevel, SecurityZone},
    },
    error::CoreError,
    domain::{
        property::repository::PropertyRepository,
        transfer::repository::TransferRepository,
    },
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

        // Create security module
        let security = Arc::new(SecurityModule::new_default());

        // Create repositories
        let property_repo = Box::new(PropertyRepository::new(db_pool.clone()));
        let transfer_repo = Box::new(TransferRepository::new(db_pool.clone()));

        // Create services
        let property_service = Arc::new(PropertyService::new(property_repo));
        let transfer_service = Arc::new(TransferService::new(transfer_repo));

        Ok(web::Data::new(AppState {
            config,
            security,
            property_service,
            transfer_service,
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

        assert!(app_state.security.is_some());
        assert!(app_state.property_service.is_some());
        assert!(app_state.transfer_service.is_some());
    }
}
