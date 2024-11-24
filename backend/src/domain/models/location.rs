// backend/src/models/location.rs

use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub building: String,
    pub room: Option<String>,
    pub notes: Option<String>,
    pub grid_coordinates: Option<String>,
}

