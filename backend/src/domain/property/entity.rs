use chrono::{DateTime, Utc};
use uuid::Uuid;
use std::collections::HashMap;
use serde::{Serialize, Deserialize};

/// Categories of military property
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
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

/// Property status in the system
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum PropertyStatus {
    Available,      // Ready for transfer
    Assigned,       // Signed out to someone
    InTransit,      // Being transferred
    Maintenance,    // Under maintenance
    Archived,       // No longer in use
    Disposed,       // Removed from inventory
}

/// Property condition codes
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum PropertyCondition {
    Serviceable,
    Unserviceable,
    NeedsRepair,
    Unknown,
}

/// Location information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub latitude: f64,
    pub longitude: f64,
    pub altitude: Option<f64>,
    pub accuracy: Option<f64>,
    pub timestamp: DateTime<Utc>,
    pub building: Option<String>,
    pub room: Option<String>,
}

/// Verification record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Verification {
    pub timestamp: DateTime<Utc>,
    pub verifier: String,
    pub method: VerificationMethod,
    pub location: Option<Location>,
    pub condition_code: Option<PropertyCondition>,
    pub notes: Option<String>,
}

/// Methods used to verify property
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum VerificationMethod {
    QrCode,
    ManualCheck,
    BlockchainVerification,
}

/// Core domain entity representing military property
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Property {
    id: Uuid,
    name: String,
    description: String,
    category: PropertyCategory,
    status: PropertyStatus,
    condition: PropertyCondition,
    is_sensitive: bool,
    quantity: i32,
    unit_of_issue: String,
    value: Option<f64>,
    
    // Identification
    nsn: Option<String>,          // National Stock Number
    serial_number: Option<String>,
    model_number: Option<String>,
    qr_code: Option<String>,
    
    // Custody
    custodian: Option<String>,
    hand_receipt_number: Option<String>,
    sub_hand_receipt_number: Option<String>,
    
    // Location
    current_location: Option<Location>,
    location_history: Vec<Location>,
    
    // Tracking
    verifications: Vec<Verification>,
    metadata: HashMap<String, String>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    last_inventoried: Option<DateTime<Utc>>,
}

