pub mod request;
pub mod validation;

// Re-export commonly used types
pub use self::request::{
    TransferRequest,
    TransferRequestManager,
    TransferStatus,
    TransferError,
};

pub use self::validation::{
    Transfer,
    TransferValidator,
};

// Convenience function to create a new transfer request manager
pub fn create_transfer_manager(db: crate::infrastructure::database::DatabaseService) -> TransferRequestManager {
    TransferRequestManager::new(db)
}
