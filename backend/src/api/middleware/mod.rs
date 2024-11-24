pub mod auth;
pub mod error_handler;
pub mod validation;
pub mod types;

pub use auth::Authentication;
pub use error_handler::ErrorHandler;
pub use validation::RequestValidator;
pub use types::MiddlewareFuture;

use tracing::{debug, error, info};

/// Core middleware initialization
pub fn init_middleware() {
    info!("Initializing core middleware stack");
    debug!("Loading middleware components:");
    debug!("- Authentication middleware");
    debug!("- Error handler middleware");
    debug!("- Request validation middleware");
}

/// Error tracking with context
pub fn track_middleware_error(
    middleware_name: &str, 
    error: &dyn std::error::Error,
    context: Option<&str>
) {
    error!(
        "Middleware '{}' encountered error: {} {}",
        middleware_name,
        error,
        context.unwrap_or("")
    );
    if let Some(source) = error.source() {
        debug!("Error source: {:?}", source);
    }
}

/// Request/response logging
pub fn log_middleware_request_response(
    middleware_name: &str,
    request_path: &str,
    status_code: Option<u16>,
    duration: std::time::Duration,
) {
    info!(
        "[{}] {} {} {:?}",
        middleware_name,
        status_code.map_or("---".to_string(), |c| c.to_string()),
        request_path,
        duration
    );
}
