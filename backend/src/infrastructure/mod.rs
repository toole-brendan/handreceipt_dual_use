pub mod blockchain;
pub mod persistence;

use crate::{
    domain::{
        property::repository::PropertyRepository,
        transfer::repository::TransferRepository,
    },
};

// Re-export repository implementations
pub use persistence::postgres::{
    property_repository::PgPropertyRepository,
    transfer_repository::PgTransferRepository,
};

// Re-export blockchain verification
pub use blockchain::verification::TransferVerification;
