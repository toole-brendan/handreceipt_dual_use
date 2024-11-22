use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio_postgres::types::{FromSql, ToSql, Type, IsNull};
use bytes::BytesMut;
use postgres_types::{accepts, to_sql_checked};
use postgis::ewkb::{Point, EwkbRead, EwkbWrite};

use crate::types::{
    asset::{CommandSignature, LocationMetadata, PointWrapper},
};

/// Wrapper for JSON metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonMetadata(pub HashMap<String, String>);

/// Wrapper for JSON array of command signatures
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonSignatures(pub Vec<CommandSignature>);

/// Wrapper for JSON array of location history
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonLocationHistory(pub Vec<LocationMetadata>);

/// Wrapper for PostGIS geometry
#[derive(Debug, Clone)]
pub struct GeometryWrapper(pub Point);

impl ToSql for JsonMetadata {
    fn to_sql(&self, ty: &Type, out: &mut BytesMut) -> Result<IsNull, Box<dyn std::error::Error + Send + Sync>> {
        let json = serde_json::to_value(&self.0)?;
        json.to_sql(ty, out)
    }

    accepts!(JSONB);
    to_sql_checked!();
}

impl<'a> FromSql<'a> for JsonMetadata {
    fn from_sql(ty: &Type, raw: &'a [u8]) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let json = <serde_json::Value as FromSql>::from_sql(ty, raw)?;
        Ok(JsonMetadata(serde_json::from_value(json)?))
    }

    accepts!(JSONB);
}

impl ToSql for JsonSignatures {
    fn to_sql(&self, ty: &Type, out: &mut BytesMut) -> Result<IsNull, Box<dyn std::error::Error + Send + Sync>> {
        let json = serde_json::to_value(&self.0)?;
        json.to_sql(ty, out)
    }

    accepts!(JSONB);
    to_sql_checked!();
}

impl<'a> FromSql<'a> for JsonSignatures {
    fn from_sql(ty: &Type, raw: &'a [u8]) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let json = <serde_json::Value as FromSql>::from_sql(ty, raw)?;
        Ok(JsonSignatures(serde_json::from_value(json)?))
    }

    accepts!(JSONB);
}

impl ToSql for JsonLocationHistory {
    fn to_sql(&self, ty: &Type, out: &mut BytesMut) -> Result<IsNull, Box<dyn std::error::Error + Send + Sync>> {
        let json = serde_json::to_value(&self.0)?;
        json.to_sql(ty, out)
    }

    accepts!(JSONB);
    to_sql_checked!();
}

impl<'a> FromSql<'a> for JsonLocationHistory {
    fn from_sql(ty: &Type, raw: &'a [u8]) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let json = <serde_json::Value as FromSql>::from_sql(ty, raw)?;
        Ok(JsonLocationHistory(serde_json::from_value(json)?))
    }

    accepts!(JSONB);
}

impl From<Point> for PointWrapper {
    fn from(point: Point) -> Self {
        PointWrapper {
            x: point.x,
            y: point.y,
        }
    }
}

impl From<PointWrapper> for Point {
    fn from(wrapper: PointWrapper) -> Self {
        Point::new(wrapper.x, wrapper.y, Some(4326))
    }
}

impl ToSql for GeometryWrapper {
    fn to_sql(&self, _ty: &Type, out: &mut BytesMut) -> Result<IsNull, Box<dyn std::error::Error + Send + Sync>> {
        let mut writer = Vec::new();
        self.0.write_ewkb(&mut writer)?;
        out.extend_from_slice(&writer);
        Ok(IsNull::No)
    }

    accepts!(BYTEA);
    to_sql_checked!();
}

impl<'a> FromSql<'a> for GeometryWrapper {
    fn from_sql(_ty: &Type, raw: &'a [u8]) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let point = Point::read_ewkb(&mut std::io::Cursor::new(raw))?;
        Ok(GeometryWrapper(point))
    }

    accepts!(BYTEA);
}
