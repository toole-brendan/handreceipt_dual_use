use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub latitude: f64,
    pub longitude: f64,
    pub altitude: Option<f64>,
    pub accuracy: Option<f64>,
    pub building: String,
    pub room: Option<String>,
    pub notes: Option<String>,
    pub grid_coordinates: Option<String>,
}

impl Location {
    pub fn new(latitude: f64, longitude: f64, building: String) -> Self {
        Self {
            latitude,
            longitude,
            altitude: None,
            accuracy: None,
            building,
            room: None,
            notes: None,
            grid_coordinates: None,
        }
    }
}
