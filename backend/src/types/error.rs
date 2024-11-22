use std::error::Error as StdError;
use std::fmt;
use std::io;

#[derive(Debug)]
pub enum CoreError {
    Database(String),
    Validation(String),
    Security(String),
    Network(String),
    Configuration(String),
    IO(io::Error),
    Other(Box<dyn StdError + Send + Sync>),
}

impl fmt::Display for CoreError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CoreError::Database(msg) => write!(f, "Database error: {}", msg),
            CoreError::Validation(msg) => write!(f, "Validation error: {}", msg),
            CoreError::Security(msg) => write!(f, "Security error: {}", msg),
            CoreError::Network(msg) => write!(f, "Network error: {}", msg),
            CoreError::Configuration(msg) => write!(f, "Configuration error: {}", msg),
            CoreError::IO(err) => write!(f, "IO error: {}", err),
            CoreError::Other(err) => write!(f, "Error: {}", err),
        }
    }
}

impl StdError for CoreError {
    fn source(&self) -> Option<&(dyn StdError + 'static)> {
        match self {
            CoreError::IO(err) => Some(err),
            CoreError::Other(err) => err.source(),
            _ => None,
        }
    }
}

impl From<io::Error> for CoreError {
    fn from(err: io::Error) -> Self {
        CoreError::IO(err)
    }
}

impl From<tokio_postgres::Error> for CoreError {
    fn from(err: tokio_postgres::Error) -> Self {
        CoreError::Database(err.to_string())
    }
}

impl From<deadpool_postgres::PoolError> for CoreError {
    fn from(err: deadpool_postgres::PoolError) -> Self {
        CoreError::Database(err.to_string())
    }
}

// Network-related errors
#[derive(Debug)]
pub enum NetworkError {
    Connection(String),
    Protocol(String),
    Timeout(String),
    Other(Box<dyn StdError + Send + Sync>),
}

impl fmt::Display for NetworkError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            NetworkError::Connection(msg) => write!(f, "Connection error: {}", msg),
            NetworkError::Protocol(msg) => write!(f, "Protocol error: {}", msg),
            NetworkError::Timeout(msg) => write!(f, "Timeout error: {}", msg),
            NetworkError::Other(err) => write!(f, "Network error: {}", err),
        }
    }
}

impl StdError for NetworkError {
    fn source(&self) -> Option<&(dyn StdError + 'static)> {
        match self {
            NetworkError::Other(err) => err.source(),
            _ => None,
        }
    }
}

impl From<NetworkError> for CoreError {
    fn from(err: NetworkError) -> Self {
        CoreError::Network(err.to_string())
    }
}

// Mesh-related errors
#[derive(Debug)]
pub enum MeshError {
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
