use std::sync::Arc;
use actix_web::web;
use sqlx::PgPool;

use crate::{
    api::auth::{
        AuditServiceImpl, EncryptionServiceImpl,
        SecurityServiceImpl,
    },
    domain::{
        property::repository::PropertyRepository,
        transfer::repository::TransferRepository,
    },
    infrastructure::persistence::{
        postgres::{
            property_repository::PgPropertyRepository,
            transfer_repository::PgTransferRepository,
        },
        DatabaseConfig as PersistenceConfig,
    },
    types::{
        app::{AppState, AppConfig, SecurityConfig, Environment, DatabaseConfig},
        security::SecurityContext,
        SecurityService,
    },
};

pub struct AppBuilder;

impl AppBuilder {
    pub fn new() -> Self {
        Self
    }

    fn build_connection_string(config: &PersistenceConfig) -> String {
        format!(
            "postgres://{}:{}@{}:{}/{}",
            config.username,
            config.password,
            config.host,
            config.port,
            config.database
        )
    }

    fn convert_encryption_key(key: &str) -> [u8; 32] {
        let mut result = [0u8; 32];
        let bytes = hex::decode(key).expect("Invalid encryption key format");
        result.copy_from_slice(&bytes);
        result
    }

    pub async fn build(db_config: PersistenceConfig, encryption_key: String) -> Result<web::Data<AppState>, String> {
        let connection_string = Self::build_connection_string(&db_config);
        let db_pool = PgPool::connect(&connection_string)
            .await
            .map_err(|e| format!("Failed to connect to database: {}", e))?;

        let property_repo: Arc<dyn PropertyRepository + Send + Sync> = 
            Arc::new(PgPropertyRepository::new(db_pool.clone()));
        let transfer_repo: Arc<dyn TransferRepository + Send + Sync> = 
            Arc::new(PgTransferRepository::new(db_pool.clone()));

        let encryption_key_bytes = Self::convert_encryption_key(&encryption_key);
        let encryption = Arc::new(EncryptionServiceImpl::new(&encryption_key_bytes));
        
        // Create a default security context for audit service
        let security_context = SecurityContext::default();
        let audit = Arc::new(AuditServiceImpl::new(security_context));
        
        let security: Arc<dyn SecurityService + Send + Sync> = Arc::new(SecurityServiceImpl::new(encryption, audit));

        let app_db_config = DatabaseConfig {
            url: connection_string,
            max_connections: db_config.max_connections,
        };

        let config = AppConfig {
            environment: Environment::Development,
            database: app_db_config,
            security: SecurityConfig {
                encryption_key,
                token_secret: "your-token-secret".to_string(), // TODO: Make configurable
            },
        };

        Ok(web::Data::new(AppState {
            config,
            security,
            property_repo,
            transfer_repo,
        }))
    }
}
