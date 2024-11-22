use std::fmt;
use std::error::Error;

#[derive(Debug)]
pub enum CoreError {
    ValidationError(String),
    AuthenticationError(String),
    AuthorizationError(String),
    DatabaseError(String),
    NetworkError(String),
    BlockchainError(String),
    SyncError(String),
    EncryptionError(String),
    SignatureError(String),
    QRCodeError(String),
    RFIDError(String),
    NotFoundError(String),
    SystemError(String),
}

impl fmt::Display for CoreError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CoreError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
            CoreError::AuthenticationError(msg) => write!(f, "Authentication error: {}", msg),
            CoreError::AuthorizationError(msg) => write!(f, "Authorization error: {}", msg),
            CoreError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
            CoreError::NetworkError(msg) => write!(f, "Network error: {}", msg),
            CoreError::BlockchainError(msg) => write!(f, "Blockchain error: {}", msg),
            CoreError::SyncError(msg) => write!(f, "Sync error: {}", msg),
            CoreError::EncryptionError(msg) => write!(f, "Encryption error: {}", msg),
            CoreError::SignatureError(msg) => write!(f, "Signature error: {}", msg),
            CoreError::QRCodeError(msg) => write!(f, "QR code error: {}", msg),
            CoreError::RFIDError(msg) => write!(f, "RFID error: {}", msg),
            CoreError::NotFoundError(msg) => write!(f, "Not found: {}", msg),
            CoreError::SystemError(msg) => write!(f, "System error: {}", msg),
        }
    }
}

impl Error for CoreError {} 