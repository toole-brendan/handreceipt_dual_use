pub mod history;
pub mod location;

// Re-export commonly used types from history
pub use self::history::{
    TrackingRecord,
    TrackingEventType,
    TrackingHistory,
    TrackingError as HistoryError,
};

// Re-export commonly used types from location
pub use self::location::{
    LocationUpdate,
    LocationTracker,
    LocationError,
};

// Convenience function to create tracking services
pub fn create_tracking_services(
    db: crate::infrastructure::database::DatabaseService,
) -> (TrackingHistory, LocationTracker) {
    let history = TrackingHistory::new(db.clone());
    let location = LocationTracker::new(db);
    (history, location)
}

// Helper function to determine if location tracking is supported for an asset type
pub fn supports_location_tracking(asset_type: &str) -> bool {
    matches!(
        asset_type,
        "vehicle" | "container" | "equipment" | "mobile_device" | "shipment"
    )
}
