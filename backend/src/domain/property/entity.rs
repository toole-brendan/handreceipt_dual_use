use chrono::{DateTime, Utc};
use uuid::Uuid;
use std::collections::HashMap;
use serde::{Serialize, Deserialize};

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

/// Property categories
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum PropertyCategory {
    Weapons,
    Electronics,
    Equipment,
    Supplies,
    Vehicles,
    Other,
}

/// Location information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub building: String,
    pub room: Option<String>,
    pub notes: Option<String>,
    pub grid_coordinates: Option<String>,
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
    pub fn nsn(&self) -> Option<&String> { self.nsn.as_ref() }
    pub fn serial_number(&self) -> Option<&String> { self.serial_number.as_ref() }
    pub fn model_number(&self) -> Option<&String> { self.model_number.as_ref() }
    pub fn qr_code(&self) -> Option<&String> { self.qr_code.as_ref() }
    pub fn custodian(&self) -> Option<&String> { self.custodian.as_ref() }
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
    pub fn update_location(&mut self, location: Location) {
        // Store current location in history if it exists
        if let Some(current) = self.current_location.take() {
            self.location_history.push(current);
        }
        self.current_location = Some(location);
        self.updated_at = Utc::now();
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

    /// Initiates a transfer
    pub fn initiate_transfer(&mut self) -> Result<(), String> {
        match self.status {
            PropertyStatus::Available | PropertyStatus::Assigned => {
                self.status = PropertyStatus::InTransit;
                self.updated_at = Utc::now();
                Ok(())
            }
            _ => Err("Property cannot be transferred in current status".to_string()),
        }
    }

    /// Cancels a transfer
    pub fn cancel_transfer(&mut self) -> Result<(), String> {
        if self.status != PropertyStatus::InTransit {
            return Err("Property is not in transit".to_string());
        }
        self.status = if self.custodian.is_some() {
            PropertyStatus::Assigned
        } else {
            PropertyStatus::Available
        };
        self.updated_at = Utc::now();
        Ok(())
    }

    /// Transfers custody with optional hand receipt
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
        self.status = PropertyStatus::Assigned;
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
    fn test_transfer_workflow() {
        let mut property = Property::new(
            "M4 Carbine".to_string(),
            "5.56mm Rifle".to_string(),
            PropertyCategory::Weapons,
            true,
            1,
            "Each".to_string(),
        ).unwrap();

        // Initiate transfer
        property.initiate_transfer().unwrap();
        assert_eq!(property.status(), &PropertyStatus::InTransit);

        // Complete transfer
        property.transfer_custody(
            "NEW_SOLDIER".to_string(),
            Some("HR-123".to_string()),
        ).unwrap();
        assert_eq!(property.status(), &PropertyStatus::Assigned);
        assert_eq!(property.custodian().unwrap(), "NEW_SOLDIER");
    }

    #[test]
    fn test_verification() {
        let mut property = Property::new(
            "M4 Carbine".to_string(),
            "5.56mm Rifle".to_string(),
            PropertyCategory::Weapons,
            true,
            1,
            "Each".to_string(),
        ).unwrap();

        let verification = Verification {
            timestamp: Utc::now(),
            verifier: "SGT.DOE".to_string(),
            method: VerificationMethod::ManualCheck,
            location: Some(Location {
                building: "HQ".to_string(),
                room: Some("101".to_string()),
                notes: None,
                grid_coordinates: None,
            }),
            condition_code: Some(PropertyCondition::Serviceable),
            notes: None,
        };

        property.verify(verification).unwrap();
        assert!(property.last_inventoried.is_some());
        assert_eq!(property.verifications().len(), 1);
    }
}
