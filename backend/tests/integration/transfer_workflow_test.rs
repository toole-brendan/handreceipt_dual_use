use actix_web::{test, web, App};
use chrono::Utc;
use serde_json::json;
use uuid::Uuid;
use std::sync::Arc;

use handreceipt::{
    api::{
        handlers::property_handler,
        auth::{AuthConfig, Claims, Rank, UnitInfo},
        middleware::auth::Authorization,
    },
    domain::{
        property::{Property, PropertyService},
        transfer::{Transfer, TransferService},
    },
    application::services::{
        qr_service::QRService,
        transfer_service::TransferServiceImpl,
    },
    infrastructure::{
        persistence::{
            create_pool,
            create_repositories,
            DatabaseConfig,
        },
        blockchain::authority::{
            AuthorityNode,
            MilitaryCertificate,
        },
    },
};

/// Test helper to create auth token
fn create_test_token(
    config: &AuthConfig,
    rank: Rank,
    unit_code: &str,
    is_supply: bool,
) -> String {
    let claims = Claims {
        sub: Uuid::new_v4(),
        name: "Test User".to_string(),
        rank,
        unit: UnitInfo {
            unit_id: unit_code.to_string(),
            parent_unit: None,
            position: if is_supply {
                "Supply Officer".to_string()
            } else {
                "Soldier".to_string()
            },
            duty_position: if is_supply {
                Some("Supply Officer".to_string())
            } else {
                None
            },
        },
        exp: (Utc::now() + chrono::Duration::hours(1)).timestamp(),
        iat: Utc::now().timestamp(),
    };

    config.create_token(claims).unwrap()
}

#[actix_web::test]
async fn test_property_transfer_workflow() {
    // Setup test database
    let db_config = DatabaseConfig {
        host: "localhost".to_string(),
        port: 5432,
        username: "postgres".to_string(),
        password: "postgres".to_string(),
        database: format!("test_db_{}", Uuid::new_v4()),
        max_connections: 5,
    };

    let pool = create_pool(&db_config).await.unwrap();
    let repositories = create_repositories(pool.clone());

    // Setup services
    let property_service = Arc::new(repositories.property.clone());
    let qr_service = Arc::new(QRService::new(property_service.clone()));

    // Setup blockchain authority
    let keypair = ed25519_dalek::Keypair::generate(&mut rand::thread_rng());
    let certificate = MilitaryCertificate {
        issuer: "TEST-CA".to_string(),
        subject: "TEST-UNIT".to_string(),
        valid_from: Utc::now(),
        valid_until: Utc::now() + chrono::Duration::days(365),
        certificate_id: "TEST123".to_string(),
    };

    let authority = Arc::new(AuthorityNode::new(
        "1-1-IN".to_string(),
        keypair,
        certificate,
        true,
        std::collections::HashMap::new(),
    ));

    let transfer_service = Arc::new(TransferServiceImpl::new(
        property_service.clone(),
        qr_service.clone(),
        authority,
    ));

    // Setup auth config
    let auth_config = AuthConfig::new(
        "test_secret".to_string(),
        chrono::Duration::hours(1),
    );

    // Create test app
    let app = test::init_service(
        App::new()
            .app_data(web::Data::new(property_service.clone()))
            .app_data(web::Data::new(qr_service.clone()))
            .app_data(web::Data::new(transfer_service.clone()))
            .wrap(Authorization::new(auth_config.clone(), Default::default()))
            .configure(property_handler::configure)
    ).await;

    // Test as supply officer
    let supply_token = create_test_token(
        &auth_config,
        Rank::SergeantFirstClass,
        "1-1-IN",
        true,
    );

    // 1. Create property
    let create_resp = test::TestRequest::post()
        .uri("/api/v1/property")
        .insert_header(("Authorization", format!("Bearer {}", supply_token)))
        .set_json(json!({
            "name": "M4 Carbine",
            "description": "5.56mm Rifle",
            "nsn": "1005-01-231-0973",
            "serial_number": "12345678",
            "is_sensitive": true,
            "quantity": 1,
            "unit_of_issue": "Each",
        }))
        .send_request(&app)
        .await;

    assert!(create_resp.status().is_success());
    let property: Property = test::read_body_json(create_resp).await;

    // 2. Generate QR code
    let qr_resp = test::TestRequest::get()
        .uri(&format!("/api/v1/property/{}/qr", property.id()))
        .insert_header(("Authorization", format!("Bearer {}", supply_token)))
        .send_request(&app)
        .await;

    assert!(qr_resp.status().is_success());
    let qr_data: String = test::read_body_json(qr_resp).await;

    // Test as soldier
    let soldier_token = create_test_token(
        &auth_config,
        Rank::PrivateFirstClass,
        "1-1-IN",
        false,
    );

    // 3. Initiate transfer
    let transfer_resp = test::TestRequest::post()
        .uri("/api/v1/property/transfer")
        .insert_header(("Authorization", format!("Bearer {}", soldier_token)))
        .set_json(json!({
            "qr_data": qr_data,
            "new_custodian": "PFC.SMITH",
            "location": {
                "building": "Barracks",
                "room": "B123"
            }
        }))
        .send_request(&app)
        .await;

    assert!(transfer_resp.status().is_success());
    let transfer: Transfer = test::read_body_json(transfer_resp).await;
    assert!(transfer.requires_approval());

    // Test as commander
    let commander_token = create_test_token(
        &auth_config,
        Rank::Captain,
        "1-1-IN",
        false,
    );

    // 4. Approve transfer
    let approve_resp = test::TestRequest::post()
        .uri(&format!("/api/v1/property/transfer/{}/approve", transfer.id()))
        .insert_header(("Authorization", format!("Bearer {}", commander_token)))
        .set_json(json!({
            "notes": "Approved"
        }))
        .send_request(&app)
        .await;

    assert!(approve_resp.status().is_success());
    let approved: Transfer = test::read_body_json(approve_resp).await;
    assert!(approved.blockchain_verification().is_some());

    // 5. Verify final state
    let property_resp = test::TestRequest::get()
        .uri(&format!("/api/v1/property/{}", property.id()))
        .insert_header(("Authorization", format!("Bearer {}", soldier_token)))
        .send_request(&app)
        .await;

    assert!(property_resp.status().is_success());
    let final_property: Property = test::read_body_json(property_resp).await;
    assert_eq!(final_property.custodian().unwrap(), "PFC.SMITH");

    // Cleanup
    sqlx::query!("DROP DATABASE $1", db_config.database)
        .execute(&*pool)
        .await
        .unwrap();
}

#[actix_web::test]
async fn test_transfer_validation_rules() {
    // Similar setup as above...

    // Test cases:
    // 1. Transfer without required approval
    // 2. Transfer with missing signatures
    // 3. Transfer across units
    // 4. Transfer of non-existent property
    // 5. Transfer with expired QR code
    // 6. Transfer with mismatched custodian
}

#[actix_web::test]
async fn test_role_based_access() {
    // Similar setup as above...

    // Test cases:
    // 1. Soldier attempting commander actions
    // 2. NCO attempting officer actions
    // 3. Supply officer from different unit
    // 4. Commander approving transfer in different unit
    // 5. Invalid token
}

#[actix_web::test]
async fn test_blockchain_verification() {
    // Similar setup as above...

    // Test cases:
    // 1. Verify transfer record creation
    // 2. Verify signature validation
    // 3. Verify authority consensus
    // 4. Verify command chain validation
    // 5. Test offline verification
}
