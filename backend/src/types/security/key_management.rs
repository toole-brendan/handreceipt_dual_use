use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

// HSM Types
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum HsmKeyType {
    Aes128,
    Aes256,
    Rsa2048,
    Rsa4096,
    Ed25519,
    Symmetric,
    Asymmetric,
    Hmac,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HsmConfig {
    pub slot_id: u64,
    pub pin: String,
    pub key_type: HsmKeyType,
    pub label: String,
    pub mechanism: HsmMechanism,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum HsmMechanism {
    Aes,
    Rsa,
    EcDsa,
    Hmac,
}

// MFA Types
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum MfaMethod {
    Totp,
    Sms,
    Email,
    HardwareToken,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MfaToken {
    pub token_id: Uuid,
    pub token: String,
    pub method: MfaMethod,
    pub expires_at: DateTime<Utc>,
    pub attempts: u32,
    pub verified: bool,
}

// Encryption Types
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum EncryptionAlgorithm {
    Aes256Gcm,
    ChaCha20Poly1305,
    Ed25519,
    X25519,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionKey {
    pub key_id: Uuid,
    pub algorithm: EncryptionAlgorithm,
    pub created_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
    pub metadata: Option<serde_json::Value>,
    pub version: u32,
} 