use chrono::{DateTime, Utc};
use uuid::Uuid;
use ed25519_dalek::{
    SigningKey, VerifyingKey, Signature, Signer, Verifier,
    SIGNATURE_LENGTH,
};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

use crate::domain::models::transfer::TransferStatus;

/// Represents a military authority node
#[derive(Debug)]
pub struct AuthorityNode {
    node_id: Uuid,
    unit_code: String,
    signing_key: SigningKey,
    verifying_key: VerifyingKey,
    certificate: MilitaryCertificate,
    is_primary: bool,
    unit_hierarchy: HashMap<String, Vec<String>>, // parent -> children units
}

/// Military digital certificate
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MilitaryCertificate {
    pub issuer: String,      // Military Certificate Authority
    pub subject: String,     // Unit/S4 Office
    pub valid_from: DateTime<Utc>,
    pub valid_until: DateTime<Utc>,
    pub certificate_id: String,
}

/// Property transfer record on blockchain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyTransfer {
    pub property_id: Uuid,
    pub from_custodian: Option<String>,
    pub to_custodian: String,
    pub initiated_by: String,
    pub requires_approval: bool,
    pub timestamp: DateTime<Utc>,
    pub signatures: Vec<TransferSignature>,
}

/// Digital signature on a transfer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferSignature {
    pub signer_id: String,
    pub unit_code: String,
    pub role: SignerRole,
    pub signature: Vec<u8>,
    pub timestamp: DateTime<Utc>,
}

/// Role of transfer signer
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SignerRole {
    Commander,
    SupplyOfficer,
    PropertyBook,
    Custodian,
}

impl AuthorityNode {
    /// Creates a new authority node
    pub fn new(
        unit_code: String,
        signing_key: SigningKey,
        certificate: MilitaryCertificate,
        is_primary: bool,
        unit_hierarchy: HashMap<String, Vec<String>>,
    ) -> Self {
        let verifying_key = signing_key.verifying_key();
        Self {
            node_id: Uuid::new_v4(),
            unit_code,
            verifying_key,
            signing_key,
            certificate,
            is_primary,
            unit_hierarchy,
        }
    }

    /// Creates a new transfer record
    pub fn new_transfer(
        &self,
        property_id: Uuid,
        from_custodian: Option<String>,
        to_custodian: String,
        initiated_by: String,
        requires_approval: bool,
    ) -> PropertyTransfer {
        PropertyTransfer {
            property_id,
            from_custodian,
            to_custodian,
            initiated_by,
            requires_approval,
            timestamp: Utc::now(),
            signatures: Vec::new(),
        }
    }

    /// Signs a transfer with this node's authority
    pub fn sign_transfer(
        &self,
        transfer: &mut PropertyTransfer,
        role: SignerRole,
    ) -> Result<(), String> {
        // Create signature of transfer data
        let message = serde_json::to_string(&transfer)
            .map_err(|e| format!("Failed to serialize transfer: {}", e))?;

        let signature = self.signing_key.sign(message.as_bytes());

        // Add signature to transfer
        transfer.signatures.push(TransferSignature {
            signer_id: self.node_id.to_string(),
            unit_code: self.unit_code.clone(),
            role,
            signature: signature.to_bytes().to_vec(),
            timestamp: Utc::now(),
        });

        Ok(())
    }

    /// Validates a transfer based on military authority rules
    pub fn validate_transfer(&self, transfer: &PropertyTransfer) -> Result<bool, String> {
        // 1. Verify all signatures
        self.verify_signatures(transfer)?;

        // 2. Verify authority signatures meet requirements
        self.verify_authority_consensus(transfer)?;

        // 3. Verify transfer follows chain of command
        self.verify_command_authority(transfer)?;

        Ok(true)
    }

    /// Verifies all signatures on a transfer
    fn verify_signatures(&self, transfer: &PropertyTransfer) -> Result<bool, String> {
        let message = serde_json::to_string(&transfer)
            .map_err(|e| format!("Failed to serialize transfer: {}", e))?;

        for sig in &transfer.signatures {
            // Convert signature bytes back to ed25519 Signature
            let signature_bytes: [u8; SIGNATURE_LENGTH] = sig.signature[..]
                .try_into()
                .map_err(|_| "Invalid signature length".to_string())?;
            let signature = Signature::from_bytes(&signature_bytes);

            // Verify signature with public key
            self.verifying_key
                .verify(message.as_bytes(), &signature)
                .map_err(|e| format!("Invalid signature: {}", e))?;
        }

        Ok(true)
    }

    /// Verifies sufficient authority consensus
    fn verify_authority_consensus(&self, transfer: &PropertyTransfer) -> Result<bool, String> {
        // Count signatures by role
        let mut commander_sigs = 0;
        let mut supply_sigs = 0;

        for sig in &transfer.signatures {
            match sig.role {
                SignerRole::Commander => commander_sigs += 1,
                SignerRole::SupplyOfficer => supply_sigs += 1,
                _ => {}
            }
        }

        // Verify required signatures based on transfer type
        if transfer.requires_approval {
            // Sensitive items require commander approval
            if commander_sigs == 0 {
                return Err("Missing commander signature".to_string());
            }
        }

        // All transfers require supply
        if supply_sigs == 0 {
            return Err("Missing supply officer signature".to_string());
        }

        Ok(true)
    }

