use std::sync::Arc;
use tokio::sync::RwLock; // Added RwLock import
use chrono::{DateTime, Utc};
use uuid::Uuid;
use serde::{Serialize, Deserialize};

use crate::types::{
    security::{SecurityContext, SecurityClassification},
    blockchain::{Transaction, TransactionStatus, TransactionType, TransactionData},
    validation::{ValidationContext, ValidationRule, ValidationSeverity},
    audit::{AuditEvent, AuditEventType, AuditContext, AuditSeverity},
    signature::{SignatureMetadata, SignatureType, SignatureAlgorithm},
};
use crate::error::{BlockchainError, Result};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionMetadata {
    pub submitter: String,
    pub priority: u32,
    pub expiry: Option<DateTime<Utc>>,
    pub dependencies: Vec<Uuid>,
    pub classification: SecurityClassification,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessingResult {
    pub transaction_id: Uuid,
    pub status: TransactionStatus,
    pub timestamp: DateTime<Utc>,
    pub error: Option<String>,
}

pub struct TransactionProcessor {
    audit_trail: Arc<dyn AuditTrailHandler>,
    node_info: Arc<RwLock<NodeInfo>>,
    validation_rules: Vec<ValidationRule>,
}

impl TransactionProcessor {
    pub fn new(
        audit_trail: Arc<dyn AuditTrailHandler>,
        node_info: Arc<RwLock<NodeInfo>>,
    ) -> Self {
        let validation_rules = vec![
            ValidationRule::new(
                "transaction_size".to_string(),
                "Transaction size within limits".to_string(),
                ValidationSeverity::Critical,
            ),
            ValidationRule::new(
                "transaction_expiry".to_string(),
                "Transaction not expired".to_string(),
                ValidationSeverity::High,
            ),
            ValidationRule::new(
                "transaction_dependencies".to_string(),
                "Transaction dependencies satisfied".to_string(),
                ValidationSeverity::High,
            ),
        ];

        Self {
            audit_trail,
            node_info,
            validation_rules,
        }
    }

    pub async fn process_transaction(
        &self,
        transaction: &mut Transaction,
        context: &SecurityContext,
    ) -> Result<ProcessingResult> {
        // Validate transaction
        let validation_context = ValidationContext::new(context.classification);
        if !self.validate_transaction(transaction, &validation_context).await? {
            return Err(BlockchainError::InvalidTransaction(
                "Transaction validation failed".to_string()
            ));
        }

        // Process based on type
        let result = match transaction.transaction_type {
            TransactionType::AssetTransfer => {
                self.process_asset_transfer(transaction, context).await?
            }
            TransactionType::AssetCreation => {
                self.process_asset_creation(transaction, context).await?
            }
            TransactionType::AssetUpdate => {
                self.process_asset_update(transaction, context).await?
            }
            TransactionType::AssetDeletion => {
                self.process_asset_deletion(transaction, context).await?
            }
        };

        // Log audit event
        let audit_event = AuditEvent::new(
            AuditEventType::TransactionProcessed,
            serde_json::json!({
                "transaction_id": transaction.id,
                "transaction_type": transaction.transaction_type,
                "status": result.status,
            }),
            AuditContext::new(
                "process_transaction".to_string(),
                AuditSeverity::Low,
                context.classification,
            ),
            SignatureMetadata::new(
                Uuid::new_v4(),
                vec![],
                Uuid::new_v4(),
                context.classification,
                SignatureType::Transaction,
                SignatureAlgorithm::Ed25519,
            ),
        );

        self.audit_trail.log_event(audit_event, context).await?;

        Ok(result)
    }

    async fn validate_transaction(
        &self,
        transaction: &Transaction,
        context: &ValidationContext,
    ) -> Result<bool> {
        // Basic validation
        if transaction.id == Uuid::nil() {
            return Ok(false);
        }

        // Check classification
        if transaction.classification < context.classification {
            return Ok(false);
        }

        // Check expiry
        if let Some(expiry) = transaction.data.get("expiry").and_then(|v| v.as_str()) {
            if let Ok(expiry) = chrono::DateTime::parse_from_rfc3339(expiry) {
                if expiry < Utc::now() {
                    return Ok(false);
                }
            }
        }

        // Check dependencies
        if let Some(deps) = transaction.data.get("dependencies").and_then(|v| v.as_array()) {
            for dep in deps {
                if let Some(dep_id) = dep.as_str() {
                    if !self.check_dependency(dep_id).await? {
                        return Ok(false);
                    }
                }
            }
        }

        Ok(true)
    }

    async fn process_asset_transfer(
        &self,
        transaction: &mut Transaction,
        context: &SecurityContext,
    ) -> Result<ProcessingResult> {
        // Implement asset transfer logic
        transaction.status = TransactionStatus::Confirmed;

        Ok(ProcessingResult {
            transaction_id: transaction.id,
            status: transaction.status,
            timestamp: Utc::now(),
            error: None,
        })
    }

    async fn process_asset_creation(
        &self,
        transaction: &mut Transaction,
        context: &SecurityContext,
    ) -> Result<ProcessingResult> {
        // Implement asset creation logic
        transaction.status = TransactionStatus::Confirmed;

        Ok(ProcessingResult {
            transaction_id: transaction.id,
            status: transaction.status,
            timestamp: Utc::now(),
            error: None,
        })
    }

    async fn process_asset_update(
        &self,
        transaction: &mut Transaction,
        context: &SecurityContext,
    ) -> Result<ProcessingResult> {
        // Implement asset update logic
        transaction.status = TransactionStatus::Confirmed;

        Ok(ProcessingResult {
            transaction_id: transaction.id,
            status: transaction.status,
            timestamp: Utc::now(),
            error: None,
        })
    }

    async fn process_asset_deletion(
        &self,
        transaction: &mut Transaction,
        context: &SecurityContext,
    ) -> Result<ProcessingResult> {
        // Implement asset deletion logic
        transaction.status = TransactionStatus::Confirmed;

        Ok(ProcessingResult {
            transaction_id: transaction.id,
            status: transaction.status,
            timestamp: Utc::now(),
            error: None,
        })
    }

    async fn check_dependency(&self, dependency_id: &str) -> Result<bool> {
        // Implement dependency checking logic
        Ok(true)
    }

    pub async fn get_node_info(&self) -> Result<NodeInfo> {
        Ok(self.node_info.read().await.clone())
    }
}

#[async_trait::async_trait]
pub trait AuditTrailHandler: Send + Sync {
    async fn log_event(&self, event: AuditEvent, context: &SecurityContext) -> Result<()>;
}

#[derive(Debug, Clone)]
pub struct NodeInfo {
    pub id: Uuid,
    pub capabilities: Vec<String>,
    pub status: NodeStatus,
    pub last_seen: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum NodeStatus {
    Active,
    Inactive,
    Failed,
}
