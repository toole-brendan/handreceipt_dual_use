use sawtooth_sdk::messages::processor::TpProcessRequest;
use sawtooth_sdk::processor::handler::{ApplyError, ContextError, TransactionContext, TransactionHandler};
use serde::{Deserialize, Serialize};
use sha2::{Sha512, Digest};
use crate::error::Error;

const FAMILY_NAME: &str = "handreceipt";
const FAMILY_VERSION: &str = "1.0";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyState {
    pub owner_public_key: String,
    pub last_updated: u64,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferPayload {
    pub property_id: String,
    pub new_owner: String,
    pub timestamp: u64,
    pub metadata: Option<serde_json::Value>,
}

pub struct TransactionProcessor {
    handler: HandReceiptTransactionHandler,
}

impl TransactionProcessor {
    pub fn new() -> Self {
        Self {
            handler: HandReceiptTransactionHandler::new(),
        }
    }

    pub fn verify_transfer(&self, transfer_data: &str) -> crate::Result<bool> {
        // Client-side verification logic
        let payload: TransferPayload = serde_json::from_str(transfer_data)?;
        
        // Basic validation
        if payload.property_id.is_empty() || payload.new_owner.is_empty() {
            return Ok(false);
        }

        // Timestamp validation - ensure it's not in the future
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| Error::System(e.to_string()))?
            .as_secs();
            
        if payload.timestamp > current_time {
            return Ok(false);
        }

        Ok(true)
    }
}

pub struct HandReceiptTransactionHandler {
    family_name: String,
    version: String,
    namespaces: Vec<String>,
}

impl HandReceiptTransactionHandler {
    pub fn new() -> Self {
        let namespace = Self::compute_namespace(FAMILY_NAME);
        Self {
            family_name: String::from(FAMILY_NAME),
            version: String::from(FAMILY_VERSION),
            namespaces: vec![namespace],
        }
    }

    fn compute_namespace(family_name: &str) -> String {
        let mut hasher = Sha512::new();
        hasher.update(family_name.as_bytes());
        hex::encode(&hasher.finalize())[..6].to_string()
    }

    fn get_property_address(&self, property_id: &str) -> String {
        let mut hasher = Sha512::new();
        hasher.update(property_id.as_bytes());
        let hash = hex::encode(hasher.finalize());
        let address = format!("{}{}", 
            self.namespaces[0],
            &hash[..64]
        );
        address
    }

    fn verify_transfer(
        &self,
        payload: &TransferPayload,
        context: &dyn TransactionContext,
        signer_public_key: &str,
    ) -> Result<(), ApplyError> {
        let address = self.get_property_address(&payload.property_id);
        let state_data = context
            .get_state_entry(&address)?
            .ok_or_else(|| ApplyError::InvalidTransaction("Property not found".into()))?;

        let current_state: PropertyState = serde_json::from_slice(&state_data)
            .map_err(|err| ApplyError::InvalidTransaction(format!("Invalid state data: {}", err)))?;

        // Verify the signer is the current owner
        if signer_public_key != current_state.owner_public_key {
            return Err(ApplyError::InvalidTransaction("Signer is not the current owner".into()));
        }

        // Verify timestamp is newer than last update
        if payload.timestamp <= current_state.last_updated {
            return Err(ApplyError::InvalidTransaction("Invalid timestamp - must be newer than last update".into()));
        }

        Ok(())
    }

    fn apply_transfer(
        &self,
        payload: &TransferPayload,
        context: &mut dyn TransactionContext,
    ) -> Result<(), ApplyError> {
        let address = self.get_property_address(&payload.property_id);
        
        let new_state = PropertyState {
            owner_public_key: payload.new_owner.clone(),
            last_updated: payload.timestamp,
            metadata: payload.metadata.clone(),
        };

        let state_data = serde_json::to_vec(&new_state)
            .map_err(|err| ApplyError::InvalidTransaction(format!("Failed to serialize state: {}", err)))?;

        context.set_state_entry(address, state_data)?;
        Ok(())
    }
}

impl TransactionHandler for HandReceiptTransactionHandler {
    fn family_name(&self) -> String {
        self.family_name.clone()
    }

    fn family_versions(&self) -> Vec<String> {
        vec![self.version.clone()]
    }

    fn namespaces(&self) -> Vec<String> {
        self.namespaces.clone()
    }

    fn apply(
        &self,
        request: &TpProcessRequest,
        context: &mut dyn TransactionContext,
    ) -> Result<(), ApplyError> {
        let payload: TransferPayload = serde_json::from_slice(request.get_payload())
            .map_err(|err| ApplyError::InvalidTransaction(format!("Invalid payload: {}", err)))?;

        let signer_public_key = request.get_header().get_signer_public_key();
        
        // Verify the transfer with signature check
        self.verify_transfer(&payload, context, signer_public_key)?;
        self.apply_transfer(&payload, context)?;

        Ok(())
    }
}

// Error conversions
impl From<ApplyError> for Error {
    fn from(e: ApplyError) -> Self {
        Error::System(e.to_string())
    }
}

