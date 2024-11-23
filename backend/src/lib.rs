pub mod error;
pub mod security;
pub mod services;
pub mod types;
pub mod blockchain;
pub mod handlers;
pub mod api;
pub mod app_builder;
pub mod config;
pub mod middleware;
pub mod models;
pub mod prelude;
pub mod utils;

// Re-export core types and traits
pub use crate::{
    types::{
        app::{AppState, SecurityService},
        security::SecurityContext,
        blockchain::{Block, Transaction, TransactionData},
        property::Property,
        transfer::Transfer,
    },
    error::{CoreError, Result},
    services::{
        property::PropertyService,
        transfer::TransferService,
    },
};

// Re-export commonly used external crates
pub use async_trait::async_trait;
pub use serde::{Deserialize, Serialize};
pub use uuid::Uuid;

// Re-export security module
pub use security::{
    SecurityModule,
    AccessControl,
    AuditService,
    EncryptionService,
};
