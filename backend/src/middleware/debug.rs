use log::{debug, error, info, trace, warn};
use std::time::Instant;

pub struct MiddlewareDebug {
    start_time: Instant,
    name: String,
}

impl MiddlewareDebug {
    pub fn new(name: &str) -> Self {
        debug!("Starting middleware: {}", name);
        Self {
            start_time: Instant::now(),
            name: name.to_string(),
        }
    }

    pub fn log_request(&self, path: &str) {
        debug!("[{}] Processing request: {}", self.name, path);
    }

    pub fn log_response(&self, status: u16) {
        let duration = self.start_time.elapsed();
        info!(
            "[{}] Response status: {}, duration: {:?}",
            self.name, status, duration
        );
    }

    pub fn log_error(&self, error: &dyn std::error::Error) {
        error!(
            "[{}] Error occurred: {}\n{:?}",
            self.name,
            error,
            error.source()
        );
    }
} 