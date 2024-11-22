// backend/src/blockchain/transaction/mod.rs

pub mod processing;
pub mod verification;

pub use processing::{
    Transaction,
    TransactionProcessor,
    TransactionStatus,
    TransferType,
    Approval,
    ApprovalType,
    ProcessingError,
};

pub use verification::{
    TransactionVerifier,
    PropertyVerifier,
    TransactionError,
};
