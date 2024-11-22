use std::fmt;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum MeshError {
    #[error("Discovery error: {0}")]
    Discovery(String),
    
    #[error("Authentication error: {0}")]
    Authentication(String),
    
    #[error("Sync error: {0}")]
    Sync(String),
    
    #[error("Storage error: {0}")]
    Storage(String),
    
    #[error("Network error: {0}")]
    Network(String),
} 