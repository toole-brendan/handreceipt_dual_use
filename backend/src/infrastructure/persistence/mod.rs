pub mod postgres;

use sqlx::postgres::PgPool;
use sqlx::postgres::PgPoolOptions;
use std::sync::Arc;

pub use postgres::PostgresConnection;
pub use postgres::property_repository::PostgresPropertyRepository;

/// Configuration for database connections
#[derive(Debug, Clone)]
pub struct DatabaseConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub database: String,
    pub max_connections: u32,
}

impl DatabaseConfig {
    /// Creates a new database configuration from environment variables
    pub fn from_env() -> Self {
        Self {
            host: std::env::var("DB_HOST").unwrap_or_else(|_| "localhost".to_string()),
            port: std::env::var("DB_PORT")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(5432),
            username: std::env::var("DB_USER").unwrap_or_else(|_| "postgres".to_string()),
            password: std::env::var("DB_PASSWORD").expect("DB_PASSWORD must be set"),
            database: std::env::var("DB_NAME").unwrap_or_else(|_| "handreceipt".to_string()),
            max_connections: std::env::var("DB_MAX_CONNECTIONS")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(5),
        }
    }

    /// Creates a connection string from the configuration
    pub fn connection_string(&self) -> String {
        format!(
            "postgres://{}:{}@{}:{}/{}",
            self.username, self.password, self.host, self.port, self.database
        )
    }
}

/// Creates a new database connection pool
pub async fn create_pool(config: &DatabaseConfig) -> Result<PgPool, sqlx::Error> {
    PgPoolOptions::new()
        .max_connections(config.max_connections)
        .connect(&config.connection_string())
        .await
}

/// Creates repositories with the provided connection pool
pub fn create_repositories(
    pool: PgPool,
) -> Repositories {
    Repositories {
        property: Arc::new(PostgresPropertyRepository::new(pool)),
        // TODO: Implement transfer repository
        // transfer: Arc::new(PostgresTransferRepository::new(pool)),
    }
}

/// Container for all repositories
#[derive(Clone)]
pub struct Repositories {
    pub property: Arc<PostgresPropertyRepository>,
    // TODO: Add transfer repository after implementation
    // pub transfer: Arc<PostgresTransferRepository>,
}

#[cfg(test)]
pub mod test_utils {
    use super::*;
    use sqlx::migrate::MigrateDatabase;

    /// Creates a test database and runs migrations
    pub async fn setup_test_db() -> Result<PgPool, sqlx::Error> {
        let config = DatabaseConfig {
            host: "localhost".to_string(),
            port: 5432,
            username: "postgres".to_string(),
            password: "postgres".to_string(),
            database: format!("test_db_{}", uuid::Uuid::new_v4()),
            max_connections: 5,
        };

        // Create test database
        sqlx::Postgres::create_database(&config.connection_string()).await?;

        // Create pool and run migrations
        let pool = create_pool(&config).await?;
        
        sqlx::migrate!("./migrations")
            .run(&pool)
            .await?;

        Ok(pool)
    }

    /// Tears down the test database
    pub async fn teardown_test_db(pool: PgPool) -> Result<(), sqlx::Error> {
        let db_name = pool.connect_options().get_database()
            .map(|db| format!("postgres://postgres:postgres@localhost:5432/{}", db))
            .unwrap_or_else(|| "postgres://postgres:postgres@localhost:5432/postgres".to_string());
            
        drop(pool);
        sqlx::Postgres::drop_database(&db_name).await
    }
}
