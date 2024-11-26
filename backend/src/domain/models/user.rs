use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use crate::error::repository::RepositoryError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub role: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[async_trait]
pub trait UserService: Send + Sync {
    async fn get_user(&self, id: i32) -> Result<Option<User>, RepositoryError>;
    async fn update_user(&self, user: &User) -> Result<User, RepositoryError>;
    async fn list_users(&self) -> Result<Vec<User>, RepositoryError>;
    async fn delete_user(&self, id: i32) -> Result<(), RepositoryError>;
} 