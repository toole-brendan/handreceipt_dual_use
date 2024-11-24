// backend/src/models/types.rs

use postgres_types::{accepts, to_sql_checked, ToSql, Type, IsNull, FromSql};
use bytes::BytesMut;
use uuid::Uuid;
use std::error::Error as StdError;

#[derive(Debug, Clone)]
pub struct UuidWrapper(pub Uuid);

impl ToSql for UuidWrapper {
    fn to_sql(&self, ty: &Type, out: &mut BytesMut) -> Result<IsNull, Box<dyn StdError + Send + Sync>> {
        let bytes = self.0.as_bytes();
        <&[u8] as ToSql>::to_sql(&&bytes[..], ty, out)
    }

    accepts!(UUID);
    to_sql_checked!();
}

impl<'a> FromSql<'a> for UuidWrapper {
    fn from_sql(_ty: &Type, raw: &'a [u8]) -> Result<Self, Box<dyn StdError + Send + Sync>> {
        if raw.len() != 16 {
            return Err("invalid UUID length".into());
        }
        let mut bytes = [0u8; 16];
        bytes.copy_from_slice(raw);
        Ok(UuidWrapper(Uuid::from_bytes(bytes)))
    }

    accepts!(UUID);
}

impl From<Uuid> for UuidWrapper {
    fn from(uuid: Uuid) -> Self {
        UuidWrapper(uuid)
    }
}

impl From<UuidWrapper> for Uuid {
    fn from(wrapper: UuidWrapper) -> Self {
        wrapper.0
    }
}
