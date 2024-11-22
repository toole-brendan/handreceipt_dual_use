use std::sync::Arc;
use uuid::Uuid;
use chrono::{Utc, Duration};

use crate::{
    services::{
        asset::tracking::{
            location::LocationService,
            accuracy::AccuracyService,
            history::HistoryService,
        },
        infrastructure::database::DatabaseService,
    },
    types::{
        asset::{PointWrapper, LocationMetadata, AssetStatus},
        security::SecurityClassification,
        scanning::GeoPoint,
        error::CoreError,
    },
};

async fn setup_test_environment() -> (
    Arc<LocationService>,
    Arc<AccuracyService>,
    Arc<HistoryService>,
    Uuid,
) {
    let db = Arc::new(DatabaseService::new().await);
    let location_service = Arc::new(LocationService::new(db.clone()));
    let accuracy_service = Arc::new(AccuracyService::new(db.clone()));
    let history_service = Arc::new(HistoryService::new(db.clone()));
    
    let asset_id = Uuid::new_v4();
    
    (location_service, accuracy_service, history_service, asset_id)
}

#[tokio::test]
async fn test_complete_location_tracking_flow() {
    let (location_service, accuracy_service, history_service, asset_id) = setup_test_environment().await;
    
    // 1. Record initial location with high accuracy
    let initial_location = GeoPoint {
        latitude: 40.7128,
        longitude: -74.0060,
        altitude: None,
        accuracy: Some(5.0),
    };
    
    location_service.record_location(
        asset_id,
        &initial_location,
        SecurityClassification::Unclassified,
    ).await.unwrap();

    // 2. Record accuracy metrics
    let accuracy_metrics = LocationMetadata {
        timestamp: Utc::now(),
        location: PointWrapper { x: initial_location.longitude, y: initial_location.latitude },
        accuracy: initial_location.accuracy.unwrap(),
        source: "GPS".to_string(),
        metadata: [
            ("hdop".to_string(), "1.2".to_string()),
            ("pdop".to_string(), "2.1".to_string()),
            ("satellites".to_string(), "8".to_string()),
        ].iter().cloned().collect(),
    };

    accuracy_service.record_metrics(
        asset_id,
        &accuracy_metrics,
        SecurityClassification::Unclassified,
    ).await.unwrap();

    // 3. Verify location history is recorded
    let history = history_service.get_history(
        asset_id,
        Utc::now() - Duration::hours(1),
        Utc::now(),
        SecurityClassification::TopSecret,
    ).await.unwrap();

    assert!(!history.is_empty());
    let latest = &history[0];
    assert_eq!(latest.asset_id, asset_id);
    assert_eq!(latest.accuracy, initial_location.accuracy);

    // 4. Test location update decision
    let new_location = GeoPoint {
        latitude: 40.7129,
        longitude: -74.0061,
        altitude: None,
        accuracy: Some(5.0),
    };

    let should_update = location_service.should_update_location(
        asset_id,
        &new_location,
        85, // Battery level
    ).await.unwrap();

    // Should update because of sufficient battery and movement
    assert!(should_update);
}

#[tokio::test]
async fn test_location_accuracy_degradation() {
    let (location_service, accuracy_service, _, asset_id) = setup_test_environment().await;
    
    // 1. Record series of locations with decreasing accuracy
    let locations = vec![
        GeoPoint { latitude: 40.7128, longitude: -74.0060, altitude: None, accuracy: Some(5.0) },
        GeoPoint { latitude: 40.7129, longitude: -74.0061, altitude: None, accuracy: Some(10.0) },
        GeoPoint { latitude: 40.7130, longitude: -74.0062, altitude: None, accuracy: Some(20.0) },
    ];

    for location in locations {
        location_service.record_location(
            asset_id,
            &location,
            SecurityClassification::Unclassified,
        ).await.unwrap();

        // Record corresponding accuracy metrics
        let metrics = LocationMetadata {
            timestamp: Utc::now(),
            location: PointWrapper { x: location.longitude, y: location.latitude },
            accuracy: location.accuracy.unwrap(),
            source: "GPS".to_string(),
            metadata: [
                ("hdop".to_string(), (location.accuracy.unwrap() / 4.0).to_string()),
                ("pdop".to_string(), (location.accuracy.unwrap() / 2.0).to_string()),
                ("satellites".to_string(), (12 - (location.accuracy.unwrap() as i32 / 5)).to_string()),
            ].iter().cloned().collect(),
        };

        accuracy_service.record_metrics(
            asset_id,
            &metrics,
            SecurityClassification::Unclassified,
        ).await.unwrap();
    }

    // 2. Verify accuracy trend
    let avg_accuracy = accuracy_service
        .calculate_average_accuracy(asset_id, Duration::minutes(60))
        .await
        .unwrap();

    assert!(avg_accuracy > 10.0); // Average should reflect degradation
}

#[tokio::test]
async fn test_location_classification_boundaries() {
    let (location_service, _, history_service, asset_id) = setup_test_environment().await;
    
    // 1. Record locations with different classification levels
    let test_cases = vec![
        (GeoPoint::new(40.7128, -74.0060), SecurityClassification::Unclassified),
        (GeoPoint::new(40.7129, -74.0061), SecurityClassification::Confidential),
        (GeoPoint::new(40.7130, -74.0062), SecurityClassification::Secret),
    ];

    for (location, classification) in test_cases {
        location_service.record_location(
            asset_id,
            &location,
            classification,
        ).await.unwrap();
    }

    // 2. Verify access control based on classification
    for classification in &[
        SecurityClassification::Unclassified,
        SecurityClassification::Confidential,
        SecurityClassification::Secret,
    ] {
        let history = history_service.get_history(
            asset_id,
            Utc::now() - Duration::hours(1),
            Utc::now(),
            *classification,
        ).await.unwrap();

        // Should only see locations up to our classification level
        for entry in history {
            assert!(entry.classification <= *classification);
        }
    }
}
