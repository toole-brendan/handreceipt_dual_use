use std::sync::Arc;
use async_trait::async_trait;

use crate::{
    error::CoreError,
    types::app::{AppConfig, AppStatus},
    infrastructure::persistence::DatabaseConfig,
};

#[async_trait]
pub trait CoreService: Send + Sync {
    async fn initialize(&self) -> Result<(), CoreError>;
    async fn shutdown(&self) -> Result<(), CoreError>;
    async fn health_check(&self) -> Result<bool, CoreError>;
    async fn get_status(&self) -> Result<AppStatus, CoreError>;
}

pub struct Core {
    config: AppConfig,
}

impl Core {
    pub fn new(config: AppConfig) -> Self {
        Self { config }
    }

    pub async fn initialize(&self) -> Result<(), CoreError> {
        Ok(())
    }

    pub async fn shutdown(&self) -> Result<(), CoreError> {
        Ok(())
    }
}
