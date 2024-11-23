pub mod error;
pub mod security;
pub mod services;
pub mod types;
pub mod blockchain;
pub mod handlers;
pub mod actors;
pub mod api;
pub mod app_builder;
pub mod config;
pub mod core;
pub mod middleware;
pub mod models;
pub mod prelude;
pub mod utils;

// Re-export core types and traits
pub use crate::{
    types::{
        app::{AppState, DatabaseService, SecurityService},
        security::SecurityContext,
        blockchain::{Block, Transaction, TransactionData},
    },
    error::{CoreError, Result},
    services::{
        core::CoreServiceImpl,
        infrastructure::storage::DatabaseModule,
        network::{
            mesh::service::MeshServiceImpl,
            p2p::P2PServiceImpl,
            sync::service::SyncManagerImpl,
        },
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
    HsmService,
    KeyManager,
    MfaService,
    ValidationService,
};
