use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Scanner error: {0}")]
    Scanner(String),

    #[error("Storage error: {0}")]
    Storage(String),

    #[error("Security error: {0}")]
    Security(String),

    #[error("Sync error: {0}")]
    Sync(String),

    #[error("Invalid QR code: {0}")]
    InvalidQR(String),

    #[error("Network error: {0}")]
    Network(String),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Serialization error: {0}")]
    Serialization(String),

    #[error("System error: {0}")]
    System(String),

    #[error("Transaction not found")]
    TransactionNotFound,

    #[error("Invalid signature")]
    InvalidSignature,

    #[error("Invalid state")]
    InvalidState,

    #[error("Property not found")]
    PropertyNotFound,

    #[error("Unauthorized transfer")]
    UnauthorizedTransfer,

    #[error("Payload decode error: {0}")]
    PayloadDecode(String),

    #[error("UTF-8 error: {0}")]
    Utf8Error(#[from] std::string::FromUtf8Error),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Signing error: {0}")]
    SigningError(#[from] sawtooth_sdk::signing::Error),

    #[error("Invalid hex format: {0}")]
    InvalidHexFormat(String),
    
    #[error("Invalid proof: {0}")]
    InvalidProof(String),
    
    #[error("Reqwest error: {0}")]
    Reqwest(#[from] reqwest::Error),

    #[error("Hex conversion error: {0}")]
    HexError(#[from] hex::FromHexError),

    #[error("Merkle proof validation failed")]
    MerkleValidationFailed,
    
    #[error("Invalid transaction format")]
    InvalidTransactionFormat,

    #[error("Batch construction error: {0}")]
    BatchError(String),
    
    #[error("State retrieval error: {0}")]
    StateError(String),
    
    #[error("Transaction submission error: {0}")]
    SubmissionError(String),
    
    #[error("Invalid ownership transfer")]
    InvalidOwnership,
}

impl Error {
    pub fn error_code(&self) -> i32 {
        match self {
            Error::Scanner(_) => 1000,
            Error::Storage(_) => 2000,
            Error::Security(_) => 3000,
            Error::Sync(_) => 4000,
            Error::InvalidQR(_) => 5000,
            Error::Network(_) => 7000,
            Error::Database(_) => 8000,
            Error::Serialization(_) => 9000,
            Error::System(_) => 10000,
            Error::TransactionNotFound => 11000,
            Error::InvalidSignature => 12000,
            Error::InvalidState => 13000,
            Error::PropertyNotFound => 14000,
            Error::UnauthorizedTransfer => 15000,
            Error::PayloadDecode(_) => 16000,
            Error::Utf8Error(_) => 17000,
            Error::IoError(_) => 18000,
            Error::SigningError(_) => 19000,
            Error::InvalidHexFormat(_) => 20000,
            Error::InvalidProof(_) => 21000,
            Error::Reqwest(_) => 22000,
            Error::HexError(_) => 23000,
            Error::MerkleValidationFailed => 24000,
            Error::InvalidTransactionFormat => 25000,
            Error::BatchError(_) => 26000,
            Error::StateError(_) => 27000,
            Error::SubmissionError(_) => 28000,
            Error::InvalidOwnership => 29000,
        }
    }
}

impl From<serde_json::Error> for Error {
    fn from(err: serde_json::Error) -> Self {
        Error::Serialization(err.to_string())
    }
}

impl From<std::sync::PoisonError<std::sync::MutexGuard<'_, Vec<crate::scanner::ScanResult>>>> for Error {
    fn from(e: std::sync::PoisonError<std::sync::MutexGuard<'_, Vec<crate::scanner::ScanResult>>>) -> Self {
        Error::Sync(format!("Mutex poison error: {}", e))
    }
} 