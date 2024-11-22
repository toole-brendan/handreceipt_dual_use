//! Military Asset Tracking System (MATS) Library
//! Provides core functionality for asset tracking with security classifications

use log::{info};

// Public modules
pub mod api;
pub mod core;
pub mod error;
pub mod services;
pub mod middleware;
pub mod app_builder;
pub mod handlers;
pub mod models;
pub mod utils;
pub mod actors;
pub mod types;

// Re-export commonly used items
pub use utils::ResponseExt;
pub use models::UuidWrapper;
pub use actors::websocket_actor::WebSocketActor;
pub use types::{
    app::AppState,
    error::CoreError,
    security::SecurityContext,
    Result,
};

// Add middleware re-exports
pub mod prelude {
    pub use crate::utils::ResponseExt;
    pub use crate::models::UuidWrapper;
    pub use crate::middleware::{
        ErrorHandler,
        RateLimiter,
        RequestValidator,
        ApiVersioning,
    };
}

// Debugging utilities
#[cfg(debug_assertions)]
pub mod debug {
    use log::{debug, error, trace, warn};
    use std::time::Instant;

    pub fn log_request_processing(middleware_name: &str, path: &str) {
        trace!("[{}] Processing request: {}", middleware_name, path);
    }

    pub fn log_response_processing(middleware_name: &str, status: u16, duration: std::time::Duration) {
        debug!(
            "[{}] Response completed - Status: {}, Duration: {:?}",
            middleware_name, status, duration
        );
    }

    pub fn log_error(middleware_name: &str, error: &dyn std::error::Error) {
        error!(
            "[{}] Error occurred: {}\nBacktrace: {:?}",
            middleware_name,
            error,
            std::backtrace::Backtrace::capture()
        );
    }

    pub fn log_performance_metric(middleware_name: &str, operation: &str, start: Instant) {
        let duration = start.elapsed();
        if duration.as_millis() > 100 {
            warn!(
                "[{}] Slow operation detected - {}: {:?}",
                middleware_name, operation, duration
            );
        } else {
            debug!(
                "[{}] Operation timing - {}: {:?}",
                middleware_name, operation, duration
            );
        }
    }
}

// Initialize logging for the entire library
pub fn init() {
    use env_logger::{Builder, Env};
    use log::LevelFilter;

    let env = Env::default()
        .filter_or("RUST_LOG", "debug")
        .write_style_or("RUST_LOG_STYLE", "always");

    Builder::from_env(env)
        .format(|buf, record| {
            use std::io::Write;
            writeln!(
                buf,
                "{} [{}] {} - {}:{} - {}",
                chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f"),
                record.level(),
                record.target(),
                record.file().unwrap_or("unknown"),
                record.line().unwrap_or(0),
                record.args()
            )
        })
        .filter(None, LevelFilter::Debug)
        .init();

    info!("MATS library initialized with debug logging enabled");
}