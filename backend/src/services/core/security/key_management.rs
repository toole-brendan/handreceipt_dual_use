use chrono::{DateTime, Duration, Utc};
use ring::rand::SystemRandom;
use ring::signature::{self, KeyPair};
use std::collections::HashMap;
use std::hash::Hash;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub enum KeyStatus {
    Active,
    Rotating,
    Expired,
    Compromised,
}

#[derive(Debug)]
pub struct KeyInfo {
    pub id: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub status: KeyStatus,
    pub key_type: KeyType,
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub enum KeyType {
    Encryption,
    Signing,
    Authentication,
}

pub struct KeyRotationManager {
    keys: Arc<RwLock<HashMap<String, KeyInfo>>>,
    active_keys: Arc<RwLock<HashMap<KeyType, String>>>,
    rotation_interval: Duration,
    rng: SystemRandom,
}

impl KeyRotationManager {
    pub fn new(rotation_interval: Duration) -> Self {
        Self {
            keys: Arc::new(RwLock::new(HashMap::new())),
            active_keys: Arc::new(RwLock::new(HashMap::new())),
            rotation_interval,
            rng: SystemRandom::new(),
        }
    }

    pub async fn generate_key(&self, key_type: KeyType) -> Result<String, KeyError> {
        let key_id = uuid::Uuid::new_v4().to_string();
        
        let pkcs8_bytes = match key_type {
            KeyType::Signing => {
                signature::Ed25519KeyPair::generate_pkcs8(&self.rng)
                    .map_err(|_| KeyError::GenerationFailed)?
                    .as_ref()
                    .to_vec()
            },
            _ => {
                let mut key = [0u8; 32];
                ring::rand::SecureRandom::fill(&self.rng, &mut key)
                    .map_err(|_| KeyError::GenerationFailed)?;
                key.to_vec()
            },
        };

        let now = Utc::now();
        let key_info = KeyInfo {
            id: key_id.clone(),
            created_at: now,
            expires_at: now + self.rotation_interval,
            status: KeyStatus::Active,
            key_type: key_type.clone(),
        };

        {
            let mut keys = self.keys.write().await;
            keys.insert(key_id.clone(), key_info);

            let mut active_keys = self.active_keys.write().await;
            active_keys.insert(key_type, key_id.clone());
        }

        Ok(key_id)
    }

    pub async fn get_active_key(&self, key_type: &KeyType) -> Result<String, KeyError> {
        let active_keys = self.active_keys.read().await;
        active_keys.get(key_type)
            .cloned()
            .ok_or(KeyError::NoActiveKey)
    }

    pub async fn rotate_key(&self, key_id: &str) -> Result<String, KeyError> {
        let mut keys = self.keys.write().await;
        let key_info = keys.get_mut(key_id)
            .ok_or(KeyError::KeyNotFound)?;

        // Mark current key as rotating
        key_info.status = KeyStatus::Rotating;
        let key_type = key_info.key_type.clone();

        // Drop the write lock before generating new key
        drop(keys);

        // Generate new key
        let new_key_id = self.generate_key(key_type).await?;

        // Mark old key as expired
        let mut keys = self.keys.write().await;
        if let Some(old_key) = keys.get_mut(key_id) {
            old_key.status = KeyStatus::Expired;
        }

        Ok(new_key_id)
    }

    pub async fn revoke_key(&self, key_id: &str) -> Result<(), KeyError> {
        let mut keys = self.keys.write().await;
        let key_info = keys.get_mut(key_id)
            .ok_or(KeyError::KeyNotFound)?;

        key_info.status = KeyStatus::Compromised;
        let key_type = key_info.key_type.clone();

        // Drop the write lock before generating new key
        drop(keys);

        let active_keys = self.active_keys.read().await;
        if let Some(active_id) = active_keys.get(&key_type) {
            if active_id == key_id {
                self.generate_key(key_type).await?;
            }
        }

        Ok(())
    }
}

#[derive(Debug, thiserror::Error)]
pub enum KeyError {
    #[error("Key generation failed")]
    GenerationFailed,
    
    #[error("Key not found")]
    KeyNotFound,
    
    #[error("No active key")]
    NoActiveKey,
    
    #[error("Invalid key type")]
    InvalidKeyType,
    
    #[error("Rotation failed: {0}")]
    RotationFailed(String),
}
