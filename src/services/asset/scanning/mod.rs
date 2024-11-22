pub mod barcode;
pub mod common;
pub mod nfc;
pub mod qr;
pub mod rfid;

// Re-export commonly used items
pub use self::common::{
    Scanner, 
    ScanResult, 
    ScanError, 
    ScanType,
    GeoLocation,
    signature::SignatureManager,
    verification::VerificationManager
};

// Re-export scanner implementations
pub use self::barcode::{BarcodeScanner, BarcodeValidator};
pub use self::nfc::{NFCCommunicator, NFCValidator};
pub use self::qr::QRGenerator;
pub use self::rfid::RFIDWriter; 