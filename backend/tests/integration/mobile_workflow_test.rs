use actix_web::{test, web, App};
use chrono::Utc;
use uuid::Uuid;
use serde_json::json;
use std::sync::Arc;

use crate::common::test_utils::{
    create_test_app,
    create_test_user,
    create_test_property,
    create_test_qr_code,
    create_test_qr_code_with_timestamp,
};

use handreceipt::{
    api::{
        handlers::mobile::{ScanRequest, ScanResponse},
        routes,
    },
    types::app::PropertyService,
    application::transfer::commands::TransferCommandService,
    domain::models::{
        qr::QRCodeService,
        transfer::TransferStatus,
    },
};

#[actix_web::test]
async fn test_mobile_qr_scan_workflow() {
    // Create test app
    let app = create_test_app();
    let app = test::init_service(app).await;

    // Create test user
    let user = create_test_user("TEST_USER", "SOLDIER").await;
    
    // Create test property
    let property = create_test_property("Test Item", false).await;
    
    // Generate QR code
    let qr_code = create_test_qr_code(property.id()).await;

    // Test QR scan
    let scan_request = ScanRequest {
        qr_data: qr_code.metadata["qr_code"].as_str().unwrap().to_string(),
        device_id: "TEST_DEVICE".to_string(),
        location: Some("TEST_LOCATION".to_string()),
        offline_id: Some("TEST_OFFLINE_1".to_string()),
        scanned_at: Utc::now(),
    };

    let resp = test::TestRequest::post()
        .uri("/api/v1/mobile/scan")
        .set_json(&scan_request)
        .insert_header(("Authorization", format!("Bearer {}", user.token)))
        .send_request(&app)
        .await;

    assert!(resp.status().is_success());

    let scan_response: ScanResponse = test::read_body_json(resp).await;
    assert_eq!(scan_response.property.id, property.id());
    assert_eq!(scan_response.status, TransferStatus::InProgress);
    assert!(scan_response.offline_sync_id.is_some());

    // Test property lookup
    let resp = test::TestRequest::get()
        .uri(&format!("/api/v1/mobile/property/{}", property.id()))
        .insert_header(("Authorization", format!("Bearer {}", user.token)))
        .send_request(&app)
        .await;

    assert!(resp.status().is_success());

    // Test sync status
    let resp = test::TestRequest::get()
        .uri(&format!("/api/v1/mobile/sync/{}", scan_response.offline_sync_id.unwrap()))
        .insert_header(("Authorization", format!("Bearer {}", user.token)))
        .send_request(&app)
        .await;

    assert!(resp.status().is_success());
}

#[actix_web::test]
async fn test_mobile_offline_sync() {
    // Create test app
    let app = create_test_app();
    let app = test::init_service(app).await;

    // Create test user
    let user = create_test_user("TEST_USER", "SOLDIER").await;
    
    // Create multiple offline scans
    let offline_scans = vec![
        ScanRequest {
            qr_data: create_test_qr_code(Uuid::new_v4()).await.metadata["qr_code"].as_str().unwrap().to_string(),
            device_id: "TEST_DEVICE".to_string(),
            location: Some("LOCATION_1".to_string()),
            offline_id: Some("OFFLINE_1".to_string()),
            scanned_at: Utc::now(),
        },
        ScanRequest {
            qr_data: create_test_qr_code(Uuid::new_v4()).await.metadata["qr_code"].as_str().unwrap().to_string(),
            device_id: "TEST_DEVICE".to_string(),
            location: Some("LOCATION_2".to_string()),
            offline_id: Some("OFFLINE_2".to_string()),
            scanned_at: Utc::now(),
        },
    ];

    // Process offline scans
    for scan in offline_scans {
        let resp = test::TestRequest::post()
            .uri("/api/v1/mobile/scan")
            .set_json(&scan)
            .insert_header(("Authorization", format!("Bearer {}", user.token)))
            .send_request(&app)
            .await;

        assert!(resp.status().is_success());

        // Check sync status
        let resp = test::TestRequest::get()
            .uri(&format!("/api/v1/mobile/sync/{}", scan.offline_id.unwrap()))
            .insert_header(("Authorization", format!("Bearer {}", user.token)))
            .send_request(&app)
            .await;

        assert!(resp.status().is_success());
    }
}

#[actix_web::test]
async fn test_mobile_error_handling() {
    // Create test app
    let app = create_test_app();
    let app = test::init_service(app).await;

    // Create test user
    let user = create_test_user("TEST_USER", "SOLDIER").await;

    // Test invalid QR code
    let scan_request = ScanRequest {
        qr_data: "INVALID_QR_DATA".to_string(),
        device_id: "TEST_DEVICE".to_string(),
        location: None,
        offline_id: None,
        scanned_at: Utc::now(),
    };

    let resp = test::TestRequest::post()
        .uri("/api/v1/mobile/scan")
        .set_json(&scan_request)
        .insert_header(("Authorization", format!("Bearer {}", user.token)))
        .send_request(&app)
        .await;

    assert!(resp.status().is_client_error());

    // Test expired QR code
    let expired_qr = create_test_qr_code_with_timestamp(
        Uuid::new_v4(),
        Utc::now() - chrono::Duration::hours(25),
    ).await;

    let scan_request = ScanRequest {
        qr_data: expired_qr.metadata["qr_code"].as_str().unwrap().to_string(),
        device_id: "TEST_DEVICE".to_string(),
        location: None,
        offline_id: None,
        scanned_at: Utc::now(),
    };

    let resp = test::TestRequest::post()
        .uri("/api/v1/mobile/scan")
        .set_json(&scan_request)
        .insert_header(("Authorization", format!("Bearer {}", user.token)))
        .send_request(&app)
        .await;

    assert!(resp.status().is_client_error());

    // Test invalid property ID
    let resp = test::TestRequest::get()
        .uri(&format!("/api/v1/mobile/property/{}", Uuid::new_v4()))
        .insert_header(("Authorization", format!("Bearer {}", user.token)))
        .send_request(&app)
        .await;

    assert!(resp.status().is_client_error());
}

#[actix_web::test]
async fn test_mobile_sensitive_items() {
    // Create test app
    let app = create_test_app();
    let app = test::init_service(app).await;

    // Create test users
    let soldier = create_test_user("SOLDIER_USER", "SOLDIER").await;
    let officer = create_test_user("OFFICER_USER", "OFFICER").await;
    
    // Create sensitive property
    let property = create_test_property("Sensitive Item", true).await;
    let qr_code = create_test_qr_code(property.id()).await;

    // Test soldier scanning sensitive item
    let scan_request = ScanRequest {
        qr_data: qr_code.metadata["qr_code"].as_str().unwrap().to_string(),
        device_id: "TEST_DEVICE".to_string(),
        location: None,
        offline_id: None,
        scanned_at: Utc::now(),
    };

    let resp = test::TestRequest::post()
        .uri("/api/v1/mobile/scan")
        .set_json(&scan_request)
        .insert_header(("Authorization", format!("Bearer {}", soldier.token)))
        .send_request(&app)
        .await;

    assert!(resp.status().is_success());

    let scan_response: ScanResponse = test::read_body_json(resp).await;
    assert!(scan_response.requires_approval);
    assert_eq!(scan_response.status, TransferStatus::Pending);

    // Test officer approval
    let resp = test::TestRequest::post()
        .uri(&format!("/api/v1/transfer/{}/approve", scan_response.scan_id))
        .set_json(json!({ "notes": "Approved by officer" }))
        .insert_header(("Authorization", format!("Bearer {}", officer.token)))
        .send_request(&app)
        .await;

    assert!(resp.status().is_success());
}
