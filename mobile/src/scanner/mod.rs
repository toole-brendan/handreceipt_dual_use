pub mod qr;

// Re-export QR scanner
pub use qr::QRScanner;

/// Common scanner trait for QR code scanning
#[async_trait::async_trait]
pub trait Scanner {
    /// Initializes the scanner
    async fn initialize(&mut self) -> crate::Result<()>;
    
    /// Starts the scanning process
    async fn start(&self) -> crate::Result<()>;
    
    /// Stops the scanning process
    async fn stop(&self) -> crate::Result<()>;
    
    /// Processes a scanned QR code
    async fn process_scan(&self, qr_data: String) -> crate::Result<()>;
}
