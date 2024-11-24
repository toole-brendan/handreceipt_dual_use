use actix_web::{dev::ServiceResponse, body::{MessageBody, BoxBody}};

pub trait ResponseExt {
    fn map_into_boxed(self) -> ServiceResponse<BoxBody>;
}

impl<B: MessageBody + 'static> ResponseExt for ServiceResponse<B> {
    fn map_into_boxed(self) -> ServiceResponse<BoxBody> {
        self.map_into_boxed_body()
    }
}

// Add debug logging utilities
pub mod debug {
    use tracing::{debug, error, warn};
    use std::fmt::Debug;

    pub fn log_request<T: Debug>(prefix: &str, request: &T) {
        debug!("{} - Request: {:?}", prefix, request);
    }

    pub fn log_error<E: Debug>(prefix: &str, error: &E) {
        error!("{} - Error: {:?}", prefix, error);
    }

    pub fn log_warning(prefix: &str, message: &str) {
        warn!("{} - Warning: {}", prefix, message);
    }
} 