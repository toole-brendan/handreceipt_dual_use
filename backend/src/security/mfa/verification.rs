// src/security/mfa/verification.rs

use super::authenticator::{MfaError, MfaToken, MfaTokenType, TotpAuthenticator};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationSession {
    pub id: Uuid,
    pub user_id: Uuid,
    pub required_factors: Vec<MfaTokenType>,
    pub completed_factors: Vec<MfaTokenType>,
    pub expires_at: DateTime<Utc>,
    pub attempts: HashMap<MfaTokenType, u32>,
}

pub struct MfaVerifier {
    sessions: Arc<RwLock<HashMap<Uuid, VerificationSession>>>,
    totp_authenticator: Arc<TotpAuthenticator>,
    max_attempts: u32,
    session_timeout: Duration,
}

impl MfaVerifier {
    pub fn new() -> Result<Self, MfaError> {
        Ok(Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
            totp_authenticator: Arc::new(TotpAuthenticator::new()?),
            max_attempts: 3,
            session_timeout: Duration::minutes(5),
        })
    }

    /// Start a new MFA verification session
    pub async fn start_verification(
        &self,
        user_id: Uuid,
        required_factors: Vec<MfaTokenType>,
    ) -> Result<Uuid, MfaError> {
        let session_id = Uuid::new_v4();
        let session = VerificationSession {
            id: session_id,
            user_id,
            required_factors: required_factors.clone(),
            completed_factors: Vec::new(),
            expires_at: Utc::now() + self.session_timeout,
            attempts: required_factors
                .into_iter()
                .map(|factor| (factor, 0))
                .collect(),
        };

        self.sessions.write().await.insert(session_id, session);
        Ok(session_id)
    }

    /// Verify a specific factor
    pub async fn verify_factor(
        &self,
        session_id: Uuid,
        factor_type: MfaTokenType,
        token: &str,
    ) -> Result<bool, MfaError> {
        let mut sessions = self.sessions.write().await;
        let session = sessions
            .get_mut(&session_id)
            .ok_or(MfaError::InvalidToken)?;

        // Check session expiration
        if session.expires_at < Utc::now() {
            sessions.remove(&session_id);
            return Err(MfaError::TokenExpired);
        }

        // Check if factor is required
        if !session.required_factors.contains(&factor_type) {
            return Err(MfaError::InvalidToken);
        }

        // Check attempts
        let attempts = session.attempts.get_mut(&factor_type).unwrap();
        if *attempts >= self.max_attempts {
            return Err(MfaError::MaxAttemptsExceeded);
        }
        *attempts += 1;

        // Verify the factor
        let is_valid = match factor_type {
            MfaTokenType::Totp => self.totp_authenticator.verify_token(token)?,
            MfaTokenType::Sms => self.verify_sms_token(token).await?,
            MfaTokenType::Email => self.verify_email_token(token).await?,
            MfaTokenType::HardwareKey => self.verify_hardware_key(token).await?,
            MfaTokenType::BiometricData => self.verify_biometric_data(token).await?,
        };

        if is_valid {
            session.completed_factors.push(factor_type);
        }

        Ok(is_valid)
    }

    /// Check if all required factors are completed
    pub async fn is_verification_complete(&self, session_id: Uuid) -> Result<bool, MfaError> {
        let sessions = self.sessions.read().await;
        let session = sessions.get(&session_id).ok_or(MfaError::InvalidToken)?;

        if session.expires_at < Utc::now() {
            return Err(MfaError::TokenExpired);
        }

        Ok(session
            .required_factors
            .iter()
            .all(|factor| session.completed_factors.contains(factor)))
    }

    async fn verify_sms_token(&self, token: &str) -> Result<bool, MfaError> {
        // Implement SMS token verification
        // This is a placeholder - implement actual SMS verification
        Ok(token.len() == 6 && token.chars().all(char::is_numeric))
    }

    async fn verify_email_token(&self, token: &str) -> Result<bool, MfaError> {
        // Implement email token verification
        // This is a placeholder - implement actual email verification
        Ok(token.len() == 8 && token.chars().all(|c| c.is_ascii_alphanumeric()))
    }

    async fn verify_hardware_key(&self, token: &str) -> Result<bool, MfaError> {
        // Implement hardware key verification
        // This is a placeholder - implement actual hardware key verification
        Ok(token.len() == 64 && token.chars().all(|c| c.is_ascii_hexdigit()))
    }

    async fn verify_biometric_data(&self, token: &str) -> Result<bool, MfaError> {
        // Implement biometric data verification
        // This is a placeholder - implement actual biometric verification
        Ok(!token.is_empty())
    }

    /// Clean up expired sessions
    pub async fn cleanup_expired_sessions(&self) {
        let mut sessions = self.sessions.write().await;
        sessions.retain(|_, session| session.expires_at > Utc::now());
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_verification_flow() {
        let verifier = MfaVerifier::new().unwrap();
        let user_id = Uuid::new_v4();
        let required_factors = vec![MfaTokenType::Totp, MfaTokenType::Sms];

        // Start verification
        let session_id = verifier
            .start_verification(user_id, required_factors)
            .await
            .unwrap();

        // Generate and verify TOTP
        let totp = verifier.totp_authenticator.generate_token().unwrap();
        assert!(
            verifier
                .verify_factor(session_id, MfaTokenType::Totp, &totp)
                .await
                .unwrap()
        );

        // Verify SMS (using mock)
        assert!(
            verifier
                .verify_factor(session_id, MfaTokenType::Sms, "123456")
                .await
                .unwrap()
        );

        // Check completion
        assert!(verifier.is_verification_complete(session_id).await.unwrap());
    }

    #[tokio::test]
    async fn test_max_attempts() {
        let verifier = MfaVerifier::new().unwrap();
        let user_id = Uuid::new_v4();
        let required_factors = vec![MfaTokenType::Totp];

        let session_id = verifier
            .start_verification(user_id, required_factors)
            .await
            .unwrap();

        // Attempt verification multiple times
        for _ in 0..3 {
            let _ = verifier
                .verify_factor(session_id, MfaTokenType::Totp, "invalid")
                .await;
        }

        // Next attempt should fail with MaxAttemptsExceeded
        assert!(matches!(
            verifier
                .verify_factor(session_id, MfaTokenType::Totp, "invalid")
                .await,
            Err(MfaError::MaxAttemptsExceeded)
        ));
    }
}
