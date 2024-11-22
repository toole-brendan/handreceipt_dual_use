pub mod scanning;
pub mod tracking;
pub mod transfer;
pub mod location;

// Re-export commonly used types and implementations
pub use self::scanning::{
    Scanner,
    ScanResult,
    ScanError,
    ScanType,
    BarcodeScanner,
    NFCCommunicator,
    QRGenerator,
    RFIDWriter,
};

pub use self::location::{
    LocationService,
    GeoLocation,
    LocationError,
};

// Re-export tracking and transfer when implemented
pub use self::tracking::LocationTracker;
pub use self::transfer::{TransferRequest, RequestManager};