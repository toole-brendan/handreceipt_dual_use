pub mod routes;
pub mod types;
pub mod handlers;
pub mod auth;

// Re-export route modules directly for convenience
pub use routes::*;

// Re-export common types
pub use types::ApiResponse;

// Re-export handler utilities
pub use handlers::{
    HandlerResult,
    ok_response,
    created_response,
    no_content_response,
    not_found_response,
    forbidden_response,
};

// Re-export auth module
pub use auth::*;

use actix_web::web;
use crate::api::routes::{mobile, property, transfer, user};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .configure(mobile::configure_routes)
            .configure(property::configure_routes)
            .configure(transfer::configure_routes)
            .configure(user::configure_routes)
    );
}
