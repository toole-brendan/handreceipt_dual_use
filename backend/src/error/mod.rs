//! Error types and handling

pub mod api;
pub mod audit;
pub mod blockchain;
pub mod core;
pub mod database;
pub mod security;
pub mod validation;

pub use {
    api::ApiError,
    audit::AuditError,
    blockchain::BlockchainError,
    core::CoreError,
    database::DatabaseError,
    security::SecurityError,
    validation::ValidationError,
};

pub type Result<T> = std::result::Result<T, CoreError>;

// Re-export common error types
pub use core::CoreError as Error;
