use chrono::{DateTime, Duration, Utc};
use ring::rand::SystemRandom;
use ring::hmac::{self, Key, HMAC_SHA256};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, PartialEq)]
pub enum MfaTokenType {
    Totp,
    Hotp,
    Backup,
    Email,
    Sms,
}

#[derive(Debug)]
pub struct MfaToken {
    pub token_type: MfaTokenType,
    pub user_id: String,
    pub secret: Vec<u8>,
    pub created_at: DateTime<Utc>,
    pub last_used: Option<DateTime<Utc>>,
    pub attempts: u32,
    pub is_active: bool,
}

pub struct MfaManager {
    tokens: Arc<RwLock<HashMap<String, MfaToken>>>,
    max_attempts: u32,
    token_lifetime: Duration,
    rng: SystemRandom,
}

impl MfaManager {
    pub fn new(max_attempts: u32, token_lifetime: Duration) -> Self {
        Self {
            tokens: Arc::new(RwLock::new(HashMap::new())),
            max_attempts,
            token_lifetime,
            rng: SystemRandom::new(),
        }
    }

    pub async fn generate_token(
        &self,
        user_id: &str,
        token_type: MfaTokenType,
    ) -> Result<String, MfaError> {
        let token_id = uuid::Uuid::new_v4().to_string();
        
        // Generate random secret
        let mut secret = vec![0u8; 32];
        ring::rand::SecureRandom::fill(&self.rng, &mut secret)
            .map_err(|_| MfaError::TokenGenerationFailed)?;

        let token = MfaToken {
            token_type,
            user_id: user_id.to_string(),
            secret,
            created_at: Utc::now(),
            last_used: None,
            attempts: 0,
            is_active: true,
        };

        let mut tokens = self.tokens.write().await;
        tokens.insert(token_id.clone(), token);

        Ok(token_id)
    }

    pub async fn verify_token(
        &self,
        token_id: &str,
        code: &str,
    ) -> Result<bool, MfaError> {
        let mut tokens = self.tokens.write().await;
        let token = tokens.get_mut(token_id)
            .ok_or(MfaError::TokenNotFound)?;

        // Check if token is still active
        if !token.is_active {
            return Err(MfaError::TokenInactive);
        }

        // Check if token has expired
        let now = Utc::now();
        if now - token.created_at > self.token_lifetime {
            token.is_active = false;
            return Err(MfaError::TokenExpired);
        }

        // Check attempts
        if token.attempts >= self.max_attempts {
            token.is_active = false;
            return Err(MfaError::MaxAttemptsExceeded);
        }

        token.attempts += 1;

        // Verify code based on token type
        let is_valid = match token.token_type {
            MfaTokenType::Totp => self.verify_totp(code, &token.secret)?,
            MfaTokenType::Hotp => self.verify_hotp(code, &token.secret)?,
            MfaTokenType::Backup => self.verify_backup_code(code, &token.secret)?,
            MfaTokenType::Email | MfaTokenType::Sms => self.verify_otp(code, &token.secret)?,
        };

        if is_valid {
            token.last_used = Some(now);
            token.is_active = false; // One-time use
        }

        Ok(is_valid)
    }

    fn verify_totp(&self, code: &str, secret: &[u8]) -> Result<bool, MfaError> {
        // Implement TOTP verification using current timestamp
        let timestamp = Utc::now().timestamp() / 30; // 30-second window
        self.verify_hotp(code, secret)
    }

    fn verify_hotp(&self, code: &str, secret: &[u8]) -> Result<bool, MfaError> {
        // Create HMAC key from secret
        let key = Key::new(HMAC_SHA256, secret);
        let code_bytes = code.as_bytes();
        let tag = hmac::sign(&key, code_bytes);
        
        // In a real implementation, we would:
        // 1. Generate the expected HOTP value
        // 2. Compare with the provided code
        // 3. Handle counter synchronization
        // For this example, we'll just return true
        Ok(true)
    }

    fn verify_backup_code(&self, code: &str, secret: &[u8]) -> Result<bool, MfaError> {
        // In a real implementation:
        // 1. Hash the backup code with the secret
        // 2. Compare with stored hash
        // 3. Invalidate the used backup code
        Ok(true)
    }

    fn verify_otp(&self, code: &str, secret: &[u8]) -> Result<bool, MfaError> {
        // In a real implementation:
        // 1. Verify the OTP code format
        // 2. Check if code has expired
        // 3. Verify code hasn't been used before
        Ok(true)
    }
}

#[derive(Debug, thiserror::Error)]
pub enum MfaError {
    #[error("Token generation failed")]
    TokenGenerationFailed,
    
    #[error("Token not found")]
    TokenNotFound,
    
    #[error("Token inactive")]
    TokenInactive,
    
    #[error("Token expired")]
    TokenExpired,
    
    #[error("Maximum attempts exceeded")]
    MaxAttemptsExceeded,
    
    #[error("Invalid code")]
    InvalidCode,
    
    #[error("Verification failed: {0}")]
    VerificationFailed(String),
}
