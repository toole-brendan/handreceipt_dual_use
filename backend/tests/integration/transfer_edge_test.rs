use actix_web::{test, web, App};
use futures::future::join_all;
use std::collections::HashSet;
use uuid::Uuid;
use chrono::Utc;

use crate::common::test_utils::{
    create_test_app,
    create_test_user,
    create_test_property,
    create_test_qr_code,
    TestContext,
};

use handreceipt::{
    api::handlers::{
        mobile::ScanRequest,
        transfer::ApproveTransferRequest,
    },
    domain::models::transfer::TransferStatus,
};

/// Tests blockchain consensus with multiple authority nodes
#[actix_web::test]
async fn test_blockchain_consensus() {
    // Create test app with multiple authority nodes
    let app = create_test_app();
    let app = test::init_service(app).await;

    // Create test users
    let soldier = create_test_user("SOLDIER", "SOLDIER").await;
    let officer = create_test_user("OFFICER", "OFFICER").await;

    // Create and transfer sensitive property
    let property = create_test_property("Sensitive Item", true).await;
    let qr_code = create_test_qr_code(property.id()).await;

    // Initiate transfer
    let scan_request = ScanRequest {
        qr_data: qr_code.id.to_string(),
        device_id: "TEST_DEVICE".to_string(),
        location: Some("TEST_LOCATION".to_string()),
        offline_id: None,
        scanned_at: Utc::now(),
    };

    let scan_resp = test::TestRequest::post()
        .uri("/api/v1/mobile/scan")
        .set_json(&scan_request)
        .insert_header(("Authorization", format!("Bearer {}", soldier.token)))
        .send_request(&app)
        .await;

    assert!(scan_resp.status().is_success());

    // Get transfer ID from response
    let scan_result: serde_json::Value = test::read_body_json(scan_resp).await;
    let transfer_id = scan_result["scan_id"].as_str().unwrap();

    // Approve transfer with multiple authority nodes
    let approve_request = ApproveTransferRequest {
        notes: Some("Approved by multiple authorities".to_string()),
    };

    // Simulate multiple authority nodes approving
    let authority_responses = join_all((0..3).map(|i| {
        let app = &app;
        let req = test::TestRequest::post()
            .uri(&format!("/api/v1/transfer/{}/approve", transfer_id))
            .set_json(&approve_request)
            .insert_header(("Authorization", format!("Bearer {}", officer.token)))
            .insert_header(("Authority-Node-ID", format!("NODE_{}", i)));

        async move {
            let resp = req.send_request(app).await;
            test::read_body_json::<serde_json::Value>(resp).await
        }
    }))
    .await;

    // Verify consensus
    let blockchain_hashes: HashSet<_> = authority_responses
        .iter()
        .filter_map(|r| r["blockchain_hash"].as_str())
        .collect();

    assert_eq!(blockchain_hashes.len(), 1, "All nodes should agree on the same hash");
}

/// Tests concurrent transfers of the same property
#[actix_web::test]
async fn test_concurrent_transfers() {
    let app = create_test_app();
    let app = test::init_service(app).await;

    // Create test property
    let property = create_test_property("Test Item", false).await;
    let qr_code = create_test_qr_code(property.id()).await;

    // Create multiple users
    let users = join_all((0..5).map(|i| create_test_user(&format!("USER_{}", i), "SOLDIER"))).await;

    // Attempt concurrent transfers
    let transfer_results = join_all(users.iter().map(|user| {
        let scan_request = ScanRequest {
            qr_data: qr_code.id.to_string(),
            device_id: format!("DEVICE_{}", user.id),
            location: Some("TEST_LOCATION".to_string()),
            offline_id: None,
            scanned_at: Utc::now(),
        };

        let app = &app;
        async move {
            let resp = test::TestRequest::post()
                .uri("/api/v1/mobile/scan")
                .set_json(&scan_request)
                .insert_header(("Authorization", format!("Bearer {}", user.token)))
                .send_request(app)
                .await;

            (user.id.clone(), test::read_body_json::<serde_json::Value>(resp).await)
        }
    }))
    .await;

    // Verify only one transfer succeeded
    let successful_transfers: Vec<_> = transfer_results
        .iter()
        .filter(|(_, r)| r["status"] == "InProgress")
        .collect();

    assert_eq!(successful_transfers.len(), 1, "Only one transfer should succeed");
}

