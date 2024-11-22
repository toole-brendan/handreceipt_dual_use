pub mod actors;
pub mod api;
pub mod app_builder;
pub mod blockchain;
pub mod config;
pub mod core;
pub mod error;
pub mod handlers;
pub mod middleware;
pub mod models;
pub mod prelude;
pub mod security;
pub mod services;
pub mod types;
pub mod utils;

// Re-export core types and traits
pub use crate::{
    app_builder::AppBuilder,
    blockchain::{
        Block, Transaction, TransactionData,
        BlockchainService, ConsensusService,
    },
    config::{
        Config, ServerConfig, DatabaseConfig,
        SecurityConfig, mesh_config::MeshConfig,
    },
    services::{
        ServiceInit, ServiceLifecycle,
        core::CoreServiceImpl as CoreModule,
        security::SecurityModuleImpl as SecurityModule,
        infrastructure::InfrastructureService as DatabaseModule,
        network::{
            mesh::MeshServiceImpl as MeshModule,
            p2p::P2PServiceImpl as P2PModule,
            sync::service::SyncManagerImpl as SyncModule,
        },
    },
    types::{
        app::{
            AppState, DatabaseService, SecurityService,
            AssetVerification, AuditLogger, MeshService,
            P2PService, SyncManager,
        },
        error::CoreError,
        security::SecurityContext,
    },
};

pub type Result<T> = std::result::Result<T, CoreError>;

// Re-export commonly used external crates
pub use async_trait::async_trait;
pub use serde::{Deserialize, Serialize};
pub use uuid::Uuid;
