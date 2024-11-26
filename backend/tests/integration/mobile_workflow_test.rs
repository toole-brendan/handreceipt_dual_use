use actix_web::test;
use std::collections::{HashMap, HashSet};
use chrono::Utc;
use uuid::Uuid;

use handreceipt::{
    types::{
        security::{SecurityContext, SecurityClassification, Role},
        scanning::{QRScanResult, DeviceInfo},
        permissions::Permission,
    },
    domain::{
        property::entity::{Property, PropertyCategory, PropertyStatus},
        models::Location,
    },
};

#[tokio::test]
async fn test_mobile_scan_workflow() {
    // Create test security context
    let mut context = SecurityContext::new(1);
    context.classification = SecurityClassification::Unclassified;
    context.roles = HashSet::from_iter([Role::Soldier]);
    context.permissions = vec![Permission::ViewProperty];

    // Create test property
    let now = Utc::now();
    let property = Property {
        id: 1,
        name: "Test Item".to_string(),
        description: "Test Description".to_string(),
        category: PropertyCategory::Equipment,
        status: PropertyStatus::Available,
        current_holder_id: 1,
        location: Location {
            latitude: 37.7749,
            longitude: -122.4194,
            altitude: Some(0.0),
            accuracy: Some(1.0),
            building: Some("Test Building".to_string()),
            floor: Some(1),
            room: Some("101".to_string()),
        },
        metadata: serde_json::json!({}),
        created_at: now,
        updated_at: now,
        is_sensitive: false,
        quantity: 1,
        notes: None,
        serial_number: None,
        nsn: None,
        hand_receipt_number: None,
        requires_approval: false,
    };

    // Test QR code scanning
    let scan_result = QRScanResult::new(
        format!("{}:verification_code", property.id).into_bytes(),
        SecurityClassification::Unclassified,
    ).with_metadata(HashMap::from([
        ("test".to_string(), "metadata".to_string())
    ]));

    // Verify the property ID can be extracted and converted to string for comparison
    let extracted_id = scan_result.property_id()
        .expect("Failed to extract property ID")
        .to_string();
    assert_eq!(extracted_id, property.id.to_string());
} 