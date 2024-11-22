// backend/src/models/mod.rs

mod types;
mod qr;
pub mod transfer;
pub mod signature;
pub mod blockchain;
pub mod verification;
pub mod error;
pub mod network;
pub mod scanning;
pub mod asset;

pub use qr::*;
pub use signature::{SignatureType, CommandSignature};
pub use blockchain::{Block, Transaction, BlockchainTransaction, BlockchainNode};
pub use verification::{VerificationStatus, ValidationStatus, SignatureContext, SignatureStatus};
pub use error::CoreError;
pub use network::{MeshNode, NodeType, NodeStatus, SyncOperation, SyncType, Priority};
pub use scanning::{ScanResult, ScanType, RFIDTag, RFIDTagType};
pub use asset::{Asset, AssetStatus};

use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use postgres_types::{ToSql, FromSql, Type};
use bytes::BytesMut;
use postgres_types::to_sql_checked;
use postgis::ewkb::Point;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeoPoint {
    pub x: f64,
    pub y: f64,
    pub srid: Option<i32>,
}

impl From<postgis::ewkb::Point> for GeoPoint {
    fn from(point: postgis::ewkb::Point) -> Self {
        GeoPoint {
            x: point.x,
            y: point.y,
            srid: point.srid,
        }
    }
}

impl Into<postgis::ewkb::Point> for GeoPoint {
    fn into(self) -> postgis::ewkb::Point {
        postgis::ewkb::Point::new(
            self.x,
            self.y,
            self.srid,
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocationMetadata {
    pub timestamp: DateTime<Utc>,
    pub location: GeoPoint,
    pub accuracy: f64,
    pub source: String,
    pub verified: bool,
}

#[derive(Debug, Clone)]
pub struct UuidWrapper(pub Uuid);

impl tokio_postgres::types::ToSql for UuidWrapper {
    fn to_sql(&self, ty: &tokio_postgres::types::Type, out: &mut bytes::BytesMut) -> Result<tokio_postgres::types::IsNull, Box<dyn std::error::Error + Sync + Send>> {
        self.0.to_sql(ty, out)
    }

    fn accepts(ty: &tokio_postgres::types::Type) -> bool {
        <Uuid as tokio_postgres::types::ToSql>::accepts(ty)
    }

    to_sql_checked!();
}

#[derive(Debug, Clone)]
pub struct PointWrapper(pub Point);

impl Serialize for PointWrapper {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("Point", 3)?;
        state.serialize_field("x", &self.0.x)?;
        state.serialize_field("y", &self.0.y)?;
        state.serialize_field("srid", &self.0.srid)?;
        state.end()
    }
}

impl<'de> Deserialize<'de> for PointWrapper {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        #[derive(Deserialize)]
        struct PointHelper {
            x: f64,
            y: f64,
            srid: Option<i32>,
        }

        let helper = PointHelper::deserialize(deserializer)?;
        Ok(PointWrapper(Point::new(helper.x, helper.y, helper.srid)))
    }
}

impl<'a> FromSql<'a> for PointWrapper {
    fn from_sql(ty: &Type, raw: &'a [u8]) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let point = Point::from_sql(ty, raw)?;
        Ok(PointWrapper(point))
    }

    fn accepts(ty: &Type) -> bool {
        <Point as FromSql>::accepts(ty)
    }
}

impl ToSql for PointWrapper {
    fn to_sql(&self, ty: &Type, out: &mut BytesMut) -> Result<postgres_types::IsNull, Box<dyn std::error::Error + Send + Sync>> {
        self.0.to_sql(ty, out)
    }

    fn accepts(ty: &Type) -> bool {
        <Point as ToSql>::accepts(ty)
    }

    to_sql_checked!();
} 