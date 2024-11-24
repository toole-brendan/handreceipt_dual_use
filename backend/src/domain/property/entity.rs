use chrono::{DateTime, Utc};
use uuid::Uuid;
use std::collections::HashMap;
use serde::{Serialize, Deserialize};

/// Categories of military property
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum PropertyCategory {
    Weapon,
    Ammunition,
    Equipment,
    Supply,
    Vehicle,
    Other,
}

impl PropertyCategory {
    pub fn from_nsn(nsn: Option<&str>) -> Result<Self, String> {
        match nsn {
            Some(nsn) if nsn.starts_with("1005") => Ok(Self::Weapon),
            Some(nsn) if nsn.starts_with("1305") => Ok(Self::Ammunition),
            Some(nsn) if nsn.starts_with("23") => Ok(Self::Vehicle),
            Some(nsn) if nsn.starts_with("8465") => Ok(Self::Equipment),
            Some(nsn) if nsn.starts_with("8470") => Ok(Self::Supply),
            _ => Ok(Self::Other),
        }
    }
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
    pub grid_coordinates: Option<String>,
    pub notes: Option<String>,
}

/// History entry for tracking property changes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub timestamp: DateTime<Utc>,
    pub event_type: String,
    pub description: String,
    pub user_id: Option<String>,
    pub location: Option<Location>,
    pub metadata: HashMap<String, String>,
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
    unit_of_measure: String,
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
    history: Vec<HistoryEntry>,
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
        unit_of_measure: String,
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
        if unit_of_measure.trim().is_empty() {
            return Err("Unit of measure cannot be empty".to_string());
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
            unit_of_measure,
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
            history: Vec::new(),
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
    pub fn unit_of_measure(&self) -> &str { &self.unit_of_measure }
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

    /// Builder method to set serial number
    pub fn with_serial_number(mut self, serial: Option<String>) -> Self {
        self.serial_number = serial;
        self
    }

    /// Builder method to set model number
    pub fn with_model_number(mut self, model: String) -> Self {
        self.model_number = Some(model);
        self
    }

    /// Builder method to set NSN
    pub fn with_nsn(mut self, nsn: String) -> Self {
        self.nsn = Some(nsn);
        self
    }

    /// Builder method to set location
    pub fn with_location(mut self, location: Option<Location>) -> Self {
        if let Some(loc) = location {
            let loc_clone = loc.clone();
            self.current_location = Some(loc);
            self.location_history.push(loc_clone);
        }
        self
    }

    /// Updates property status with history tracking
    pub fn update_status(&mut self, new_status: PropertyStatus, user_id: Option<String>, notes: Option<String>) {
        let old_status = self.status.clone();
        self.status = new_status.clone();
        
        let description = if let Some(notes) = notes {
            format!("Status changed from {:?} to {:?}: {}", old_status, new_status, notes)
        } else {
            format!("Status changed from {:?} to {:?}", old_status, new_status)
        };

        self.add_history_entry(
            "STATUS_CHANGE",
            &description,
            user_id,
            None,
        );
        
        self.updated_at = Utc::now();
    }

    /// Updates property condition with history tracking
    pub fn update_condition(&mut self, new_condition: PropertyCondition, user_id: Option<String>, notes: Option<String>) {
        let old_condition = self.condition.clone();
        self.condition = new_condition.clone();
        
        let description = if let Some(notes) = notes {
            format!("Condition changed from {:?} to {:?}: {}", old_condition, new_condition, notes)
        } else {
            format!("Condition changed from {:?} to {:?}", old_condition, new_condition)
        };

        self.add_history_entry(
            "CONDITION_CHANGE",
            &description,
            user_id,
            None,
        );
        
        self.updated_at = Utc::now();
    }

    /// Updates property location and maintains history
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

        // Record old custodian in history
        if let Some(old_custodian) = self.custodian.as_ref() {
            self.add_history_entry(
                "CUSTODY_TRANSFER",
                &format!("Custody transferred from {} to {}", old_custodian, new_custodian),
                None,
                None,
            );
        } else {
            self.add_history_entry(
                "CUSTODY_ASSIGNED",
                &format!("Initial custody assigned to {}", new_custodian),
                None,
                None,
            );
        }

        self.custodian = Some(new_custodian);
        self.hand_receipt_number = hand_receipt_number;
        self.sub_hand_receipt_number = sub_hand_receipt_number;
        self.status = PropertyStatus::Assigned;
        self.updated_at = Utc::now();
        Ok(())
    }

    /// Adds a history entry
    pub fn add_history_entry(
        &mut self,
        event_type: &str,
        description: &str,
        user_id: Option<String>,
        location: Option<Location>,
    ) {
        let entry = HistoryEntry {
            timestamp: Utc::now(),
            event_type: event_type.to_string(),
            description: description.to_string(),
            user_id,
            location,
            metadata: HashMap::new(),
        };
        
        self.history.push(entry);
        self.updated_at = Utc::now();
    }

    /// Gets property history
    pub fn history(&self) -> &[HistoryEntry] {
        &self.history
    }

    /// Gets location history
    pub fn location_history(&self) -> &[Location] {
        &self.location_history
    }

    /// Checks if property is available for transfer
    pub fn is_available_for_transfer(&self) -> bool {
        matches!(self.status, PropertyStatus::Available | PropertyStatus::Assigned)
    }

    pub fn with_condition(mut self, condition: PropertyCondition) -> Self {
        self.condition = condition;
        self
    }

    pub fn command_id(&self) -> Option<String> {
        self.metadata.get("command_id").cloned()
    }

    pub fn with_custodian(mut self, custodian_id: Uuid) -> Self {
        self.custodian = Some(custodian_id.to_string());
        self
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
            PropertyCategory::Weapon,
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
            PropertyCategory::Weapon,
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
            PropertyCategory::Weapon,
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
            grid_coordinates: None,
            notes: None,
        };

        property.update_location(location).unwrap();
        assert!(property.current_location().is_some());
        assert_eq!(property.location_history().len(), 0);

        // Update location again to test history
        let new_location = Location {
            latitude: 34.0523,
            longitude: -118.2438,
            altitude: Some(101.0),
            accuracy: Some(10.0),
            timestamp: Utc::now(),
            building: Some("Range".to_string()),
            room: None,
            grid_coordinates: None,
            notes: None,
        };

        property.update_location(new_location).unwrap();
        assert!(property.current_location().is_some());
        assert_eq!(property.location_history().len(), 1);
    }
}
