use serde::{Deserialize, Serialize};
use crate::infrastructure::blockchain::sawtooth::state::PropertyMetadata;

#[derive(Debug, Serialize, Deserialize)]
pub enum HandReceiptPayload {
    Create {
        property_id: String,
        initial_custodian: String,
        metadata: PropertyMetadata,
    },
    Transfer {
        property_id: String,
        to_custodian: String,
        transfer_id: String,
    },
    Update {
        property_id: String,
        metadata: PropertyMetadata,
    },
    Delete {
        property_id: String,
    },
} 