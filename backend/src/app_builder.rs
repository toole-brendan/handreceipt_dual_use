use std::sync::Arc;
use actix_web::web;
use sqlx::postgres::PgPool;

use crate::{
    domain::{
        property::{
            service_impl::PropertyServiceImpl,
            service_wrapper::PropertyServiceWrapper,
        },
        transfer::{
            service::{TransferService, TransferServiceImpl},
            service_wrapper::TransferServiceWrapper,
        },
    },
    infrastructure::{
        persistence::postgres::{
            property_repository::PostgresPropertyRepository,
            transfer_repository::PostgresTransferRepository,
        },
        security::DefaultSecurityService,
    },
    types::app::{AppState, AppConfig, SecurityService},
    error::CoreError,
};

pub struct AppBuilder {
    db_pool: Option<PgPool>,
    config: Option<AppConfig>,
}

impl AppBuilder {
    pub fn new() -> Self {
        Self {
            db_pool: None,
            config: None,
        }
    }

    pub fn with_database(mut self, db_pool: PgPool) -> Self {
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

        // Create repositories
        let property_repo = Arc::new(PostgresPropertyRepository::new(db_pool.clone()));
        let transfer_repo = PostgresTransferRepository::new(db_pool);

        // Create domain services
        let property_service = PropertyServiceImpl::new(property_repo);
        let transfer_service = TransferServiceImpl::new(transfer_repo);

        // Wrap domain services with app services
        let property_service = Arc::new(PropertyServiceWrapper::new(property_service));
        let transfer_service = Arc::new(TransferServiceWrapper::new(transfer_service));

        // Create security service
        let security = Arc::new(DefaultSecurityService::new(
            config.security.encryption_key.clone(),
            config.security.token_secret.clone(),
        )) as Arc<dyn SecurityService + Send + Sync>;

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
    use sqlx::postgres::PgPoolOptions;

    #[tokio::test]
    async fn test_app_builder() {
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect("postgres://test_user:test_password@localhost:5432/test_db")
            .await
            .expect("Failed to create pool");

        let _app_state = AppBuilder::new()
            .with_database(pool)
            .build()
            .expect("Failed to build app state");
    }
}
