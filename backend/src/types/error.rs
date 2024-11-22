use std::fmt;
use thiserror::Error;

/// Core error types for the application
#[derive(Error, Debug)]
pub enum CoreError {
    #[error("Database error: {0}")]
    Database(String),

    #[error("Security violation: {0}")]
    SecurityViolation(String),

    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Authentication error: {0}")]
    AuthenticationError(String),

    #[error("Authorization error: {0}")]
    AuthorizationError(String),

    #[error("Network error: {0}")]
    NetworkError(String),

    #[error("Blockchain error: {0}")]
    BlockchainError(String),

    #[error("Sync error: {0}")]
    SyncError(String),

    #[error("Encryption error: {0}")]
    EncryptionError(String),

    #[error("Signature error: {0}")]
    SignatureError(String),

    #[error("QR code error: {0}")]
    QRCodeError(String),

    #[error("RFID error: {0}")]
    RFIDError(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("System error: {0}")]
    SystemError(String),

    #[error("Resource not found: {0}")]
    ResourceNotFound(String),

    #[error("Internal error: {0}")]
    InternalError(String),

    #[error("Location error: {0}")]
    LocationError(String),

    #[error("Geofence violation: {0}")]
    GeofenceViolation(String),

    #[error("Location classification error: {0}")]
    LocationClassificationError(String),

    #[error("Chain of custody error: {0}")]
    ChainOfCustodyError(String),

    #[error("Timestamp error: {0}")]
    TimestampError(String),

    #[error("Scanning error: {0}")]
    ScanningError(String),

    #[error("Mesh network error: {0}")]
    MeshNetworkError(String),

    #[error("Mobile sync error: {0}")]
    MobileSyncError(String),
}

/// Network-specific errors
#[derive(Error, Debug)]
pub enum NetworkError {
    #[error("Connection failed: {0}")]
    ConnectionFailed(String),

    #[error("Peer error: {0}")]
    PeerError(String),

    #[error("Protocol error: {0}")]
    ProtocolError(String),

    #[error("Sync failed: {0}")]
    SyncFailed(String),

    #[error("Timeout: {0}")]
    Timeout(String),

    #[error("Mesh error: {0}")]
    MeshError(String),

    #[error("Mobile sync error: {0}")]
    MobileSyncError(String),
}

/// Protocol-specific errors
#[derive(Error, Debug)]
pub enum ProtocolError {
    #[error("Invalid message format: {0}")]
    InvalidFormat(String),

    #[error("Unsupported message type: {0}")]
    UnsupportedType(String),

    #[error("Invalid state transition: {0}")]
    InvalidState(String),

    #[error("Message handling failed: {0}")]
    HandlingFailed(String),

    #[error("Protocol version mismatch: {0}")]
    VersionMismatch(String),

    #[error("Message validation failed: {0}")]
    ValidationFailed(String),

    #[error("Network error: {0}")]
    NetworkError(String),
}

/// Mesh network-specific errors
#[derive(Error, Debug)]
pub enum MeshError {
    #[error("System error: {0}")]
    SystemError(String),
    
    #[error("Sync error: {0}")]
    SyncError(String),
    
    #[error("Data not found: {0}")]
    DataNotFound(String),
    
    #[error("Authentication failed for peer {peer_id}: {reason}")]
    AuthenticationFailed { peer_id: String, reason: String },
    
    #[error("Sync failed for peer {peer_id}: {reason}")]
    SyncFailed { peer_id: String, reason: String },
    
    #[error("Peer not found: {0}")]
    PeerNotFound(String),
    
    #[error("Conflict resolution failed for resource {resource_id}: {reason}")]
    ConflictResolutionFailed { resource_id: String, reason: String },
}

/// Security-specific errors
#[derive(Error, Debug)]
pub enum SecurityError {
    #[error("Invalid token: {0}")]
    InvalidToken(String),

    #[error("Token expired: {0}")]
    TokenExpired(String),

    #[error("Invalid credentials: {0}")]
    InvalidCredentials(String),

    #[error("Access denied: {0}")]
    AccessDenied(String),

    #[error("Encryption error: {0}")]
    EncryptionError(String),

    #[error("HSM error: {0}")]
    HsmError(String),

    #[error("Geofence violation: {0}")]
    GeofenceViolation(String),

    #[error("Classification error: {0}")]
    ClassificationError(String),

    #[error("Chain of custody error: {0}")]
    ChainOfCustodyError(String),
}

/// Asset-specific errors
#[derive(Error, Debug)]
pub enum AssetError {
    #[error("Invalid status transition: {0}")]
    InvalidStatusTransition(String),

    #[error("Transfer error: {0}")]
    TransferError(String),

    #[error("Verification failed: {0}")]
    VerificationFailed(String),

    #[error("Invalid location: {0}")]
    InvalidLocation(String),

    #[error("Scanning error: {0}")]
    ScanningError(String),

    #[error("QR code error: {0}")]
    QRCodeError(String),

    #[error("RFID error: {0}")]
    RFIDError(String),
}

/// Database-specific errors
#[derive(Error, Debug)]
pub enum DatabaseError {
    #[error("Connection error: {0}")]
    ConnectionError(String),

    #[error("Query error: {0}")]
    QueryError(String),

    #[error("Transaction error: {0}")]
    TransactionError(String),

    #[error("Migration error: {0}")]
    MigrationError(String),

    #[error("Replication error: {0}")]
    ReplicationError(String),
}

// Implement conversions between error types
impl From<NetworkError> for CoreError {
    fn from(err: NetworkError) -> Self {
        CoreError::NetworkError(err.to_string())
    }
}

impl From<SecurityError> for CoreError {
    fn from(err: SecurityError) -> Self {
        CoreError::SecurityViolation(err.to_string())
    }
}

impl From<AssetError> for CoreError {
    fn from(err: AssetError) -> Self {
        match err {
            AssetError::ScanningError(msg) => CoreError::ScanningError(msg),
            AssetError::QRCodeError(msg) => CoreError::QRCodeError(msg),
            AssetError::RFIDError(msg) => CoreError::RFIDError(msg),
            _ => CoreError::InternalError(err.to_string()),
        }
    }
}

impl From<DatabaseError> for CoreError {
    fn from(err: DatabaseError) -> Self {
        CoreError::Database(err.to_string())
    }
}

impl From<MeshError> for CoreError {
    fn from(err: MeshError) -> Self {
        CoreError::MeshNetworkError(err.to_string())
    }
}

impl From<NetworkError> for MeshError {
    fn from(err: NetworkError) -> Self {
        match err {
            NetworkError::ConnectionFailed(msg) => MeshError::SystemError(msg),
            NetworkError::ProtocolError(msg) => MeshError::SyncError(msg),
            _ => MeshError::SystemError(err.to_string()),
        }
    }
}

impl From<ProtocolError> for NetworkError {
    fn from(err: ProtocolError) -> Self {
        NetworkError::ProtocolError(err.to_string())
    }
}

impl From<ProtocolError> for CoreError {
    fn from(err: ProtocolError) -> Self {
        CoreError::NetworkError(err.to_string())
    }
}
