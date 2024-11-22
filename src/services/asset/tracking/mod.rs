pub mod location;
pub mod history;

pub use self::location::{AssetLocation, LocationSource, LocationTracker};
pub use self::history::{LocationHistory, HistoryEntry, HistoryManager};

#[derive(Debug, thiserror::Error)]
pub enum TrackingError {
    #[error("Location error: {0}")]
    Location(String),
    
    #[error("History error: {0}")]
    History(String),
} 