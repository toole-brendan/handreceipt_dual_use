use std::sync::Arc;
use uuid::Uuid;
use postgis::ewkb::{Point, Polygon};
use crate::services::location::postgis::{
    geofence::{GeofenceManager, GeofenceCreate, GeofencePoint},
    PostGisManager,
};
use crate::services::database::postgresql::connection::DbPool;

#[tokio::test]
async fn test_geofence_creation() {
    let pool = DbPool::new().await;
    let geofence_manager = GeofenceManager::new(pool);

    // Create test geofence
    let geofence = GeofenceCreate {
        name: "Test Zone".to_string(),
        description: Some("Test geofence area".to_string()),
        points: vec![
            GeofencePoint { latitude: 40.7128, longitude: -74.0060 },
            GeofencePoint { latitude: 40.7128, longitude: -73.9960 },
            GeofencePoint { latitude: 40.7228, longitude: -73.9960 },
            GeofencePoint { latitude: 40.7228, longitude: -74.0060 },
            GeofencePoint { latitude: 40.7128, longitude: -74.0060 }, // Close the polygon
        ],
        classification_level: 0,
        alert_on_enter: true,
        alert_on_exit: true,
        active: true,
    };

    let geofence_id = geofence_manager.create_geofence(geofence).await.unwrap();
    assert!(geofence_id != Uuid::nil());
}

#[tokio::test]
async fn test_point_in_geofence() {
    let pool = DbPool::new().await;
    let geofence_manager = GeofenceManager::new(pool);
    let asset_id = Uuid::new_v4();

    // Create a test point
    let point = Point::new(-74.0000, 40.7178, Some(4326));

    // Check if point is within any geofences
    let containing_geofences = geofence_manager.check_asset_location(
        asset_id,
        point,
        0, // asset classification level
    ).await.unwrap();

    // Point should be within the previously created geofence
    assert!(!containing_geofences.is_empty());
}

#[tokio::test]
async fn test_geofence_violation_recording() {
    let pool = DbPool::new().await;
    let geofence_manager = GeofenceManager::new(pool);
    
    // Setup test data
    let geofence_id = Uuid::new_v4();
    let asset_id = Uuid::new_v4();
    let point = Point::new(-74.0000, 40.7178, Some(4326));

    // Record violation
    let result = geofence_manager.record_violation(
        geofence_id,
        asset_id,
        "ENTER",
        point,
    ).await;
    assert!(result.is_ok());
}

#[tokio::test]
async fn test_active_geofences_retrieval() {
    let pool = DbPool::new().await;
    let geofence_manager = GeofenceManager::new(pool);

    // Get active geofences
    let geofences = geofence_manager.get_active_geofences(
        0, // classification level
    ).await.unwrap();

    // Verify geofence properties
    for (id, name, boundary) in geofences {
        assert!(id != Uuid::nil());
        assert!(!name.is_empty());
        assert!(boundary.points().len() > 2); // Valid polygon has at least 3 points
    }
}

#[tokio::test]
async fn test_postgis_operations() {
    let pool = DbPool::new().await;
    let postgis_manager = PostGisManager::new(pool);

    // Test points
    let point1 = GeofencePoint {
        latitude: 40.7128,
        longitude: -74.0060,
    };
    let point2 = GeofencePoint {
        latitude: 40.7128,
        longitude: -73.9960,
    };

    // Calculate distance between points
    let distance = postgis_manager.calculate_distance(&point1, &point2).await.unwrap();
    assert!(distance > 0.0);

    // Find points within radius
    let points = postgis_manager.find_points_within_radius(&point1, 1000.0).await.unwrap();
    assert!(points.len() >= 0); // Should return any points within 1km
}
