pub mod client;
pub mod handler;
pub mod service;
pub mod state;
pub mod transaction;
pub mod verification;

use protobuf::Message;
use sawtooth_sdk::messages::transaction::Transaction;
use sawtooth_sdk::processor::handler::ApplyError;
use sawtooth_sdk::processor::handler::TransactionContext;
use sawtooth_sdk::processor::handler::TransactionHandler;

pub const FAMILY_NAME: &str = "handreceipt";
pub const FAMILY_VERSION: &str = "1.0";
pub const NAMESPACE: &str = "handreceipt";

// Re-export main components
pub use client::SawtoothClient;
pub use handler::HandReceiptTransactionHandler;
pub use service::SawtoothService;
pub use state::PropertyState;
pub use transaction::HandReceiptPayload;
pub use verification::SawtoothVerification; 