    /// Verifies transfer follows chain of command
    fn verify_command_authority(&self, transfer: &PropertyTransfer) -> Result<bool, String> {
        // Get units for both parties
        let from_unit = self.get_unit_for_user(&transfer.from_custodian.clone().unwrap_or_default())
            .ok_or_else(|| "Unknown from unit".to_string())?;
        let to_unit = self.get_unit_for_user(&transfer.to_custodian)
            .ok_or_else(|| "Unknown to unit".to_string())?;

        // Verify units are in same command chain
        if !self.units_in_same_chain(&from_unit, &to_unit) {
            return Err("Transfer crosses command chains".to_string());
        }

        Ok(true)
    }

    /// Gets unit for a user (in real impl, would lookup in user service)
    fn get_unit_for_user(&self, user_id: &str) -> Option<String> {
        // Mock implementation - would actually lookup user's unit
        Some(self.unit_code.clone())
    }

    /// Checks if two units are in the same command chain
    fn units_in_same_chain(&self, unit1: &str, unit2: &str) -> bool {
        // Check if either unit is parent of the other
        if let Some(children) = self.unit_hierarchy.get(unit1) {
            if children.contains(&unit2.to_string()) {
                return true;
            }
        }
        if let Some(children) = self.unit_hierarchy.get(unit2) {
            if children.contains(&unit1.to_string()) {
                return true;
            }
        }

        // Check if units share a common parent
        for (parent, children) in &self.unit_hierarchy {
            if children.contains(&unit1.to_string()) && children.contains(&unit2.to_string()) {
                return true;
            }
        }

        false
    }

    /// Gets transfer status from blockchain
    pub async fn get_transfer_status(&self, transfer_id: Uuid) -> Result<TransferStatus, String> {
        // In real impl, would query blockchain network
        // Mock implementation
        Ok(TransferStatus::Pending)
    }

    /// Records transfer on blockchain
    pub async fn record_transfer(&self, transfer: &PropertyTransfer) -> Result<String, String> {
        // In real impl, would broadcast to blockchain network
        // Mock implementation returns a hash
        Ok(format!("TRANSFER_{}", transfer.property_id))
    }

    pub fn verify_signature(&self, msg: &[u8], signature_bytes: &[u8]) -> Result<bool, String> {
        let signature_array: [u8; SIGNATURE_LENGTH] = signature_bytes
            .try_into()
            .map_err(|_| "Invalid signature length".to_string())?;
        let signature = Signature::from_bytes(&signature_array);
            
        Ok(self.verifying_key.verify(msg, &signature).is_ok())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::rngs::OsRng;

    fn create_test_hierarchy() -> HashMap<String, Vec<String>> {
        let mut hierarchy = HashMap::new();
        hierarchy.insert(
            "1-DIV".to_string(),
            vec!["1-BDE".to_string(), "2-BDE".to_string()],
        );
        hierarchy.insert(
            "1-BDE".to_string(),
            vec!["1-1-IN".to_string(), "1-2-IN".to_string()],
        );
        hierarchy
    }

    #[test]
    fn test_transfer_validation() {
        let signing_key = SigningKey::generate(&mut OsRng);
        let certificate = MilitaryCertificate {
            issuer: "DOD-CA".to_string(),
            subject: "1-1 IN S4".to_string(),
            valid_from: Utc::now(),
            valid_until: Utc::now() + chrono::Duration::days(365),
            certificate_id: "TEST123".to_string(),
        };

        let node = AuthorityNode::new(
            "1-1-IN".to_string(),
            signing_key,
            certificate,
            true,
            create_test_hierarchy(),
        );

        // Create test transfer
        let mut transfer = node.new_transfer(
            Uuid::new_v4(),
            Some("SGT.DOE".to_string()),
            "PFC.SMITH".to_string(),
            "LT.JONES".to_string(),
            true,
        );

        // Sign transfer
        node.sign_transfer(&mut transfer, SignerRole::Commander).unwrap();
        node.sign_transfer(&mut transfer, SignerRole::SupplyOfficer).unwrap();

        // Validate transfer
        let result = node.validate_transfer(&transfer);
        assert!(result.is_ok());
    }

    #[test]
    fn test_command_authority() {
        let signing_key = SigningKey::generate(&mut OsRng);
        let certificate = MilitaryCertificate {
            issuer: "DOD-CA".to_string(),
            subject: "1-1 IN S4".to_string(),
            valid_from: Utc::now(),
            valid_until: Utc::now() + chrono::Duration::days(365),
            certificate_id: "TEST123".to_string(),
        };

        let hierarchy = create_test_hierarchy();
        let node = AuthorityNode::new(
            "1-1-IN".to_string(),
            signing_key,
            certificate,
            true,
            hierarchy,
        );

        // Test units in same chain
        assert!(node.units_in_same_chain("1-DIV", "1-1-IN"));
        assert!(node.units_in_same_chain("1-BDE", "1-2-IN"));

        // Test units not in same chain
        assert!(!node.units_in_same_chain("2-BDE", "1-1-IN"));
    }
}
