pub mod common;
pub mod barcode;
pub mod nfc;
pub mod qr;
pub mod rfid;

// Re-export common types
pub use self::common::{
    Scanner,
    ScanResult,
    ScanError,
    ScanType,
    ScanVerifier,
    GeoPoint,
};

// Re-export scanner implementations
pub use self::barcode::{
    scanner::BarcodeScanner,
    validator::BarcodeValidator,
};

pub use self::nfc::{
    communicator::NFCCommunicator,
    validator::NFCValidator,
};

use std::sync::Arc;
use crate::infrastructure::database::DatabaseService;
use crate::core::security::SecurityModule;
