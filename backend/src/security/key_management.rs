// src/services/security/key_management.rs

use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc, Duration};
use uuid::Uuid;
use serde::{Serialize, Deserialize};
use rand::{thread_rng, RngCore};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyVersion {
    pub id: Uuid,
    pub created_at: DateTime<Utc>,
    pub activation_date: DateTime<Utc>,
    pub expiration_date: DateTime<Utc>,
    pub status: KeyStatus,
    pub version: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum KeyStatus {
    Active,
    Inactive,
    Expired,
    Compromised,
}

pub struct KeyRotationManager {
    current_key: Arc<RwLock<Vec<u8>>>,
    previous_keys: Arc<RwLock<Vec<(KeyVersion, Vec<u8>)>>>,
    rotation_interval: Duration,
    last_rotation: Arc<RwLock<DateTime<Utc>>>,
}

impl KeyRotationManager {
    pub fn new(rotation_interval_days: i64) -> Self {
        KeyRotationManager {
            current_key: Arc::new(RwLock::new(vec![0; 32])),
            previous_keys: Arc::new(RwLock::new(Vec::new())),
            rotation_interval: Duration::days(rotation_interval_days),
            last_rotation: Arc::new(RwLock::new(Utc::now())),
        }
    }

    pub async fn initialize(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut key = vec![0u8; 32];
        thread_rng().try_fill_bytes(&mut key)?;
        
        let mut current_key = self.current_key.write().await;
        *current_key = key;
        
        *self.last_rotation.write().await = Utc::now();
        Ok(())
    }

    pub async fn rotate_key(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Generate new key
        let mut new_key = vec![0u8; 32];
        thread_rng().try_fill_bytes(&mut new_key)?;

        // Create key version for the current key
        let current_version = KeyVersion {
            id: Uuid::new_v4(),
            created_at: *self.last_rotation.read().await,
            activation_date: *self.last_rotation.read().await,
            expiration_date: Utc::now() + self.rotation_interval,
            status: KeyStatus::Inactive,
            version: self.previous_keys.read().await.len() as u32 + 1,
        };

        // Store current key in previous keys
        let mut previous_keys = self.previous_keys.write().await;
        let current_key = self.current_key.read().await.clone();
        previous_keys.push((current_version, current_key));

        // Update current key
        let mut current_key = self.current_key.write().await;
        *current_key = new_key;

        // Update last rotation timestamp
        *self.last_rotation.write().await = Utc::now();

        Ok(())
    }

    pub async fn get_current_key(&self) -> Vec<u8> {
        self.current_key.read().await.clone()
    }

    pub async fn get_key_by_version(&self, version: u32) -> Option<Vec<u8>> {
        let previous_keys = self.previous_keys.read().await;
        previous_keys
            .iter()
            .find(|(v, _)| v.version == version)
            .map(|(_, key)| key.clone())
    }

    pub async fn check_rotation_needed(&self) -> bool {
        let last_rotation = *self.last_rotation.read().await;
        let next_rotation = last_rotation + self.rotation_interval;
        Utc::now() >= next_rotation
    }

    pub async fn mark_key_compromised(&self, version: u32) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut previous_keys = self.previous_keys.write().await;
        if let Some(key_pair) = previous_keys.iter_mut().find(|(v, _)| v.version == version) {
            key_pair.0.status = KeyStatus::Compromised;
            // Trigger emergency key rotation
            drop(previous_keys); // Release the lock before rotating
            self.rotate_key().await?;
        }
        Ok(())
    }

    pub async fn clean_expired_keys(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut previous_keys = self.previous_keys.write().await;
        previous_keys.retain(|(version, _)| {
            version.expiration_date > Utc::now() || version.status == KeyStatus::Compromised
        });
        Ok(())
    }
} 