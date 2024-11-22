use std::str::FromStr;
use std::error::Error as StdError;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tokio_postgres::types::{ToSql, FromSql, Type, IsNull};
use bytes::BytesMut;
use postgres_types::{accepts, to_sql_checked};
use std::collections::HashMap;
use uuid::Uuid;

use super::error::CoreError;
use super::permissions::{Action, Permission, ResourceType};

pub mod key_management {
    #[derive(Debug, Clone, Copy)]
    pub enum KeyType {
        Encryption,
        Signing,
        Authentication,
    }
}

/// Represents different security classification levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum SecurityClassification {
    Unclassified,
    Restricted,
    Confidential,
    Secret,
    TopSecret,
}

/// Represents the security context for an authenticated user or service
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityContext {
    pub classification: SecurityClassification,
    pub user_id: Uuid,
    pub permissions: Vec<Permission>,
    pub token: String,
    pub metadata: HashMap<String, Vec<String>>,
}

/// Represents constraints on permissions
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum Constraint {
    ClassificationBased {
        max_classification: SecurityClassification,
    },
    TimeBased {
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
    },
    LocationBased {
        geofence_id: Uuid,
        classification: SecurityClassification,
    },
    AccuracyBased {
        minimum_accuracy: f64,
        minimum_confidence: f64,
    },
    SignatureBased {
        required_signers: Vec<Uuid>,
        min_signatures: usize,
        signature_type: String,
    },
    TimestampBased(TimestampConstraint),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TimestampConstraint {
    #[serde(with = "duration_serializer")]
    pub max_age: chrono::Duration,
    pub require_authority: bool,
}

// Add serialization module for Duration
mod duration_serializer {
    use chrono::Duration;
    use serde::{Deserialize, Deserializer, Serializer};

    pub fn serialize<S>(duration: &Duration, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_i64(duration.num_seconds())
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Duration, D::Error>
    where
        D: Deserializer<'de>,
    {
        let seconds = i64::deserialize(deserializer)?;
        Ok(Duration::seconds(seconds))
    }
}

impl SecurityContext {
    pub fn new(
        classification: SecurityClassification,
        user_id: Uuid,
        token: String,
        permissions: Vec<Permission>,
    ) -> Self {
        Self {
            classification,
            user_id,
            token,
            permissions,
            metadata: HashMap::new(),
        }
    }

    pub fn has_permission(&self, resource: &ResourceType, action: &Action) -> bool {
        self.permissions.iter().any(|perm| {
            perm.resource == *resource && perm.action == *action
        })
    }

    pub fn can_replicate(&self) -> bool {
        self.permissions.iter().any(|perm| {
            perm.resource == ResourceType::Replication
        })
    }

    pub fn has_replication_authority(&self) -> bool {
        self.permissions.iter().any(|perm| {
            perm.resource == ResourceType::ReplicationAuthority &&
            self.classification >= SecurityClassification::Secret
        })
    }

    pub fn can_manage_replication(&self) -> bool {
        self.permissions.iter().any(|perm| {
            perm.resource == ResourceType::ManageReplication &&
            self.classification >= SecurityClassification::TopSecret
        })
    }

    pub fn can_sync_with_peer(&self, peer_id: &Uuid) -> bool {
        // Check if peer is in allowed list
        if let Some(allowed_peers) = self.metadata.get("allowed_peers") {
            if !allowed_peers.contains(&peer_id.to_string()) {
                return false;
            }
        }

        // Check if we have sync permission
        self.has_permission(&ResourceType::System, &Action::Execute)
    }

    pub fn can_access_classification(&self, classification: &str) -> bool {
        let target_classification = match SecurityClassification::from_str(classification) {
            Ok(c) => c,
            Err(_) => return false,
        };

        // User can only access classifications at or below their level
        self.classification >= target_classification
    }

    pub fn add_metadata(&mut self, key: String, value: String) {
        self.metadata.entry(key)
            .or_insert_with(Vec::new)
            .push(value);
    }

    pub fn get_metadata(&self, key: &str) -> Option<&Vec<String>> {
        self.metadata.get(key)
    }
}

impl FromStr for SecurityClassification {
    type Err = CoreError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "UNCLASSIFIED" => Ok(SecurityClassification::Unclassified),
            "RESTRICTED" => Ok(SecurityClassification::Restricted),
            "CONFIDENTIAL" => Ok(SecurityClassification::Confidential),
            "SECRET" => Ok(SecurityClassification::Secret),
            "TOP_SECRET" => Ok(SecurityClassification::TopSecret),
            _ => Err(CoreError::ValidationError("Invalid classification".to_string())),
        }
    }
}

impl std::fmt::Display for SecurityClassification {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let classification = match self {
            SecurityClassification::Unclassified => "UNCLASSIFIED",
            SecurityClassification::Restricted => "RESTRICTED",
            SecurityClassification::Confidential => "CONFIDENTIAL",
            SecurityClassification::Secret => "SECRET",
            SecurityClassification::TopSecret => "TOP_SECRET",
        };
        write!(f, "{}", classification)
    }
}

// SQL type implementations for SecurityClassification
impl ToSql for SecurityClassification {
    fn to_sql(&self, ty: &Type, out: &mut BytesMut) -> Result<IsNull, Box<dyn StdError + Send + Sync>> {
        let s = self.to_string();
        s.to_sql(ty, out)
    }

    accepts!(VARCHAR, TEXT);

    to_sql_checked!();
}

impl<'a> FromSql<'a> for SecurityClassification {
    fn from_sql(ty: &Type, raw: &'a [u8]) -> Result<Self, Box<dyn StdError + Send + Sync>> {
        let s = <String as FromSql>::from_sql(ty, raw)?;
        SecurityClassification::from_str(&s)
            .map_err(|e| Box::new(e) as Box<dyn StdError + Send + Sync>)
    }

    accepts!(VARCHAR, TEXT);
}
