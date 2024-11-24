pub mod api;
pub mod application;
pub mod config;
pub mod core;
pub mod domain;
pub mod error;
pub mod infrastructure;
pub mod types;
pub mod utils;

// Re-export commonly used types
pub use {
    domain::{
        property::entity::Property,
        transfer::entity::Transfer,
    },
    types::{
        PropertyService,
        TransferService,
        SecurityService,
        app::AppState,
    },
    error::CoreError,
};