impl Property {
    /// Creates a new property with required fields
    pub fn new(
        name: String,
        description: String,
        category: PropertyCategory,
        is_sensitive: bool,
        quantity: i32,
        unit_of_issue: String,
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
        if unit_of_issue.trim().is_empty() {
            return Err("Unit of issue cannot be empty".to_string());
        }

        Ok(Self {
            id: Uuid::new_v4(),
            name,
            description,
            category,
            status: PropertyStatus::Available,
            condition: PropertyCondition::Serviceable,
            is_sensitive,
            quantity,
            unit_of_issue,
            value: None,
            nsn: None,
            serial_number: None,
            model_number: None,
            qr_code: None,
            custodian: None,
            hand_receipt_number: None,
            sub_hand_receipt_number: None,
            current_location: None,
            location_history: Vec::new(),
            verifications: Vec::new(),
            metadata: HashMap::new(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            last_inventoried: None,
        })
    }

    // Getters
    pub fn id(&self) -> Uuid { self.id }
    pub fn name(&self) -> &str { &self.name }
    pub fn description(&self) -> &str { &self.description }
    pub fn category(&self) -> &PropertyCategory { &self.category }
    pub fn status(&self) -> &PropertyStatus { &self.status }
    pub fn condition(&self) -> &PropertyCondition { &self.condition }
    pub fn is_sensitive(&self) -> bool { self.is_sensitive }
    pub fn quantity(&self) -> i32 { self.quantity }
    pub fn unit_of_issue(&self) -> &str { &self.unit_of_issue }
    pub fn value(&self) -> Option<f64> { self.value }
    pub fn nsn(&self) -> Option<&String> { self.nsn.as_ref() }
    pub fn serial_number(&self) -> Option<&String> { self.serial_number.as_ref() }
    pub fn model_number(&self) -> Option<&String> { self.model_number.as_ref() }
    pub fn qr_code(&self) -> Option<&String> { self.qr_code.as_ref() }
    pub fn custodian(&self) -> Option<&String> { self.custodian.as_ref() }
    pub fn hand_receipt_number(&self) -> Option<&String> { self.hand_receipt_number.as_ref() }
    pub fn sub_hand_receipt_number(&self) -> Option<&String> { self.sub_hand_receipt_number.as_ref() }
    pub fn current_location(&self) -> Option<&Location> { self.current_location.as_ref() }
    pub fn verifications(&self) -> &[Verification] { &self.verifications }
    pub fn metadata(&self) -> &HashMap<String, String> { &self.metadata }

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

    /// Sets the QR code
    pub fn set_qr_code(&mut self, qr_code: String) {
        self.qr_code = Some(qr_code);
        self.updated_at = Utc::now();
    }

    /// Updates property metadata
    pub fn update_metadata(&mut self, key: String, value: String) -> Result<(), String> {
        if key.trim().is_empty() {
            return Err("Metadata key cannot be empty".to_string());
        }
        self.metadata.insert(key, value);
        self.updated_at = Utc::now();
        Ok(())
    }

    /// Updates property location
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

    /// Records a verification
    pub fn verify(&mut self, verification: Verification) -> Result<(), String> {
        if verification.verifier.trim().is_empty() {
            return Err("Verifier cannot be empty".to_string());
        }

        // Update last inventoried time for manual checks
        if verification.method == VerificationMethod::ManualCheck {
            self.last_inventoried = Some(verification.timestamp);
        }

        self.verifications.push(verification);
        self.updated_at = Utc::now();
        Ok(())
    }

    /// Changes property status
    pub fn change_status(&mut self, new_status: PropertyStatus) {
        self.status = new_status;
        self.updated_at = Utc::now();
    }

    /// Updates property condition
    pub fn update_condition(&mut self, condition: PropertyCondition) {
        self.condition = condition;
        self.updated_at = Utc::now();
    }

    /// Updates quantity
    pub fn update_quantity(&mut self, new_quantity: i32) -> Result<(), String> {
        if new_quantity <= 0 {
            return Err("Quantity must be positive".to_string());
        }
        self.quantity = new_quantity;
        self.updated_at = Utc::now();
        Ok(())
    }

    /// Transfers custody with optional hand receipt
    pub fn transfer_custody(
        &mut self,
        new_custodian: String,
        hand_receipt_number: Option<String>,
        sub_hand_receipt_number: Option<String>,
    ) -> Result<(), String> {
        if new_custodian.trim().is_empty() {
            return Err("Custodian cannot be empty".to_string());
        }

        self.custodian = Some(new_custodian);
        self.hand_receipt_number = hand_receipt_number;
        self.sub_hand_receipt_number = sub_hand_receipt_number;
        self.status = PropertyStatus::Assigned;
        self.updated_at = Utc::now();
        Ok(())
    }

    /// Checks if property is available for transfer
    pub fn is_available_for_transfer(&self) -> bool {
        matches!(self.status, PropertyStatus::Available | PropertyStatus::Assigned)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_property() {
        let property = Property::new(
            "M4 Carbine".to_string(),
            "5.56mm Rifle".to_string(),
            PropertyCategory::Weapons,
            true,
            1,
            "Each".to_string(),
        ).unwrap();

        assert_eq!(property.name(), "M4 Carbine");
        assert_eq!(property.description(), "5.56mm Rifle");
        assert!(property.is_sensitive());
        assert_eq!(property.quantity(), 1);
        assert_eq!(property.status(), &PropertyStatus::Available);
    }

    #[test]
    fn test_transfer_custody() {
        let mut property = Property::new(
            "M4 Carbine".to_string(),
            "5.56mm Rifle".to_string(),
            PropertyCategory::Weapons,
            true,
            1,
            "Each".to_string(),
        ).unwrap();

        property.transfer_custody(
            "NEW_SOLDIER".to_string(),
            Some("HR-123".to_string()),
            Some("SUB-456".to_string()),
        ).unwrap();

        assert_eq!(property.status(), &PropertyStatus::Assigned);
        assert_eq!(property.custodian().unwrap(), "NEW_SOLDIER");
        assert_eq!(property.hand_receipt_number().unwrap(), "HR-123");
        assert_eq!(property.sub_hand_receipt_number().unwrap(), "SUB-456");
    }

    #[test]
    fn test_location_update() {
        let mut property = Property::new(
            "M4 Carbine".to_string(),
            "5.56mm Rifle".to_string(),
            PropertyCategory::Weapons,
            true,
            1,
            "Each".to_string(),
        ).unwrap();

        let location = Location {
            latitude: 34.0522,
            longitude: -118.2437,
            altitude: Some(100.0),
            accuracy: Some(10.0),
            timestamp: Utc::now(),
            building: Some("HQ".to_string()),
            room: Some("Armory".to_string()),
        };

        property.update_location(location).unwrap();
        assert!(property.current_location().is_some());
        assert_eq!(property.location_history.len(), 0);

        // Update location again to test history
        let new_location = Location {
            latitude: 34.0523,
            longitude: -118.2438,
            altitude: Some(101.0),
            accuracy: Some(10.0),
            timestamp: Utc::now(),
            building: Some("Range".to_string()),
            room: None,
        };

        property.update_location(new_location).unwrap();
        assert!(property.current_location().is_some());
        assert_eq!(property.location_history.len(), 1);
    }
}
