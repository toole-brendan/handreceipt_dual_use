pub mod request;
pub mod validation;

pub use self::request::{TransferRequest, TransferStatus, RequestManager};
pub use self::validation::{ValidationResult, ValidationCheck, TransferValidator};

#[derive(Debug, thiserror::Error)]
pub enum TransferError {
    #[error("Request error: {0}")]
    Request(String),
    
    #[error("Validation error: {0}")]
    Validation(String),
} 