/// Tests handling of large property books
#[actix_web::test]
async fn test_large_property_book() {
    let app = create_test_app();
    let app = test::init_service(app).await;

    // Create test users
    let officer = create_test_user("OFFICER", "OFFICER").await;
    
    // Create large number of properties
    let properties = join_all((0..1000).map(|i| {
        create_test_property(&format!("Item {}", i), i % 5 == 0) // Every 5th item is sensitive
    }))
    .await;

    // Test property book query performance
    let resp = test::TestRequest::get()
        .uri("/api/v1/property/book")
        .insert_header(("Authorization", format!("Bearer {}", officer.token)))
        .send_request(&app)
        .await;

    assert!(resp.status().is_success());

    // Test property search
    let search_resp = test::TestRequest::get()
        .uri("/api/v1/property/search?is_sensitive=true")
        .insert_header(("Authorization", format!("Bearer {}", officer.token)))
        .send_request(&app)
        .await;

    assert!(search_resp.status().is_success());

    let search_results: serde_json::Value = test::read_body_json(search_resp).await;
    assert_eq!(
        search_results.as_array().unwrap().len(),
        200,  // Should be 1/5 of total properties
        "Should find all sensitive items"
    );
}

/// Tests edge cases in transfer workflow
#[actix_web::test]
async fn test_transfer_edge_cases() {
    let app = create_test_app();
    let app = test::init_service(app).await;

    let test_cases = vec![
        // Case 1: Transfer with expired QR code
        async {
            let ctx = TestContext::new("SOLDIER").await;
            let expired_qr = create_test_qr_code_with_timestamp(
                ctx.property.id(),
                Utc::now() - chrono::Duration::hours(25),
            ).await;

            let scan_request = ScanRequest {
                qr_data: expired_qr.id.to_string(),
                device_id: "TEST_DEVICE".to_string(),
                location: None,
                offline_id: None,
                scanned_at: Utc::now(),
            };

            let resp = test::TestRequest::post()
                .uri("/api/v1/mobile/scan")
                .set_json(&scan_request)
                .insert_header(("Authorization", format!("Bearer {}", ctx.user.token)))
                .send_request(&app)
                .await;

            assert!(resp.status().is_client_error());
        },

        // Case 2: Transfer already transferred property
        async {
            let ctx = TestContext::new("SOLDIER").await;
            
            // First transfer
            let scan_request = ScanRequest {
                qr_data: ctx.qr_code.id.to_string(),
                device_id: "TEST_DEVICE".to_string(),
                location: None,
                offline_id: None,
                scanned_at: Utc::now(),
            };

            let _ = test::TestRequest::post()
                .uri("/api/v1/mobile/scan")
                .set_json(&scan_request)
                .insert_header(("Authorization", format!("Bearer {}", ctx.user.token)))
                .send_request(&app)
                .await;

            // Second transfer attempt
            let resp = test::TestRequest::post()
                .uri("/api/v1/mobile/scan")
                .set_json(&scan_request)
                .insert_header(("Authorization", format!("Bearer {}", ctx.user.token)))
                .send_request(&app)
                .await;

            assert!(resp.status().is_client_error());
        },

        // Case 3: Transfer to self
        async {
            let ctx = TestContext::new("SOLDIER").await;
            let scan_request = ScanRequest {
                qr_data: ctx.qr_code.id.to_string(),
                device_id: "TEST_DEVICE".to_string(),
                location: None,
                offline_id: None,
                scanned_at: Utc::now(),
            };

            let resp = test::TestRequest::post()
                .uri("/api/v1/mobile/scan")
                .set_json(&scan_request)
                .insert_header(("Authorization", format!("Bearer {}", ctx.user.token)))
                .send_request(&app)
                .await;

            assert!(resp.status().is_client_error());
        },

        // Case 4: Approve already approved transfer
        async {
            let soldier = create_test_user("SOLDIER", "SOLDIER").await;
            let officer = create_test_user("OFFICER", "OFFICER").await;
            
            let property = create_test_property("Sensitive Item", true).await;
            let qr_code = create_test_qr_code(property.id()).await;

            // Initiate transfer
            let scan_request = ScanRequest {
                qr_data: qr_code.id.to_string(),
                device_id: "TEST_DEVICE".to_string(),
                location: None,
                offline_id: None,
                scanned_at: Utc::now(),
            };

            let scan_resp = test::TestRequest::post()
                .uri("/api/v1/mobile/scan")
                .set_json(&scan_request)
                .insert_header(("Authorization", format!("Bearer {}", soldier.token)))
                .send_request(&app)
                .await;

            let scan_result: serde_json::Value = test::read_body_json(scan_resp).await;
            let transfer_id = scan_result["scan_id"].as_str().unwrap();

            // First approval
            let approve_request = ApproveTransferRequest {
                notes: Some("First approval".to_string()),
            };

            let _ = test::TestRequest::post()
                .uri(&format!("/api/v1/transfer/{}/approve", transfer_id))
                .set_json(&approve_request)
                .insert_header(("Authorization", format!("Bearer {}", officer.token)))
                .send_request(&app)
                .await;

            // Second approval attempt
            let resp = test::TestRequest::post()
                .uri(&format!("/api/v1/transfer/{}/approve", transfer_id))
                .set_json(&approve_request)
                .insert_header(("Authorization", format!("Bearer {}", officer.token)))
                .send_request(&app)
                .await;

            assert!(resp.status().is_client_error());
        },
    ];

    // Run all test cases
    join_all(test_cases).await;
}
