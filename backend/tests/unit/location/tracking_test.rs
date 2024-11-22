use std::sync::Arc;
use uuid::Uuid;
use chrono::Utc;
use postgis::ewkb::Point;
use crate::services::{
    location::{
        accuracy::{AccuracyManager, AccuracyMetrics},
        battery::{BatteryManager, BatteryConfig, BatteryStatus},
        history::{LocationHistoryManager, LocationHistory},
        postgis::tracker::LocationTracker,
    },
    database::postgresql::connection::DbPool,
};

#[tokio::test]
async fn test_location_tracking() {
    let pool = DbPool::new().await;
    let tracker = LocationTracker::new(pool.clone());
    let asset_id = Uuid::new_v4();

    // Test recording location
    let result = tracker.record_location(
        asset_id,
        40.7128,  // latitude
        -74.0060, // longitude
        Some(10.0),// accuracy in meters
        0,        // classification level
    ).await;
    assert!(result.is_ok());

    // Test retrieving latest location
    let location = tracker.get_latest_location(asset_id).await.unwrap().unwrap();
    assert_eq!(location.1, 40.7128); // latitude
    assert_eq!(location.0, -74.0060); // longitude
    assert_eq!(location.2, Some(10.0)); // accuracy
}

#[tokio::test]
async fn test_accuracy_tracking() {
    let pool = DbPool::new().await;
    let accuracy_manager = AccuracyManager::new(pool);
    let asset_id = Uuid::new_v4();

    // Test metrics recording
    let metrics = AccuracyMetrics {
        horizontal_accuracy: 5.0,
        vertical_accuracy: Some(10.0),
        confidence_level: 0.95,
        hdop: Some(1.2),
        pdop: Some(2.1),
        satellite_count: Some(8),
    };

    let result = accuracy_manager.record_accuracy(
        asset_id,
        metrics.clone(),
        0, // classification level
    ).await;
    assert!(result.is_ok());

    // Test retrieving latest accuracy
    let latest = accuracy_manager.get_latest_accuracy(asset_id).await.unwrap().unwrap();
    assert_eq!(latest.horizontal_accuracy, metrics.horizontal_accuracy);
    assert_eq!(latest.confidence_level, metrics.confidence_level);
}

#[tokio::test]
async fn test_battery_management() {
    let pool = DbPool::new().await;
    let config = BatteryConfig {
        critical_threshold: 15,
        low_threshold: 30,
        medium_threshold: 70,
        min_interval: 30,
        max_interval: 300,
        movement_threshold: 10.0,
    };
    let battery_manager = BatteryManager::new(pool, Some(config));
    let asset_id = Uuid::new_v4();

    // Test battery level recording
    let result = battery_manager.record_battery_level(
        asset_id,
        85, // battery level
        false, // not charging
    ).await;
    assert!(result.is_ok());

    // Test battery status determination
    let status = battery_manager.get_battery_status(85);
    assert!(matches!(status, BatteryStatus::High));

    // Test update interval calculation
    let interval = battery_manager.get_update_interval(status, true);
    assert_eq!(interval.as_secs(), 30); // min_interval for high battery + movement
}

#[tokio::test]
async fn test_location_history() {
    let pool = DbPool::new().await;
    let history_manager = LocationHistoryManager::new(pool);
    let asset_id = Uuid::new_v4();

    // Create test location history
    let history = LocationHistory {
        asset_id,
        location: Point::new(-74.0060, 40.7128, Some(4326)),
        timestamp: Utc::now(),
        accuracy: Some(5.0),
        altitude: Some(100.0),
        heading: Some(45.0),
        speed: Some(5.0),
        classification_level: 0,
    };

    // Test recording history
    let result = history_manager.record_history(history.clone()).await;
    assert!(result.is_ok());

    // Test retrieving history
    let histories = history_manager.get_asset_history(
        asset_id,
        Utc::now() - chrono::Duration::hours(1),
        Utc::now(),
        0, // user classification level
    ).await.unwrap();

    assert!(!histories.is_empty());
    let latest = &histories[0];
    assert_eq!(latest.asset_id, asset_id);
    assert_eq!(latest.accuracy, history.accuracy);
    assert_eq!(latest.classification_level, history.classification_level);
}
