// Re-export error types from the types module
pub use crate::types::error::{MeshError, NetworkError};

// No need to redefine error types here since they're now in types/error.rs
// Just re-export them for backward compatibility
