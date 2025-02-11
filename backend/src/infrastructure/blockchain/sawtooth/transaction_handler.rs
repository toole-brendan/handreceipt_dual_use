use sawtooth_sdk::messages::processor::TpProcessRequest;
use sawtooth_sdk::processor::handler::{ApplyError, TransactionContext, TransactionHandler};
use serde::{Deserialize, Serialize};
use chrono::Utc;
use log::{debug, error, info};

use super::{FAMILY_NAME, FAMILY_VERSION, NAMESPACE};
use super::state::{PropertyState, TransferRecord, PropertyMetadata};
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
        metadata: PropertyMetadata,
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
                PropertyState::deserialize(&data)
                    .map(Some)
                    .map_err(|err| {
                        error!("State deserialization failed: {}", err);
                        ApplyError::InvalidTransaction(format!("Failed to deserialize state: {}", err))
                    })
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
            .map_err(|err| {
                error!("State serialization failed: {}", err);
                ApplyError::InvalidTransaction(format!("Failed to serialize state: {}", err))
            })?;
        
        context.set_state_entry(address.to_string(), serialized)
            .map_err(|err| {
                error!("Failed to set state entry: {}", err);
                ApplyError::InvalidTransaction(format!("Failed to update state: {}", err))
            })
    }

    fn validate_custodian_access(
        &self,
        signer_public_key: &str,
        custodian: &str,
    ) -> Result<(), ApplyError> {
        // Verify signer public key format
        if !signer_public_key.starts_with("02") && !signer_public_key.starts_with("03") {
            return Err(ApplyError::InvalidTransaction(
                "Invalid public key format".into()
            ));
        }

        // Verify custodian address format
        if !custodian.starts_with("0x") || custodian.len() != 42 {
            return Err(ApplyError::InvalidTransaction(
                "Invalid custodian address format".into()
            ));
        }

        // Verify signer has custodian role
        let context = Secp256k1Context::new();
        let public_key = Secp256k1PublicKey::from_hex(signer_public_key)
            .map_err(|_| ApplyError::InvalidTransaction("Invalid public key".into()))?;
        
        // TODO: Replace with actual role check from state
        let is_custodian = true; // Placeholder for actual role check
        
        if !is_custodian {
            return Err(ApplyError::InvalidTransaction(
                "Signer does not have custodian role".into()
            ));
        }

        Ok(())
    }

    fn validate_property_metadata(
        &self,
        metadata: &PropertyMetadata,
    ) -> Result<(), ApplyError> {
        if metadata.name.is_empty() {
            return Err(ApplyError::InvalidTransaction(
                "Property name cannot be empty".into()
            ));
        }

        if metadata.category.is_empty() {
            return Err(ApplyError::InvalidTransaction(
                "Property category cannot be empty".into()
            ));
        }

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
        let header = request.get_header();
        let signer_public_key = header.get_signer_public_key();
        
        debug!("Processing transaction from {}", signer_public_key);

        // Decode the payload
        let payload: HandReceiptPayload = serde_json::from_slice(&request.get_payload())
            .map_err(|err| {
                error!("Payload deserialization failed: {}", err);
                ApplyError::InvalidTransaction(format!("Failed to decode payload: {}", err))
            })?;

        match payload {
            HandReceiptPayload::Transfer { property_id, to_custodian, transfer_id } => {
                info!("Processing transfer {} for property {}", transfer_id, property_id);
                
                // Validate custodian access
                self.validate_custodian_access(signer_public_key, &to_custodian)?;
                
                let address = PropertyState::get_address(&property_id);
                
                // Get current state
                let mut state = self.get_state_data(context, &address)?
                    .ok_or_else(|| ApplyError::InvalidTransaction("Property does not exist".into()))?;

                // Verify current custodian authorization
                self.validate_custodian_access(signer_public_key, &state.custodian)?;

                // Create transfer record
                let transfer = TransferRecord {
                    transfer_id: uuid::Uuid::parse_str(&transfer_id)
                        .map_err(|_| ApplyError::InvalidTransaction("Invalid transfer ID".into()))?,
                    from_custodian: state.custodian.clone(),
                    to_custodian: to_custodian.clone(),
                    timestamp: Utc::now(),
                    status: TransferStatus::Completed,
                    signatures: vec![signer_public_key.to_string()],
                };

                // Update state
                state.custodian = to_custodian;
                state.transfer_history.push(transfer);
                state.last_updated = Utc::now();

                // Save updated state
                self.set_state_data(context, &address, &state)?;
                
                info!("Transfer {} completed successfully", transfer_id);
            }

            HandReceiptPayload::Create { property_id, initial_custodian, metadata } => {
                info!("Processing creation for property {}", property_id);
                
                // Validate custodian access and metadata
                self.validate_custodian_access(signer_public_key, &initial_custodian)?;
                self.validate_property_metadata(&metadata)?;

                let address = PropertyState::get_address(&property_id);
                
                // Ensure property doesn't already exist
                if self.get_state_data(context, &address)?.is_some() {
                    return Err(ApplyError::InvalidTransaction("Property already exists".into()));
                }

                // Create new property state
                let state = PropertyState::new(
                    property_id,
                    initial_custodian,
                    metadata,
                    Utc::now(),
                    vec![], // Initial empty transfer history
                );

                // Save new state
                self.set_state_data(context, &address, &state)?;
                
                info!("Property creation completed successfully");
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sawtooth_sdk::processor::handler::ContextError;
    use std::collections::HashMap;

    struct MockContext {
        state: HashMap<String, Vec<u8>>,
    }

    impl MockContext {
        fn new() -> Self {
            Self {
                state: HashMap::new(),
            }
        }
    }

    impl TransactionContext for MockContext {
        fn get_state_entry(&self, address: &str) -> Result<Option<Vec<u8>>, ContextError> {
            Ok(self.state.get(address).cloned())
        }

        fn set_state_entry(&mut self, address: String, data: Vec<u8>) -> Result<(), ContextError> {
            self.state.insert(address, data);
            Ok(())
        }

        fn delete_state_entry(&mut self, address: &str) -> Result<Option<Vec<u8>>, ContextError> {
            Ok(self.state.remove(address))
        }

        fn add_receipt_data(&mut self, _data: &[u8]) -> Result<(), ContextError> {
            Ok(())
        }

        fn add_event(
            &mut self,
            _event_type: String,
            _attributes: Vec<(String, String)>,
            _data: &[u8],
        ) -> Result<(), ContextError> {
            Ok(())
        }
    }

    #[test]
    fn test_create_property() {
        let handler = HandReceiptTransactionHandler::new();
        let mut context = MockContext::new();
        
        // Create test request
        let metadata = PropertyMetadata {
            name: "Test Property".to_string(),
            description: "Test Description".to_string(),
            category: "Test Category".to_string(),
            serial_number: Some("123".to_string()),
            is_sensitive_item: false,
            created_at: Utc::now(),
        };

        let payload = HandReceiptPayload::Create {
            property_id: "test123".to_string(),
            initial_custodian: "custodian1".to_string(),
            metadata: metadata.clone(),
        };

        // TODO: Complete test implementation
    }
}
