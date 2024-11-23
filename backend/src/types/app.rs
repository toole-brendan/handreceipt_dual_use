use async_trait::async_trait;
use std::sync::Arc;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::{
    error::CoreError,
    types::{
        security::{SecurityContext, SecurityClassification},
        property::Property,
        audit::AuditEvent,
    },
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppStatus {
    pub healthy: bool,
    pub uptime: u64,
    pub version: String,
    pub environment: String,
}

// Service traits
#[async_trait]
pub trait CoreService: Send + Sync {
    async fn initialize(&self) -> Result<(), CoreError>;
    async fn shutdown(&self) -> Result<(), CoreError>;
    async fn health_check(&self) -> Result<bool, CoreError>;
    async fn get_status(&self) -> Result<AppStatus, CoreError>;
}

#[async_trait]
pub trait SecurityService: Send + Sync {
    async fn validate_context(&self, context: &SecurityContext) -> Result<bool, CoreError>;
    async fn check_permissions(&self, context: &SecurityContext, resource: &str, action: &str) -> Result<bool, CoreError>;
    async fn encrypt_data(&self, data: &[u8]) -> Result<Vec<u8>, CoreError>;
    async fn decrypt_data(&self, data: &[u8]) -> Result<Vec<u8>, CoreError>;
    async fn initialize(&self) -> Result<(), CoreError>;
    async fn shutdown(&self) -> Result<(), CoreError>;
    async fn health_check(&self) -> Result<bool, CoreError>;
}

#[async_trait]
pub trait PropertyService: Send + Sync {
    async fn create_property(&self, property: Property, context: &SecurityContext) -> Result<Property, CoreError>;
    async fn get_property(&self, id: Uuid, context: &SecurityContext) -> Result<Option<Property>, CoreError>;
    async fn update_property(&self, property: &Property, context: &SecurityContext) -> Result<(), CoreError>;
    async fn list_properties(&self, context: &SecurityContext) -> Result<Vec<Property>, CoreError>;
    async fn delete_property(&self, id: Uuid, context: &SecurityContext) -> Result<(), CoreError>;
}

#[async_trait]
pub trait TransferService: Send + Sync {
    async fn initiate_transfer(&self, property_id: Uuid, new_custodian: String, context: &SecurityContext) -> Result<(), CoreError>;
    async fn approve_transfer(&self, transfer_id: Uuid, context: &SecurityContext) -> Result<(), CoreError>;
    async fn cancel_transfer(&self, transfer_id: Uuid, context: &SecurityContext) -> Result<(), CoreError>;
    async fn get_transfer_history(&self, property_id: Uuid, context: &SecurityContext) -> Result<Vec<Transfer>, CoreError>;
}

#[async_trait]
pub trait AuditLogger: Send + Sync {
    async fn log_event(&self, event: AuditEvent, context: &SecurityContext) -> Result<(), CoreError>;
    async fn initialize(&self) -> Result<(), CoreError>;
    async fn shutdown(&self) -> Result<(), CoreError>;
    async fn health_check(&self) -> Result<bool, CoreError>;
}

// App state
#[derive(Clone)]
pub struct AppState {
    pub config: AppConfig,
    pub security: Arc<dyn SecurityService>,
    pub property_service: Arc<dyn PropertyService>,
    pub transfer_service: Arc<dyn TransferService>,
}

// Configuration types
#[derive(Clone, Debug, Default)]
pub struct AppConfig {
    pub environment: Environment,
    pub database: DatabaseConfig,
    pub security: SecurityConfig,
}

#[derive(Clone, Debug)]
pub enum Environment {
    Development,
    Staging,
    Production,
}

impl Default for Environment {
    fn default() -> Self {
        Environment::Development
    }
}

#[derive(Clone, Debug, Default)]
pub struct DatabaseConfig {
    pub url: String,
    pub max_connections: u32,
}

#[derive(Clone, Debug, Default)]
pub struct SecurityConfig {
    pub encryption_key: String,
    pub token_secret: String,
}
