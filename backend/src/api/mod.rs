pub mod routes;
pub mod types;
pub mod handlers;

// Re-export route modules directly for convenience
pub use routes::*;

// Re-export common types
pub use types::ApiResponse;

// Re-export error handling from main error module
pub use crate::error::{ApiError, Result as ApiResult};

// Re-export handler utilities
pub use handlers::{
    HandlerResult,
    map_db_error,
    map_validation_error,
    ok_response,
    created_response,
    no_content_response,
};
