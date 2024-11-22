use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::str::FromStr;
use tokio_postgres::types::{ToSql, FromSql, Type, IsNull};
use bytes::BytesMut;
use postgres_types::{accepts, to_sql_checked};
use uuid::Uuid;

use super::error::CoreError;
use super::security::SecurityClassification;

/// Represents a complete asset
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Asset {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub status: AssetStatus,
    pub classification: SecurityClassification,
    pub metadata: HashMap<String, String>,
    pub signatures: Vec<CommandSignature>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub qr_code: Option<String>,
    pub last_verified: Option<DateTime<Utc>>,
    pub verification_count: i32,
    pub rfid_tag_id: Option<String>,
    pub rfid_last_scanned: Option<DateTime<Utc>>,
    pub token_id: Option<Uuid>,
    pub current_custodian: Option<String>,
    pub hand_receipt_hash: Option<String>,
    pub last_known_location: Option<PointWrapper>,
    pub location_history: Vec<LocationMetadata>,
    pub geofence_restrictions: Vec<Uuid>,
    pub location_classification: SecurityClassification,
}

/// Represents the status of an asset
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum AssetStatus {
    Active,
    InTransit,
    Inactive,
    Pending,
    Archived,
    Deleted,
}

/// Represents a command signature
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CommandSignature {
    pub id: Uuid,
    pub signer_id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub signature: String,
    pub metadata: HashMap<String, String>,
}

/// Represents location metadata
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LocationMetadata {
    pub timestamp: DateTime<Utc>,
    pub location: PointWrapper,
    pub accuracy: f64,
    pub source: String,
    pub metadata: HashMap<String, String>,
}

/// Wrapper for PostGIS points
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PointWrapper {
    pub x: f64,
    pub y: f64,
}

impl Asset {
    pub fn new(name: String, description: String, classification: SecurityClassification) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            description,
            status: AssetStatus::Active,
            classification,
            metadata: HashMap::new(),
            signatures: Vec::new(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            qr_code: None,
            last_verified: None,
            verification_count: 0,
            rfid_tag_id: None,
            rfid_last_scanned: None,
            token_id: None,
            current_custodian: None,
            hand_receipt_hash: None,
            last_known_location: None,
            location_history: Vec::new(),
            geofence_restrictions: Vec::new(),
            location_classification: SecurityClassification::Unclassified,
        }
    }

    pub fn update_metadata(&mut self, key: String, value: String) {
        self.metadata.insert(key, value);
        self.updated_at = Utc::now();
    }

    pub fn add_signature(&mut self, signature: CommandSignature) {
        self.signatures.push(signature);
        self.updated_at = Utc::now();
    }

    pub fn verify_scan(&mut self) {
        self.last_verified = Some(Utc::now());
        self.verification_count += 1;
        self.updated_at = Utc::now();
    }
}

impl std::fmt::Display for AssetStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AssetStatus::Active => write!(f, "ACTIVE"),
            AssetStatus::InTransit => write!(f, "IN_TRANSIT"),
            AssetStatus::Inactive => write!(f, "INACTIVE"),
            AssetStatus::Pending => write!(f, "PENDING"),
            AssetStatus::Archived => write!(f, "ARCHIVED"),
            AssetStatus::Deleted => write!(f, "DELETED"),
        }
    }
}

impl FromStr for AssetStatus {
    type Err = CoreError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_uppercase().as_str() {
            "ACTIVE" => Ok(AssetStatus::Active),
            "IN_TRANSIT" => Ok(AssetStatus::InTransit),
            "INACTIVE" => Ok(AssetStatus::Inactive),
            "PENDING" => Ok(AssetStatus::Pending),
            "ARCHIVED" => Ok(AssetStatus::Archived),
            "DELETED" => Ok(AssetStatus::Deleted),
            _ => Err(CoreError::ValidationError(
                format!("Invalid asset status: {}", s)
            )),
        }
    }
}

impl ToSql for AssetStatus {
    fn to_sql(&self, ty: &Type, out: &mut BytesMut) -> Result<IsNull, Box<dyn std::error::Error + Send + Sync>> {
        let s = self.to_string();
        s.to_sql(ty, out)
    }

    accepts!(VARCHAR, TEXT);

    to_sql_checked!();
}

impl<'a> FromSql<'a> for AssetStatus {
    fn from_sql(ty: &Type, raw: &'a [u8]) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let s = <String as FromSql>::from_sql(ty, raw)?;
        AssetStatus::from_str(&s)
            .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)
    }

    accepts!(VARCHAR, TEXT);
}
