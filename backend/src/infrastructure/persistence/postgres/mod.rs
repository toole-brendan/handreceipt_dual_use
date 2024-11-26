pub mod property_repository;
pub mod transfer_repository;

use sqlx::PgPool;
use std::sync::Arc;

/// Trait for repositories that use a Postgres connection pool
pub trait PostgresRepository {
    fn pool(&self) -> &Arc<PgPool>;
}
