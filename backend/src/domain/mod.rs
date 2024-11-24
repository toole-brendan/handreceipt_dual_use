//! Core domain models and business logic

pub mod models;
pub mod property;
pub mod transfer;

// Re-export commonly used types
pub use {
    property::{Property, PropertyRepository, PropertyService},
    transfer::{Transfer, TransferRepository, TransferService},
};
