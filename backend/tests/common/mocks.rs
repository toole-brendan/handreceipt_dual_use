use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use async_trait::async_trait;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use handreceipt::{
    domain::{
        property::{Property, PropertyService, PropertySearchCriteria},
        transfer::{Transfer, TransferService, TransferStatus},
        models::qr::{QRCodeService, QRFormat, QRResponse, QRData, VerifyQRRequest},
    },
    error::CoreError,
    types::security::SecurityContext,
};

/// Mock property service for testing
pub struct MockPropertyService {
    properties: Arc<Mutex<HashMap<Uuid, Property>>>,
}

impl MockPropertyService {
    pub fn new() -> Self {
        Self {
            properties: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[async_trait]
impl PropertyService for MockPropertyService {
    async fn create_property(&self, property: Property, _context: &SecurityContext) -> Result<Property, CoreError> {
        let mut properties = self.properties.lock().unwrap();
        properties.insert(property.id(), property.clone());
        Ok(property)
    }

    async fn get_property(&self, id: Uuid, _context: &SecurityContext) -> Result<Option<Property>, CoreError> {
        let properties = self.properties.lock().unwrap();
        Ok(properties.get(&id).cloned())
    }

    async fn update_property(&self, property: &Property, _context: &SecurityContext) -> Result<(), CoreError> {
        let mut properties = self.properties.lock().unwrap();
        properties.insert(property.id(), property.clone());
        Ok(())
    }

    async fn delete_property(&self, id: Uuid, _context: &SecurityContext) -> Result<(), CoreError> {
        let mut properties = self.properties.lock().unwrap();
        properties.remove(&id);
        Ok(())
    }

    async fn list_properties(&self, _context: &SecurityContext) -> Result<Vec<Property>, CoreError> {
        let properties = self.properties.lock().unwrap();
        Ok(properties.values().cloned().collect())
    }

    async fn get_properties_by_custodian(&self, custodian: &str, _context: &SecurityContext) -> Result<Vec<Property>, CoreError> {
        let properties = self.properties.lock().unwrap();
        Ok(properties.values()
            .filter(|p| p.custodian() == Some(&custodian.to_string()))
            .cloned()
            .collect())
    }

    async fn get_sensitive_items(&self, _context: &SecurityContext) -> Result<Vec<Property>, CoreError> {
        let properties = self.properties.lock().unwrap();
        Ok(properties.values()
            .filter(|p| p.is_sensitive())
            .cloned()
            .collect())
    }

    async fn get_properties_by_command(&self, command_id: &str, _context: &SecurityContext) -> Result<Vec<Property>, CoreError> {
        let properties = self.properties.lock().unwrap();
        Ok(properties.values()
            .filter(|p| p.command_id() == Some(&command_id.to_string()))
            .cloned()
            .collect())
    }

    async fn get_current_holder(&self, property: &Property, _context: &SecurityContext) -> Result<Option<(String, DateTime<Utc>, String)>, CoreError> {
        Ok(property.custodian().map(|c| (
            c.to_string(),
            Utc::now(),
            "Test Location".to_string(),
        )))
    }
}

/// Mock transfer service for testing
pub struct MockTransferService {
    transfers: Arc<Mutex<HashMap<Uuid, Transfer>>>,
}

impl MockTransferService {
    pub fn new() -> Self {
        Self {
            transfers: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[async_trait]
impl TransferService for MockTransferService {
    async fn initiate_transfer(
        &self,
        property_id: Uuid,
        new_custodian: String,
        _context: &SecurityContext,
    ) -> Result<Transfer, CoreError> {
        let transfer = Transfer::new(
            property_id,
            None,
            new_custodian,
            true,
            None,
            None,
        );

        let mut transfers = self.transfers.lock().unwrap();
        transfers.insert(transfer.id(), transfer.clone());
        Ok(transfer)
    }

    async fn approve_transfer(
        &self,
        transfer_id: Uuid,
        _context: &SecurityContext,
    ) -> Result<Transfer, CoreError> {
        let mut transfers = self.transfers.lock().unwrap();
        let mut transfer = transfers.get(&transfer_id)
            .cloned()
            .ok_or_else(|| CoreError::NotFound("Transfer not found".into()))?;

        transfer.update_status(TransferStatus::Completed);
        transfers.insert(transfer_id, transfer.clone());
        Ok(transfer)
    }

    async fn complete_transfer(
        &self,
        transfer_id: Uuid,
        blockchain_verification: String,
        _context: &SecurityContext,
    ) -> Result<Transfer, CoreError> {
        let mut transfers = self.transfers.lock().unwrap();
        let mut transfer = transfers.get(&transfer_id)
            .cloned()
            .ok_or_else(|| CoreError::NotFound("Transfer not found".into()))?;

        transfer.update_status(TransferStatus::Confirmed);
        transfer.set_blockchain_verification(blockchain_verification);
        transfers.insert(transfer_id, transfer.clone());
        Ok(transfer)
    }

    async fn get_property_transfers(
        &self,
        property_id: Uuid,
        _context: &SecurityContext,
    ) -> Result<Vec<Transfer>, CoreError> {
        let transfers = self.transfers.lock().unwrap();
        Ok(transfers.values()
            .filter(|t| t.property_id() == property_id)
            .cloned()
            .collect())
    }

    async fn get_pending_approvals(
        &self,
        _context: &SecurityContext,
    ) -> Result<Vec<Transfer>, CoreError> {
        let transfers = self.transfers.lock().unwrap();
        Ok(transfers.values()
            .filter(|t| t.status() == TransferStatus::Pending)
            .cloned()
            .collect())
    }
}

/// Mock QR code service for testing
pub struct MockQRCodeService {
    signing_key: ed25519_dalek::SigningKey,
}

impl MockQRCodeService {
    pub fn new() -> Self {
        Self {
            signing_key: ed25519_dalek::SigningKey::generate(&mut rand::thread_rng()),
        }
    }
}

#[async_trait]
impl QRCodeService for MockQRCodeService {
    async fn generate_qr(
        &self,
        property_id: Uuid,
        format: QRFormat,
        _context: &SecurityContext,
    ) -> Result<QRResponse, CoreError> {
        let timestamp = Utc::now();
        let msg = format!("{}:{}", property_id, timestamp.timestamp());
        let signature = self.signing_key.sign(msg.as_bytes());

        let qr_data = QRData {
            property_id,
            timestamp,
            signature: base64::Engine::encode(&base64::engine::general_purpose::STANDARD, signature.to_bytes()),
        };

        Ok(QRResponse {
            qr_code: serde_json::to_string(&qr_data)?,
            property_id,
            generated_at: timestamp,
            format,
        })
    }

    async fn validate_qr(
        &self,
        request: VerifyQRRequest,
        _context: &SecurityContext,
    ) -> Result<QRData, CoreError> {
        let qr_data: QRData = serde_json::from_str(&request.qr_data)?;

        // Verify signature
        let msg = format!("{}:{}", qr_data.property_id, qr_data.timestamp.timestamp());
        let signature_bytes = base64::Engine::decode(
            &base64::engine::general_purpose::STANDARD,
            qr_data.signature.as_bytes(),
        )?;
        let signature = ed25519_dalek::Signature::from_bytes(&signature_bytes)?;

        self.signing_key.verify_strict(msg.as_bytes(), &signature)
            .map_err(|_| CoreError::Security("Invalid QR code signature".into()))?;

        // Check expiration
        let age = request.scanned_at - qr_data.timestamp;
        if age.num_hours() > 24 {
            return Err(CoreError::Security("QR code has expired".into()));
        }

        Ok(qr_data)
    }
}
