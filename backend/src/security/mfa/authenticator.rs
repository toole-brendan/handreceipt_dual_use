// src/services/security/mfa/mod.rs

use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc, Duration};
use uuid::Uuid;
use serde::{Serialize, Deserialize};
use rand::Rng;
use argon2::{self, Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{SaltString, rand_core::OsRng};
use std::error::Error as StdError;
use ring::{hmac, rand};
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;
use base32;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MfaTokenType {
    Totp,
    Sms,
    Email,
    HardwareKey,
    BiometricData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MfaToken {
    pub id: Uuid,
    pub user_id: Uuid,
    pub token: String,
    pub expires_at: DateTime<Utc>,
    pub token_type: MfaTokenType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MfaConfig {
    pub required_factors: Vec<MfaTokenType>,
    #[serde(serialize_with = "serialize_duration", deserialize_with = "deserialize_duration")]
    pub token_lifetime: Duration,
    pub max_attempts: u32,
}

// Custom serialization for Duration
fn serialize_duration<S>(duration: &Duration, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    serializer.serialize_i64(duration.num_seconds())
}

fn deserialize_duration<'de, D>(deserializer: D) -> Result<Duration, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let seconds = i64::deserialize(deserializer)?;
    Ok(Duration::seconds(seconds))
}

#[derive(Debug, thiserror::Error)]
pub enum MfaError {
    #[error("Password hashing error: {0}")]
    PasswordHashError(String),
    #[error("Token expired")]
    TokenExpired,
    #[error("Invalid token")]
    InvalidToken,
    #[error("Maximum attempts exceeded")]
    MaxAttemptsExceeded,
    #[error("Other error: {0}")]
    Other(String),
    #[error("Invalid secret key: {0}")]
    InvalidSecret(String),
    #[error("Invalid token: {0}")]
    InvalidToken(String),
    #[error("Time error: {0}")]
    TimeError(String),
    #[error("Generation error: {0}")]
    GenerationError(String),
}

pub struct MfaManager {
    active_tokens: Arc<RwLock<Vec<MfaToken>>>,
    config: Arc<RwLock<MfaConfig>>,
    attempt_counter: Arc<RwLock<std::collections::HashMap<Uuid, u32>>>,
}

impl MfaManager {
    pub fn new() -> Self {
        let default_config = MfaConfig {
            required_factors: vec![MfaTokenType::Totp, MfaTokenType::HardwareKey],
            token_lifetime: Duration::minutes(5),
            max_attempts: 3,
        };

        MfaManager {
            active_tokens: Arc::new(RwLock::new(Vec::new())),
            config: Arc::new(RwLock::new(default_config)),
            attempt_counter: Arc::new(RwLock::new(std::collections::HashMap::new())),
        }
    }

    pub async fn generate_totp(&self, user_id: Uuid) -> Result<String, Box<dyn StdError + Send + Sync>> {
        let token = rand::thread_rng()
            .sample_iter(&rand::distributions::Alphanumeric)
            .take(6)
            .map(char::from)
            .collect::<String>();

        let mfa_token = MfaToken {
            id: Uuid::new_v4(),
            user_id,
            token: self.hash_token(&token)?,
            expires_at: Utc::now() + self.config.read().await.token_lifetime,
            token_type: MfaTokenType::Totp,
        };

        self.active_tokens.write().await.push(mfa_token);
        Ok(token)
    }

    pub async fn verify_token(
        &self,
        user_id: Uuid,
        token: &str,
        token_type: MfaTokenType,
    ) -> Result<bool, Box<dyn StdError + Send + Sync>> {
        let mut attempts = self.attempt_counter.write().await;
        let attempt_count = attempts.entry(user_id).or_insert(0);
        
        if *attempt_count >= self.config.read().await.max_attempts {
            return Err(Box::new(MfaError::MaxAttemptsExceeded));
        }
        
        *attempt_count += 1;

        let tokens = self.active_tokens.read().await;
        let valid = tokens.iter().any(|t| 
            t.user_id == user_id 
            && t.token_type == token_type
            && t.expires_at > Utc::now()
            && self.verify_token_hash(&t.token, token)
        );

        if valid {
            attempts.remove(&user_id);
        }

        Ok(valid)
    }

    fn hash_token(&self, token: &str) -> Result<String, Box<dyn StdError + Send + Sync>> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(token.as_bytes(), &salt)
            .map_err(|e| MfaError::PasswordHashError(e.to_string()))?;
        Ok(password_hash.to_string())
    }

    fn verify_token_hash(&self, hash: &str, token: &str) -> bool {
        if let Ok(parsed_hash) = PasswordHash::new(hash) {
            Argon2::default()
                .verify_password(token.as_bytes(), &parsed_hash)
                .is_ok()
        } else {
            false
        }
    }

    pub async fn clean_expired_tokens(&self) -> Result<(), Box<dyn StdError + Send + Sync>> {
        let mut tokens = self.active_tokens.write().await;
        let now = Utc::now();
        tokens.retain(|token| token.expires_at > now);
        Ok(())
    }
}

pub struct TotpAuthenticator {
    secret: Vec<u8>,
    digits: usize,
    step: u64,
}

impl TotpAuthenticator {
    /// Create a new TOTP authenticator with default settings
    pub fn new() -> Result<Self, MfaError> {
        let mut rng = rand::SystemRandom::new();
        let mut secret = vec![0u8; 32];
        rng.fill(&mut secret)
            .map_err(|e| MfaError::GenerationError(e.to_string()))?;

        Ok(Self {
            secret,
            digits: 6,
            step: 30,
        })
    }

    /// Create a new TOTP authenticator with custom settings
    pub fn with_config(secret: Vec<u8>, digits: usize, step: u64) -> Self {
        Self {
            secret,
            digits,
            step,
        }
    }

    /// Generate a TOTP token
    pub fn generate_token(&self) -> Result<String, MfaError> {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| MfaError::TimeError(e.to_string()))?
            .as_secs();

        let counter = timestamp / self.step;
        self.generate_token_for_counter(counter)
    }

    /// Verify a TOTP token
    pub fn verify_token(&self, token: &str) -> Result<bool, MfaError> {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| MfaError::TimeError(e.to_string()))?
            .as_secs();

        let counter = timestamp / self.step;

        // Check current and adjacent intervals
        for i in [-1, 0, 1].iter() {
            let check_counter = (counter as i64 + i) as u64;
            let generated = self.generate_token_for_counter(check_counter)?;
            if token == generated {
                return Ok(true);
            }
        }

        Ok(false)
    }

    /// Get the secret key in base32 format
    pub fn get_secret_base32(&self) -> String {
        base32::encode(
            base32::Alphabet::RFC4648 { padding: true },
            &self.secret,
        )
    }

    /// Generate token for a specific counter value
    fn generate_token_for_counter(&self, counter: u64) -> Result<String, MfaError> {
        let counter_bytes = counter.to_be_bytes();
        
        let key = hmac::Key::new(hmac::HMAC_SHA256, &self.secret);
        let tag = hmac::sign(&key, &counter_bytes);
        
        let offset = (tag.as_ref()[19] & 0xf) as usize;
        let binary = ((tag.as_ref()[offset] & 0x7f) as u32) << 24
            | (tag.as_ref()[offset + 1] as u32) << 16
            | (tag.as_ref()[offset + 2] as u32) << 8
            | (tag.as_ref()[offset + 3] as u32);

        let token = binary % 10u32.pow(self.digits as u32);
        Ok(format!("{:0width$}", token, width = self.digits))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_totp_generation() {
        let authenticator = TotpAuthenticator::new().unwrap();
        let token = authenticator.generate_token().unwrap();
        assert_eq!(token.len(), 6);
    }

    #[test]
    fn test_totp_verification() {
        let authenticator = TotpAuthenticator::new().unwrap();
        let token = authenticator.generate_token().unwrap();
        assert!(authenticator.verify_token(&token).unwrap());
    }

    #[test]
    fn test_invalid_token() {
        let authenticator = TotpAuthenticator::new().unwrap();
        assert!(!authenticator.verify_token("000000").unwrap());
    }
}