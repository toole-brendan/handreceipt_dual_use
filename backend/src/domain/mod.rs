//! Core domain models and business logic

pub mod models;
pub mod property;
pub mod transfer;

// Re-export commonly used types
pub use {
    property::{Property, PropertyRepository, PropertyServiceImpl},
    transfer::{Transfer, TransferRepository, TransferService},
};

// Import PropertyService from types::app instead
pub use crate::types::app::PropertyService;
