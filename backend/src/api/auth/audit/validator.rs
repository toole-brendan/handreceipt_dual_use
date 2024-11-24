// src/services/signature/validator.rs

use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use crate::types::{
    security::SecurityClassification,
    audit::{SignatureMetadata, SignatureType, SignatureAlgorithm},
};
use std::sync::Arc;
use deadpool_postgres::Pool;
use crate::error::security::SecurityError;  // Updated to use correct error path

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub timestamp: DateTime<Utc>,
    pub metadata: Option<SignatureMetadata>,
    pub error: Option<String>,
}

pub struct SignatureValidator {
    pool: Pool,
}

impl SignatureValidator {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn initialize(&self) -> Result<(), Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        // Create validation history table with RLS
        client.execute(
            "CREATE TABLE IF NOT EXISTS signature_validations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                signature_id UUID NOT NULL,
                validator_id UUID NOT NULL,
                timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                is_valid BOOLEAN NOT NULL,
                error_message TEXT,
                classification_level INT NOT NULL,
                validation_type VARCHAR(50) NOT NULL,
                metadata JSONB,
                FOREIGN KEY (signature_id) REFERENCES signatures(id),
                FOREIGN KEY (validator_id) REFERENCES users(id)
            )", &[]
        ).await?;

        // Enable RLS
        client.execute(
            "ALTER TABLE signature_validations ENABLE ROW LEVEL SECURITY",
            &[],
        ).await?;

        // Create policy for reading based on classification level
        client.execute(
            "CREATE POLICY validation_access ON signature_validations
             FOR SELECT
             USING (classification_level <= current_setting('app.user_classification')::integer)",
            &[],
        ).await?;

        Ok(())
    }

    pub async fn validate_signature(
        &self,
        data: &[u8],
        signature: &[u8],
        validator_id: Uuid,
        classification: SecurityClassification,
    ) -> Result<ValidationResult, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        // Get the original signature record with RLS check
        client.execute(
            &format!("SET app.user_classification = '{}'", classification as i32),
            &[],
        ).await?;

        let row = client.query_opt(
            "SELECT id, signer_id, public_key, timestamp, classification_level, 
                    signature_type, algorithm
             FROM signatures 
             WHERE signature = $1
             AND classification_level <= $2",
            &[&signature, &(classification as i32)],
        ).await?;

        if let Some(row) = row {
            let public_key_bytes: Vec<u8> = row.get("public_key");
            let verifying_key = VerifyingKey::from_bytes(&public_key_bytes.try_into()?)?;
            
            let signature = Signature::from_bytes(signature.try_into()?);
            
            let validation_result = match verifying_key.verify(data, &signature) {
                Ok(_) => ValidationResult {
                    is_valid: true,
                    timestamp: Utc::now(),
                    metadata: Some(SignatureMetadata {
                        id: row.get("id"),
                        signer_id: row.get("signer_id"),
                        timestamp: row.get("timestamp"),
                        classification: SecurityClassification::from_str(
                            &row.get::<_, i32>("classification_level").to_string()
                        )?,
                        signature_type: serde_json::from_value(row.get("signature_type"))?,
                        algorithm: serde_json::from_value(row.get("algorithm"))?,
                    }),
                    error: None,
                },
                Err(e) => ValidationResult {
                    is_valid: false,
                    timestamp: Utc::now(),
                    metadata: None,
                    error: Some(e.to_string()),
                },
            };

            // Record validation attempt with RLS
            client.execute(
                "INSERT INTO signature_validations (
                    signature_id, validator_id, is_valid, error_message, 
                    classification_level, validation_type
                ) VALUES ($1, $2, $3, $4, $5, $6)",
                &[
                    &row.get::<_, Uuid>("id"),
                    &validator_id,
                    &validation_result.is_valid,
                    &validation_result.error,
                    &(classification as i32),
                    &"CRYPTOGRAPHIC",
                ],
            ).await?;

            Ok(validation_result)
        } else {
            Ok(ValidationResult {
                is_valid: false,
                timestamp: Utc::now(),
                metadata: None,
                error: Some("Signature not found or access denied".to_string()),
            })
        }
    }

    pub async fn get_validation_history(
        &self,
        signature_id: Uuid,
        user_classification: SecurityClassification,
    ) -> Result<Vec<ValidationResult>, Box<dyn std::error::Error>> {
        let client = self.pool.get().await?;

        // Set RLS context
        client.execute(
            &format!("SET app.user_classification = '{}'", user_classification as i32),
            &[],
        ).await?;

        let rows = client.query(
            "SELECT timestamp, is_valid, error_message, metadata
             FROM signature_validations
             WHERE signature_id = $1
             ORDER BY timestamp DESC",
            &[&signature_id],
        ).await?;

        let history = rows.iter().map(|row| ValidationResult {
            is_valid: row.get("is_valid"),
            timestamp: row.get("timestamp"),
            metadata: row.get("metadata"),
            error: row.get("error_message"),
        }).collect();

        Ok(history)
    }
}

pub struct AuditValidator {
    db_pool: Arc<Pool>,
}

impl AuditValidator {
    pub fn new(db_pool: Arc<Pool>) -> Self {
        Self { db_pool }
    }

    pub async fn validate_trail(&self, trail_id: uuid::Uuid) -> Result<bool, SecurityError> {
        // Implementation here
        Ok(true)
    }
}
