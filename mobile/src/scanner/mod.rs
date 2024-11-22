pub mod qr;
pub mod rfid;

// Re-exports
pub use qr::QRScanner;
pub use rfid::{RFIDScanner, RFIDData, RFIDTagType, SecurityLevel};

// Common scanner traits
pub trait Scanner {
    async fn initialize(&mut self) -> crate::Result<()>;
    async fn start(&self) -> crate::Result<()>;
    async fn stop(&self) -> crate::Result<()>;
}
