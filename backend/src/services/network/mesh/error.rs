use std::error::Error as StdError;
use std::fmt;

use crate::types::error::{NetworkError, CoreError};

#[derive(Debug)]
pub(crate) enum MeshError {
    Discovery(String),
    Sync(String),
    Peer(String),
    Network(NetworkError),
    Other(Box<dyn StdError + Send + Sync>),
}

impl fmt::Display for MeshError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            MeshError::Discovery(msg) => write!(f, "Discovery error: {}", msg),
            MeshError::Sync(msg) => write!(f, "Sync error: {}", msg),
            MeshError::Peer(msg) => write!(f, "Peer error: {}", msg),
            MeshError::Network(err) => write!(f, "Network error: {}", err),
            MeshError::Other(err) => write!(f, "Mesh error: {}", err),
        }
    }
}

impl StdError for MeshError {
    fn source(&self) -> Option<&(dyn StdError + 'static)> {
        match self {
            MeshError::Network(err) => Some(err),
            MeshError::Other(err) => err.source(),
            _ => None,
        }
    }
}

impl From<MeshError> for CoreError {
    fn from(err: MeshError) -> Self {
        CoreError::Network(err.to_string())
    }
}

impl From<NetworkError> for MeshError {
    fn from(err: NetworkError) -> Self {
        MeshError::Network(err)
    }
}
