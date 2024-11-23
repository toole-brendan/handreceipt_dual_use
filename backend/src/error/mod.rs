//! Error types and handling

pub mod api;
pub mod audit;
pub mod blockchain;
pub mod core;
pub mod database;
pub mod security;
pub mod validation;

pub use api::ApiError;
pub use audit::AuditError;
pub use blockchain::BlockchainError;
pub use core::CoreError;
pub use database::DatabaseError;
pub use security::SecurityError;
pub use validation::ValidationError;
