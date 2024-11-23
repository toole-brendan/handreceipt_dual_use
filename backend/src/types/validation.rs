use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::types::security::SecurityClassification;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationContext {
    pub id: Uuid,
    pub rules: Vec<ValidationRule>,
    pub metadata: Option<HashMap<String, String>>,
    pub timestamp: DateTime<Utc>,
    pub classification: SecurityClassification,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationRule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub severity: ValidationSeverity,
    pub metadata: Option<HashMap<String, String>>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ValidationSeverity {
    Critical,
    High,
    Medium,
    Low,
    Info,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationMetrics {
    pub total_validations: u64,
    pub passed_validations: u64,
    pub failed_validations: u64,
    pub validation_time: std::time::Duration,
    pub last_validation: Option<DateTime<Utc>>,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
    pub context: ValidationContext,
    pub metrics: ValidationMetrics,
    pub timestamp: DateTime<Utc>,
}

impl ValidationContext {
    pub fn new(classification: SecurityClassification) -> Self {
        Self {
            id: Uuid::new_v4(),
            rules: Vec::new(),
            metadata: None,
            timestamp: Utc::now(),
            classification,
        }
    }

    pub fn add_rule(&mut self, rule: ValidationRule) {
        self.rules.push(rule);
    }
}

impl ValidationRule {
    pub fn new(id: String, description: String, severity: ValidationSeverity) -> Self {
        Self {
            id: id.clone(),
            name: id,
            description,
            severity,
            metadata: None,
        }
    }

    pub fn with_metadata(mut self, metadata: HashMap<String, String>) -> Self {
        self.metadata = Some(metadata);
        self
    }
}

impl ValidationMetrics {
    pub fn new() -> Self {
        Self {
            total_validations: 0,
            passed_validations: 0,
            failed_validations: 0,
            validation_time: std::time::Duration::from_secs(0),
            last_validation: None,
            errors: Vec::new(),
        }
    }
}

impl ValidationResult {
    pub fn new(context: ValidationContext) -> Self {
        Self {
            valid: true,
            errors: Vec::new(),
            warnings: Vec::new(),
            context,
            metrics: ValidationMetrics::new(),
            timestamp: Utc::now(),
        }
    }

    pub fn with_error(mut self, error: String) -> Self {
        self.valid = false;
        self.errors.push(error);
        self
    }

    pub fn with_warning(mut self, warning: String) -> Self {
        self.warnings.push(warning);
        self
    }
}
