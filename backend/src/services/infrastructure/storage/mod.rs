use async_trait::async_trait;
use tokio_postgres::Row;
use crate::types::error::CoreError;

pub mod postgres;
pub mod repositories;
pub mod models;

pub type StorageResult<T> = Result<T, CoreError>;

#[async_trait]
pub trait DatabaseConnection: Send + Sync {
    async fn execute(
        &self,
        query: &str,
        params: &[&(dyn tokio_postgres::types::ToSql + Sync)],
    ) -> StorageResult<u64>;

    async fn query(
        &self,
        query: &str,
        params: &[&(dyn tokio_postgres::types::ToSql + Sync)],
    ) -> StorageResult<Vec<Row>>;
}

pub trait FromRow: Sized {
    fn from_row(row: &tokio_postgres::Row) -> Result<Self, CoreError>;
}

pub trait ToRow {
    fn to_row(&self) -> Vec<Box<dyn tokio_postgres::types::ToSql + Sync>>;
}

pub trait Repository<T> {
    fn table_name() -> &'static str;
    fn columns() -> &'static [&'static str];
}
