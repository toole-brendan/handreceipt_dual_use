use sawtooth_sdk::messages::processor::TpProcessRequest;
use sawtooth_sdk::processor::handler::{ApplyError, TransactionContext, TransactionHandler};
use serde::{Deserialize, Serialize};
use chrono::Utc;

use super::{FAMILY_NAME, FAMILY_VERSION, NAMESPACE};
use super::state::{PropertyState, TransferRecord};
use crate::domain::models::transfer::TransferStatus;

#[derive(Debug, Serialize, Deserialize)]
pub enum HandReceiptPayload {
    Transfer {
        property_id: String,
        to_custodian: String,
        transfer_id: String,
    },
    Create {
        property_id: String,
        initial_custodian: String,
        metadata: super::state::PropertyMetadata,
    },
}

pub struct HandReceiptTransactionHandler {
    family_name: String,
    family_versions: Vec<String>,
    namespaces: Vec<String>,
}

impl HandReceiptTransactionHandler {
    pub fn new() -> Self {
        Self {
            family_name: FAMILY_NAME.to_string(),
            family_versions: vec![FAMILY_VERSION.to_string()],
            namespaces: vec![NAMESPACE.to_string()],
        }
    }

    fn get_state_data(
        &self,
        context: &mut dyn TransactionContext,
        address: &str,
    ) -> Result<Option<PropertyState>, ApplyError> {
        let state_data = context.get_state_entry(address)?;
        
        match state_data {
            Some(data) => {
                let state = PropertyState::deserialize(&data)
                    .map_err(|err| ApplyError::InvalidTransaction(format!("Failed to deserialize state: {}", err)))?;
                Ok(Some(state))
            }
            None => Ok(None),
        }
    }

    fn set_state_data(
        &self,
        context: &mut dyn TransactionContext,
        address: &str,
        state: &PropertyState,
    ) -> Result<(), ApplyError> {
        let serialized = state.serialize()
            .map_err(|err| ApplyError::InvalidTransaction(format!("Failed to serialize state: {}", err)))?;
        
        context.set_state_entry(address.to_string(), serialized)?;
        Ok(())
    }
}

impl TransactionHandler for HandReceiptTransactionHandler {
    fn family_name(&self) -> String {
        self.family_name.clone()
    }

    fn family_versions(&self) -> Vec<String> {
        self.family_versions.clone()
    }

    fn namespaces(&self) -> Vec<String> {
        self.namespaces.clone()
    }

    fn apply(
        &self,
        request: &TpProcessRequest,
        context: &mut dyn TransactionContext,
    ) -> Result<(), ApplyError> {
        // Decode the payload
        let payload: HandReceiptPayload = serde_json::from_slice(&request.get_payload())
            .map_err(|err| ApplyError::InvalidTransaction(format!("Failed to decode payload: {}", err)))?;

        match payload {
            HandReceiptPayload::Transfer { property_id, to_custodian, transfer_id } => {
                let address = PropertyState::get_address(&property_id);
                
                // Get current state
                let mut state = self.get_state_data(context, &address)?
                    .ok_or_else(|| ApplyError::InvalidTransaction("Property does not exist".into()))?;

                // Create transfer record
                let transfer = TransferRecord {
                    transfer_id: uuid::Uuid::parse_str(&transfer_id)
                        .map_err(|_| ApplyError::InvalidTransaction("Invalid transfer ID".into()))?,
                    from_custodian: state.current_custodian.clone(),
                    to_custodian: to_custodian.clone(),
                    timestamp: Utc::now(),
                    status: TransferStatus::Completed,
                    signatures: vec![], // Signatures are handled at a different layer
                };

                // Update state
                state.current_custodian = to_custodian;
                state.transfer_history.push(transfer);
                state.last_updated = Utc::now();

                // Save updated state
                self.set_state_data(context, &address, &state)?;
            }

            HandReceiptPayload::Create { property_id, initial_custodian, metadata } => {
                let address = PropertyState::get_address(&property_id);
                
                // Ensure property doesn't already exist
                if self.get_state_data(context, &address)?.is_some() {
                    return Err(ApplyError::InvalidTransaction("Property already exists".into()));
                }

                // Create new property state
                let state = PropertyState {
                    property_id,
                    current_custodian: initial_custodian,
                    transfer_history: Vec::new(),
                    metadata,
                    last_updated: Utc::now(),
                };

                // Save new state
                self.set_state_data(context, &address, &state)?;
            }
        }

        Ok(())
    }
} 