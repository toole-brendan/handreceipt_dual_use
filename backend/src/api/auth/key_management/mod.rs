use async_trait::async_trait;
use ring::rand::SystemRandom;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

use crate::error::CoreError;

pub struct KeyManagerImpl {
    keys: Arc<RwLock<HashMap<String, Vec<u8>>>>,
    rng: SystemRandom,
}

impl KeyManagerImpl {
    pub fn new() -> Self {
        Self {
            keys: Arc::new(RwLock::new(HashMap::new())),
            rng: SystemRandom::new(),
        }
    }

    fn generate_key_id() -> String {
        Uuid::new_v4().to_string()
    }
}

impl Default for KeyManagerImpl {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl super::KeyManager for KeyManagerImpl {
    async fn generate_key(&self) -> Result<Vec<u8>, CoreError> {
        let mut key = vec![0u8; 32]; // 256-bit key
        self.rng
            .fill(&mut key)
            .map_err(|_| CoreError::SecurityError("Failed to generate key".to_string()))?;
        Ok(key)
    }

    async fn store_key(&self, key: &[u8]) -> Result<String, CoreError> {
        let key_id = Self::generate_key_id();
        self.keys
            .write()
            .map_err(|_| CoreError::SecurityError("Failed to acquire write lock".to_string()))?
            .insert(key_id.clone(), key.to_vec());
        Ok(key_id)
    }

    async fn retrieve_key(&self, id: &str) -> Result<Vec<u8>, CoreError> {
        self.keys
            .read()
            .map_err(|_| CoreError::SecurityError("Failed to acquire read lock".to_string()))?
            .get(id)
            .cloned()
            .ok_or_else(|| CoreError::SecurityError("Key not found".to_string()))
    }
}
