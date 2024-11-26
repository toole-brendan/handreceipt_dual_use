use std::collections::{HashMap, HashSet};
use chrono::{DateTime, Utc};
use handreceipt::{
    domain::{
        models::{
            location::Location,
            transfer::{Transfer, TransferStatus},
        },
        property::{Property, PropertyService},
    },
    types::{
        security::{SecurityContext, SecurityClassification, Role},
        permissions::Permission,
    },
    infrastructure::blockchain::authority::MilitaryCertificate,
};

async fn create_test_transfer(property: &Property, from_id: i32, to_id: i32) -> Transfer {
    Transfer::new(
        property.id,
        from_id,
        to_id,
        Location {
            latitude: 0.0,
            longitude: 0.0,
            altitude: None,
            accuracy: None,
            building: None,
            floor: None,
            room: None,
        },
        Some("Test transfer".to_string()),
    )
}

#[tokio::test]
async fn test_transfer_workflow() {
    // Setup test environment
    let context = SecurityContext {
        user_id: 1,
        name: "Test User".to_string(),
        role: Role::Officer,
        unit: "Test Unit".to_string(),
        unit_code: "1-1-IN".to_string(),
        classification: SecurityClassification::Unclassified,
        roles: HashSet::from([Role::Officer]),
        permissions: vec![Permission::ViewProperty, Permission::CreateProperty],
        metadata: HashMap::new(),
    };

    let certificate = MilitaryCertificate {
        issuer: "TEST-CA".to_string(),
        subject: "TEST-UNIT".to_string(),
        valid_from: Utc::now(),
        valid_until: Some(Utc::now() + chrono::Duration::days(365)),
        roles: vec!["COMMANDER".to_string()],
        unit_id: "TEST-UNIT-ID".to_string(),
    };

    // ... rest of test ...
}
