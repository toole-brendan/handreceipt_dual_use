use chrono::{DateTime, Utc};
use uuid::Uuid;
use std::collections::HashMap;

/// Categories of military property
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PropertyCategory {
    Equipment,      // Durable items like vehicles
    Supplies,       // Consumable items
    Electronics,    // Electronic devices
    Communications, // Comms equipment
    Weapons,        // Weapons and weapon systems
    Ammunition,     // Ammo and explosives
    Tools,         // Tools and tool kits
    Clothing,      // Uniforms and gear
}

/// Status of military property
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PropertyStatus {
    Active,
    InTransit,
    Inactive,
    Pending,
    Archived,
    Deleted,
}

/// Location information
#[derive(Debug, Clone)]
pub struct Location {
    pub latitude: f64,
    pub longitude: f64,
    pub altitude: Option<f64>,
    pub accuracy: Option<f64>,
    pub timestamp: DateTime<Utc>,
    pub building: Option<String>,
    pub room: Option<String>,
}

/// Digital signature for property actions
#[derive(Debug, Clone)]
pub struct Signature {
    pub signer: String,
    pub signature: String,
    pub timestamp: DateTime<Utc>,
    pub valid_until: Option<DateTime<Utc>>,
}

/// Property verification record
#[derive(Debug, Clone)]
pub struct Verification {
    pub timestamp: DateTime<Utc>,
    pub verifier: String,
    pub method: VerificationMethod,
    pub location: Option<Location>,
    pub condition_code: Option<String>,
    pub notes: Option<String>,
}

/// Methods used to verify property
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum VerificationMethod {
    QrCode,
    RfidScan,
    ManualCheck,
    BlockchainVerification,
}

/// Core domain entity representing military property
#[derive(Debug)]
pub struct Property {
    id: Uuid,
    name: String,
    description: String,
    status: PropertyStatus,
    category: PropertyCategory,
    is_sensitive: bool,
    nsn: Option<String>,          // National Stock Number
    serial_number: Option<String>,
    model_number: Option<String>,
    quantity: i32,
    metadata: HashMap<String, String>,
    signatures: Vec<Signature>,
    verifications: Vec<Verification>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    
    // Identification
    qr_code: Option<String>,
    rfid_tag: Option<String>,
    
    // Hand Receipt
    custodian: Option<String>,
    hand_receipt_number: Option<String>,
    sub_hand_receipt_number: Option<String>,
    
    // Location
    current_location: Option<Location>,
    location_history: Vec<Location>,
}

