#[path = "../common/mod.rs"]
mod common;

use std::collections::{HashMap, HashSet};
use chrono::Utc;
use uuid::Uuid;
use handreceipt::{
    api::handlers::{
        property::CreatePropertyRequest,
        transfer::CreateTransferRequest,
    },
    domain::{
        property::entity::{Property, PropertyStatus, PropertyCategory},
        models::location::Location,
    },
    types::{
        Role, SecurityContext,
        SecurityClassification,
        scanning::{QRScanResult, DeviceInfo, GeoLocation},
    },
};

struct TestContext {
    property: Property,
    qr_code: QRScanResult,
    user_id: i32,
}

impl TestContext {
    async fn new(_role: &str) -> Self {
        let user_id = 1;
        let property = create_test_property("Test Item".to_string()).await;
        let qr_code = create_test_qr_code(&property).await;
        
        Self {
            property,
            qr_code,
            user_id,
        }
    }
}

async fn create_test_property(name: String) -> Property {
    Property {
        id: 1,
        name,
        description: "Test property".to_string(),
        location: Location {
            latitude: 0.0,
            longitude: 0.0,
            altitude: None,
            accuracy: None,
            building: None,
            floor: None,
            room: None,
        },
        status: PropertyStatus::Available,
        created_at: Utc::now(),
        updated_at: Utc::now(),
        metadata: serde_json::Value::Object(serde_json::Map::new()),
        category: PropertyCategory::Equipment,
        current_holder_id: 1,
        is_sensitive: false,
        quantity: 1,
        notes: None,
        serial_number: None,
        nsn: None,
        hand_receipt_number: Some("TEST-HR-1".to_string()),
        requires_approval: false,
    }
}

async fn create_test_qr_code(property: &Property) -> QRScanResult {
    QRScanResult {
        id: Uuid::new_v4(),
        data: vec![1, 2, 3, 4], // Test data
        timestamp: Utc::now(),
        location: Some(GeoLocation {
            latitude: 0.0,
            longitude: 0.0,
            altitude: None,
            accuracy: None,
            timestamp: Utc::now(),
            building: None,
            room: None,
        }),
        device_info: Some(DeviceInfo {
            device_id: "TEST-DEVICE".to_string(),
            device_type: "TEST".to_string(),
            os_version: "1.0".to_string(),
            app_version: "1.0".to_string(),
        }),
        classification: SecurityClassification::Unclassified,
        metadata: Some(HashMap::new()),
    }
}
