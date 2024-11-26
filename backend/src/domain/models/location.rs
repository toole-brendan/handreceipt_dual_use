use serde::{Deserialize, Serialize};
use sqlx::postgres::{PgHasArrayType, Postgres};
use sqlx::types::JsonValue;
use sqlx::{Decode, Encode, Type};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Location {
    pub latitude: f64,
    pub longitude: f64,
    pub altitude: Option<f64>,
    pub accuracy: Option<f64>,
    pub building: Option<String>,
    pub floor: Option<i32>,
    pub room: Option<String>,
}

impl From<JsonValue> for Location {
    fn from(value: JsonValue) -> Self {
        serde_json::from_value(value).unwrap_or_default()
    }
}

impl Default for Location {
    fn default() -> Self {
        Self {
            latitude: 0.0,
            longitude: 0.0,
            altitude: None,
            accuracy: None,
            building: None,
            floor: None,
            room: None,
        }
    }
}

impl Type<Postgres> for Location {
    fn type_info() -> sqlx::postgres::PgTypeInfo {
        sqlx::postgres::PgTypeInfo::with_name("jsonb")
    }
}

impl Encode<'_, Postgres> for Location {
    fn encode_by_ref(&self, buf: &mut sqlx::postgres::PgArgumentBuffer) -> sqlx::encode::IsNull {
        let json = serde_json::to_value(self).unwrap_or_default();
        <JsonValue as Encode<Postgres>>::encode(json, buf)
    }
}

impl<'r> Decode<'r, Postgres> for Location {
    fn decode(value: sqlx::postgres::PgValueRef<'r>) -> Result<Self, sqlx::error::BoxDynError> {
        let json = <JsonValue as Decode<Postgres>>::decode(value)?;
        Ok(serde_json::from_value(json)?)
    }
}
