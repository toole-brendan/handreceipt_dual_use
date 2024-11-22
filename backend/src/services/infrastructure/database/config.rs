// backend/src/services/database/config.rs

use deadpool_postgres::{Config, Pool, Runtime};
use tokio_postgres::NoTls;

pub struct DatabaseConfig {
    config: Config,
}

impl DatabaseConfig {
    pub fn new() -> Self {
        let mut cfg = Config::new();
        cfg.host = Some(std::env::var("DB_HOST").unwrap_or_else(|_| "localhost".to_string()));
        cfg.port = Some(std::env::var("DB_PORT").unwrap_or_else(|_| "5432".to_string()).parse().unwrap_or(5432));
        cfg.user = Some(std::env::var("DB_USER").unwrap_or_else(|_| "postgres".to_string()));
        cfg.password = Some(std::env::var("DB_PASSWORD").unwrap_or_default());
        cfg.dbname = Some(std::env::var("DB_NAME").unwrap_or_else(|_| "mats".to_string()));

        Self { config: cfg }
    }

    pub fn create_pool(&self) -> Result<Pool, Box<dyn std::error::Error>> {
        Ok(self.config.create_pool(None as Option<Runtime>, NoTls)?)
    }
} 