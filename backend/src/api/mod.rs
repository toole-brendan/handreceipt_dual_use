pub mod routes;
pub mod types;
pub mod handlers;

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
