use async_trait::async_trait;
use serde::{Serialize, Deserialize};
use crate::types::error::DatabaseError;

#[async_trait]
pub trait StorageModel: Send + Sync + Serialize + for<'de> Deserialize<'de> {
    type Id;
    
    fn get_id(&self) -> &Self::Id;
    fn get_table_name() -> &'static str;
    
    async fn to_row(&self) -> Result<tokio_postgres::Row, DatabaseError>;
    async fn from_row(row: tokio_postgres::Row) -> Result<Self, DatabaseError>;
} 