impl Property {
    /// Creates a new property item
    pub fn new(
        name: String,
        description: String,
        category: PropertyCategory,
        is_sensitive: bool,
        quantity: i32,
    ) -> Result<Self, String> {
        // Validate inputs
        if name.trim().is_empty() {
            return Err("Property name cannot be empty".to_string());
        }
        if description.trim().is_empty() {
            return Err("Property description cannot be empty".to_string());
        }
        if quantity <= 0 {
            return Err("Quantity must be positive".to_string());
        }

        Ok(Self {
            id: Uuid::new_v4(),
            name,
            description,
            status: PropertyStatus::Pending,
            category,
            is_sensitive,
            nsn: None,
            serial_number: None,
            model_number: None,
            quantity,
            metadata: HashMap::new(),
            signatures: Vec::new(),
            verifications: Vec::new(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            qr_code: None,
            rfid_tag: None,
            custodian: None,
            hand_receipt_number: None,
            sub_hand_receipt_number: None,
            current_location: None,
            location_history: Vec::new(),
        })
    }

    // Getters
    pub fn id(&self) -> Uuid { self.id }
    pub fn name(&self) -> &str { &self.name }
    pub fn description(&self) -> &str { &self.description }
    pub fn status(&self) -> &PropertyStatus { &self.status }
    pub fn category(&self) -> &PropertyCategory { &self.category }
    pub fn is_sensitive(&self) -> bool { self.is_sensitive }
    pub fn nsn(&self) -> Option<&String> { self.nsn.as_ref() }
    pub fn serial_number(&self) -> Option<&String> { self.serial_number.as_ref() }
    pub fn model_number(&self) -> Option<&String> { self.model_number.as_ref() }
    pub fn quantity(&self) -> i32 { self.quantity }
    pub fn custodian(&self) -> Option<&String> { self.custodian.as_ref() }
    pub fn hand_receipt_number(&self) -> Option<&String> { self.hand_receipt_number.as_ref() }
    pub fn current_location(&self) -> Option<&Location> { self.current_location.as_ref() }
    pub fn metadata(&self) -> &HashMap<String, String> { &self.metadata }
    pub fn verifications(&self) -> &[Verification] { &self.verifications }

    /// Sets the NSN
    pub fn set_nsn(&mut self, nsn: String) {
        self.nsn = Some(nsn);
        self.updated_at = Utc::now();
    }

    /// Sets the serial number
    pub fn set_serial_number(&mut self, serial: String) {
        self.serial_number = Some(serial);
        self.updated_at = Utc::now();
    }

    /// Sets the model number
    pub fn set_model_number(&mut self, model: String) {
        self.model_number = Some(model);
        self.updated_at = Utc::now();
    }

    /// Updates the property's metadata
    pub fn update_metadata(&mut self, key: String, value: String) -> Result<(), String> {
        if key.trim().is_empty() {
            return Err("Metadata key cannot be empty".to_string());
        }
        self.metadata.insert(key, value);
        self.updated_at = Utc::now();
        Ok(())
    }

    /// Adds a new signature
    pub fn add_signature(&mut self, signature: Signature) -> Result<(), String> {
        if signature.signer.trim().is_empty() {
            return Err("Signature must have a signer".to_string());
        }
        if signature.signature.trim().is_empty() {
            return Err("Signature data cannot be empty".to_string());
        }
        self.signatures.push(signature);
        self.updated_at = Utc::now();
        Ok(())
    }

    /// Records a verification
    pub fn verify(&mut self, verification: Verification) -> Result<(), String> {
        if verification.verifier.trim().is_empty() {
            return Err("Verifier cannot be empty".to_string());
        }
        self.verifications.push(verification);
        self.updated_at = Utc::now();
        Ok(())
    }

    /// Updates the location
    pub fn update_location(&mut self, location: Location) -> Result<(), String> {
        // Validate location data
        if !(-90.0..=90.0).contains(&location.latitude) {
            return Err("Invalid latitude".to_string());
        }
        if !(-180.0..=180.0).contains(&location.longitude) {
            return Err("Invalid longitude".to_string());
        }

        // Store current location in history before updating
        if let Some(current) = self.current_location.take() {
            self.location_history.push(current);
        }

        self.current_location = Some(location);
        self.updated_at = Utc::now();
        Ok(())
    }

    /// Changes the status
    pub fn change_status(&mut self, new_status: PropertyStatus) {
        self.status = new_status;
        self.updated_at = Utc::now();
    }

    /// Transfers custody
    pub fn transfer_custody(
        &mut self,
        new_custodian: String,
        hand_receipt_number: Option<String>,
    ) -> Result<(), String> {
        if new_custodian.trim().is_empty() {
            return Err("Custodian cannot be empty".to_string());
        }
        self.custodian = Some(new_custodian);
        self.hand_receipt_number = hand_receipt_number;
        self.status = PropertyStatus::InTransit;
        self.updated_at = Utc::now();
        Ok(())
    }

    /// Updates the quantity
    pub fn update_quantity(&mut self, new_quantity: i32) -> Result<(), String> {
        if new_quantity <= 0 {
            return Err("Quantity must be positive".to_string());
        }
        self.quantity = new_quantity;
        self.updated_at = Utc::now();
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_property() {
        let property = Property::new(
            "M4 Carbine".to_string(),
            "Standard issue rifle".to_string(),
            PropertyCategory::Weapons,
            true,
            1,
        ).unwrap();

        assert_eq!(property.name(), "M4 Carbine");
        assert_eq!(property.description(), "Standard issue rifle");
        assert!(property.is_sensitive());
        assert_eq!(property.status(), &PropertyStatus::Pending);
        assert_eq!(property.quantity(), 1);
    }

    #[test]
    fn test_transfer_custody() {
        let mut property = Property::new(
            "M4 Carbine".to_string(),
            "Standard issue rifle".to_string(),
            PropertyCategory::Weapons,
            true,
            1,
        ).unwrap();

        property.transfer_custody(
            "New Custodian".to_string(),
            Some("HR-123".to_string()),
        ).unwrap();

        assert_eq!(property.custodian().unwrap(), "New Custodian");
        assert_eq!(property.hand_receipt_number().unwrap(), "HR-123");
        assert_eq!(property.status(), &PropertyStatus::InTransit);
    }

    #[test]
    fn test_update_quantity() {
        let mut property = Property::new(
            "Magazines".to_string(),
            "30-round magazines".to_string(),
            PropertyCategory::Supplies,
            false,
            10,
        ).unwrap();

        property.update_quantity(15).unwrap();
        assert_eq!(property.quantity(), 15);

        assert!(property.update_quantity(0).is_err());
        assert!(property.update_quantity(-1).is_err());
    }
}
