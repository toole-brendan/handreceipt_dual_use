// backend/src/models/location.rs

use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use postgis::Point;

use crate::core::SecurityClassification;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocationMetadata {
    pub timestamp: DateTime<Utc>,
    pub point: Point,
    pub accuracy: f64,
    pub source: LocationSource,
    pub classification: SecurityClassification,
    pub asset_id: Uuid,
    pub verified: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LocationSource {
    GPS,
    Network,
    Manual,
    Beacon,
    RFIDScan,
    QRScan,
}

impl LocationMetadata {
    pub fn new(
        point: Point,
        accuracy: f64,
        source: LocationSource,
        classification: SecurityClassification,
        asset_id: Uuid,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            point,
            accuracy,
            source,
            classification,
            asset_id,
            verified: false,
        }
    }

    pub fn verify(&mut self) {
        self.verified = true;
    }
}