impl From<ContextError> for Error {
    fn from(e: ContextError) -> Self {
        Error::System(e.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use std::sync::Mutex;
    use sawtooth_sdk::messages::transaction::TransactionHeader;

    struct MockContext {
        state: Mutex<HashMap<String, Vec<u8>>>,
    }

    impl MockContext {
        fn new() -> Self {
            Self {
                state: Mutex::new(HashMap::new()),
            }
        }
    }

    impl TransactionContext for MockContext {
        fn get_state_entry(&self, address: &str) -> Result<Option<Vec<u8>>, ContextError> {
            Ok(self.state.lock().unwrap().get(address).cloned())
        }

        fn get_state_entries(&self, addresses: &[String]) -> Result<Vec<(String, Vec<u8>)>, ContextError> {
            let state = self.state.lock().unwrap();
            Ok(addresses
                .iter()
                .filter_map(|addr| {
                    state.get(addr)
                        .map(|data| (addr.clone(), data.clone()))
                })
                .collect())
        }

        fn set_state_entry(&self, address: String, data: Vec<u8>) -> Result<(), ContextError> {
            self.state.lock().unwrap().insert(address, data);
            Ok(())
        }

        fn set_state_entries(&self, entries: Vec<(String, Vec<u8>)>) -> Result<(), ContextError> {
            let mut state = self.state.lock().unwrap();
            for (addr, data) in entries {
                state.insert(addr, data);
            }
            Ok(())
        }

        fn delete_state_entry(&self, address: &str) -> Result<Option<String>, ContextError> {
            Ok(self.state.lock().unwrap().remove(address).map(|_| address.to_string()))
        }

        fn delete_state_entries(&self, addresses: &[String]) -> Result<Vec<String>, ContextError> {
            let mut state = self.state.lock().unwrap();
            let mut deleted = Vec::new();
            for addr in addresses {
                if state.remove(addr).is_some() {
                    deleted.push(addr.clone());
                }
            }
            Ok(deleted)
        }

        fn add_receipt_data(&self, _data: &[u8]) -> Result<(), ContextError> {
            Ok(())
        }

        fn add_event(
            &self,
            _event_type: String,
            _attributes: Vec<(String, String)>,
            _data: &[u8],
        ) -> Result<(), ContextError> {
            Ok(())
        }
    }

    #[test]
    fn test_transfer_processing() -> Result<(), Error> {
        let handler = HandReceiptTransactionHandler::new();
        let mut context = MockContext::new();

        // Test data
        let property_id = "test123";
        let owner1_pubkey = "owner1_pubkey";
        let owner2_pubkey = "owner2_pubkey";
        let timestamp = 12345;

        // Set up initial state
        let address = handler.get_property_address(property_id);
        let initial_state = PropertyState {
            owner_public_key: owner1_pubkey.to_string(),
            last_updated: timestamp - 100,
            metadata: None,
        };
        
        context
            .set_state_entry(
                address.clone(),
                serde_json::to_vec(&initial_state).unwrap(),
            )
            .unwrap();

        // Create transfer payload
        let payload = TransferPayload {
            property_id: property_id.to_string(),
            new_owner: owner2_pubkey.to_string(),
            timestamp,
            metadata: None,
        };

        // Create a valid TpProcessRequest with header
        let mut request = TpProcessRequest::new();
        let mut header = TransactionHeader::new();
        header.set_signer_public_key(owner1_pubkey.to_string());
        request.set_header(header);
        request.set_payload(serde_json::to_vec(&payload).unwrap());

        // Process transfer
        handler.apply(&request, &mut context)?;

        // Verify new state
        let new_state_bytes = context
            .get_state_entry(&address)?
            .ok_or(Error::PropertyNotFound)?;
            
        let new_state: PropertyState = serde_json::from_slice(&new_state_bytes)
            .map_err(|_| Error::System("Failed to deserialize state".to_string()))?;

        assert_eq!(new_state.owner_public_key, owner2_pubkey);
        assert_eq!(new_state.last_updated, timestamp);
        Ok(())
    }

    #[test]
    fn test_unauthorized_transfer() -> Result<(), Error> {
        let handler = HandReceiptTransactionHandler::new();
        let mut context = MockContext::new();

        // Set up initial state with owner1
        let property_id = "test123";
        let owner1_pubkey = "owner1_pubkey";
        let unauthorized_pubkey = "unauthorized_pubkey";
        
        let initial_state = PropertyState {
            owner_public_key: owner1_pubkey.to_string(),
            last_updated: 12345,
            metadata: None,
        };

        let address = handler.get_property_address(property_id);
        context
            .set_state_entry(
                address.clone(),
                serde_json::to_vec(&initial_state).unwrap(),
            )
            .unwrap();

        // Create transfer payload with unauthorized signer
        let payload = TransferPayload {
            property_id: property_id.to_string(),
            new_owner: "new_owner".to_string(),
            timestamp: 12346,
            metadata: None,
        };

        let mut request = TpProcessRequest::new();
        let mut header = TransactionHeader::new();
        header.set_signer_public_key(unauthorized_pubkey.to_string());
        request.set_header(header);
        request.set_payload(serde_json::to_vec(&payload).unwrap());

        // Attempt transfer - should fail
        let result = handler.apply(&request, &mut context);
        assert!(result.is_err());
        
        if let Err(ApplyError::InvalidTransaction(msg)) = result {
            assert!(msg.contains("Signer is not the current owner"));
        } else {
            panic!("Expected InvalidTransaction error");
        }

        Ok(())
    }
} 