// backend/src/security/mfa/mod.rs

pub mod authenticator;
pub mod verification;

use uuid::Uuid;
pub use authenticator::{
    MfaError,
    MfaToken,
    MfaTokenType,
    MfaConfig,
    MfaManager,
    TotpAuthenticator
};
pub use verification::{MfaVerifier, VerificationSession};

/// Manages the complete MFA lifecycle
pub struct MfaService {
    manager: MfaManager,
    verifier: MfaVerifier,
}

impl MfaService {
    pub fn new() -> Result<Self, MfaError> {
        Ok(Self {
            manager: MfaManager::new(),
            verifier: MfaVerifier::new()?,
        })
    }

    /// Initialize MFA for a user
    pub async fn initialize_mfa(
        &self,
        user_id: Uuid,
        factors: Vec<MfaTokenType>,
    ) -> Result<String, MfaError> {
        // Generate TOTP secret if TOTP is one of the factors
        if factors.contains(&MfaTokenType::Totp) {
            let totp = self.manager.generate_totp(user_id).await?;
            Ok(totp)
        } else {
            Ok(String::new())
        }
    }

    /// Start a verification session
    pub async fn start_verification(
        &self,
        user_id: Uuid,
        factors: Vec<MfaTokenType>,
    ) -> Result<Uuid, MfaError> {
        self.verifier.start_verification(user_id, factors).await
    }

    /// Verify a specific factor
    pub async fn verify_factor(
        &self,
        session_id: Uuid,
        factor_type: MfaTokenType,
        token: &str,
    ) -> Result<bool, MfaError> {
        self.verifier.verify_factor(session_id, factor_type, token).await
    }

    /// Check if verification is complete
    pub async fn is_verification_complete(&self, session_id: Uuid) -> Result<bool, MfaError> {
        self.verifier.is_verification_complete(session_id).await
    }

    /// Perform maintenance tasks (cleanup expired sessions, etc.)
    pub async fn maintenance(&self) {
        self.verifier.cleanup_expired_sessions().await;
        if let Ok(()) = self.manager.clean_expired_tokens().await {
            // Log successful cleanup
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_mfa_service() {
        let service = MfaService::new().unwrap();
        let user_id = Uuid::new_v4();
        let factors = vec![MfaTokenType::Totp];

        // Initialize MFA
        let totp_secret = service.initialize_mfa(user_id, factors.clone()).await.unwrap();
        assert!(!totp_secret.is_empty());

        // Start verification
        let session_id = service.start_verification(user_id, factors).await.unwrap();

        // Verify TOTP (this will fail with the test token)
        let result = service
            .verify_factor(session_id, MfaTokenType::Totp, "123456")
            .await;
        assert!(result.is_ok());

        // Check completion
        let is_complete = service.is_verification_complete(session_id).await.unwrap();
        assert!(!is_complete); // Should be false since we used an invalid token
    }

    #[tokio::test]
    async fn test_multiple_factors() {
        let service = MfaService::new().unwrap();
        let user_id = Uuid::new_v4();
        let factors = vec![MfaTokenType::Totp, MfaTokenType::Sms];

        // Initialize MFA
        let _ = service.initialize_mfa(user_id, factors.clone()).await.unwrap();

        // Start verification
        let session_id = service.start_verification(user_id, factors).await.unwrap();

        // Verify factors
        let _ = service
            .verify_factor(session_id, MfaTokenType::Totp, "123456")
            .await;
        let _ = service
            .verify_factor(session_id, MfaTokenType::Sms, "123456")
            .await;

        // Run maintenance
        service.maintenance().await;
    }
}
