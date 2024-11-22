// backend/src/middleware/mod.rs

pub mod auth;
pub mod error_handler;
pub mod rate_limit;
pub mod validation;
pub mod versioning;
pub mod types;

pub use auth::Authentication;
pub use error_handler::ErrorHandler;
pub use rate_limit::{RateLimiter, Config as RateLimitConfig};
pub use validation::RequestValidator;
pub use versioning::ApiVersioning;
pub use types::MiddlewareFuture;

use log::{debug, error, info, trace, warn};
use std::time::Instant;

// Enhanced middleware initialization logging
pub fn init_middleware() {
    info!("Initializing middleware stack");
    debug!("Middleware components being initialized:");
    trace!("Loading ErrorHandler middleware");
    trace!("Loading RateLimiter middleware");
    trace!("Loading RequestValidator middleware");
    trace!("Loading ApiVersioning middleware");
}

// Enhanced error tracking with more context and debugging
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
    debug!("Error details: {:?}", error);
    if let Some(source) = error.source() {
        debug!("Error source: {:?}", source);
        trace!("Error source chain: {:?}", get_error_chain(source));
    }
}

// Helper function to get the full error chain
fn get_error_chain(error: &dyn std::error::Error) -> Vec<String> {
    let mut chain = Vec::new();
    let mut current = Some(error);
    while let Some(err) = current {
        chain.push(err.to_string());
        current = err.source();
    }
    chain
}

// Enhanced performance tracking with thresholds and detailed metrics
pub fn track_middleware_timing(middleware_name: &str, start_time: Instant) {
    let duration = start_time.elapsed();
    let duration_ms = duration.as_millis();

    match duration_ms {
        0..=10 => debug!(
            "🟢 Fast - Middleware '{}' execution time: {:?}",
            middleware_name, duration
        ),
        11..=100 => info!(
            "🟡 Normal - Middleware '{}' execution time: {:?}",
            middleware_name, duration
        ),
        _ => warn!(
            "🔴 Slow - Middleware '{}' execution time: {:?}",
            middleware_name, duration
        ),
    }

    // Log detailed timing information
    trace!(
        "Middleware '{}' timing breakdown:\n\
         - Total duration: {:?}\n\
         - Milliseconds: {}\n\
         - Microseconds: {}\n\
         - Nanoseconds: {}",
        middleware_name,
        duration,
        duration_ms,
        duration.as_micros(),
        duration.as_nanos()
    );
}

// Enhanced memory tracking
#[cfg(debug_assertions)]
pub fn track_middleware_memory(middleware_name: &str) {
    use std::mem;
    debug!(
        "Middleware '{}' memory metrics:\n\
         - Approximate size: {} bytes\n\
         - Alignment: {} bytes",
        middleware_name,
        mem::size_of_val(&middleware_name),
        mem::align_of_val(&middleware_name)
    );
}

// Enhanced request/response logging
pub fn log_middleware_request_response(
    middleware_name: &str,
    request_path: &str,
    status_code: Option<u16>,
    duration: std::time::Duration,
    headers: Option<&actix_web::http::header::HeaderMap>,
) {
    info!(
        "[{}] {} {} {:?}",
        middleware_name,
        status_code.map_or("---".to_string(), |c| c.to_string()),
        request_path,
        duration
    );

    // Log headers if available
    if let Some(headers) = headers {
        debug!(
            "Request headers for {}:\n{}",
            request_path,
            headers
                .iter()
                .map(|(k, v)| format!("  {}: {:?}", k, v))
                .collect::<Vec<_>>()
                .join("\n")
        );
    }

    trace!(
        "Request processing details:\n\
         - Middleware: {}\n\
         - Path: {}\n\
         - Status: {:?}\n\
         - Duration: {:?}\n\
         - Timestamp: {}",
        middleware_name,
        request_path,
        status_code,
        duration,
        chrono::Utc::now().to_rfc3339()
    );
}

// Enhanced middleware chain debugging
pub fn debug_middleware_chain(middleware_chain: &[&str]) {
    debug!("Current middleware chain:");
    for (index, middleware) in middleware_chain.iter().enumerate() {
        debug!("{}. {}", index + 1, middleware);
        trace!("Middleware position: {} of {}", index + 1, middleware_chain.len());
    }
}

// Add performance metrics collection
#[derive(Debug, Default)]
pub struct MiddlewareMetrics {
    pub total_requests: usize,
    pub total_errors: usize,
    pub avg_response_time: f64,
    pub max_response_time: u128,
    pub min_response_time: u128,
}

impl MiddlewareMetrics {
    pub fn record_request(&mut self, duration: std::time::Duration) {
        let duration_ms = duration.as_millis();
        self.total_requests += 1;
        self.avg_response_time = (self.avg_response_time * (self.total_requests - 1) as f64 
            + duration_ms as f64) / self.total_requests as f64;
        self.max_response_time = self.max_response_time.max(duration_ms);
        self.min_response_time = self.min_response_time.min(duration_ms);
    }

    pub fn record_error(&mut self) {
        self.total_errors += 1;
    }

    pub fn log_metrics(&self, middleware_name: &str) {
        info!(
            "Middleware '{}' metrics:\n\
             - Total requests: {}\n\
             - Total errors: {}\n\
             - Average response time: {:.2}ms\n\
             - Max response time: {}ms\n\
             - Min response time: {}ms\n\
             - Error rate: {:.2}%",
            middleware_name,
            self.total_requests,
            self.total_errors,
            self.avg_response_time,
            self.max_response_time,
            self.min_response_time,
            (self.total_errors as f64 / self.total_requests as f64) * 100.0
        );
    }
}