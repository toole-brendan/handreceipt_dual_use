use crate::services::core::audit::{AuditEvent, AuditError};
use serde_json::Value;

pub struct AuditValidator {
    max_details_size: usize,
    required_fields: Vec<String>,
}

impl AuditValidator {
    pub fn new() -> Self {
        Self {
            max_details_size: 1024 * 1024, // 1MB max details size
            required_fields: vec![
                "event_type".to_string(),
                "action".to_string(),
                "status".to_string(),
            ],
        }
    }

    pub fn validate(&self, event: &AuditEvent) -> Result<(), AuditError> {
        // Validate required fields are not empty
        if event.event_type.is_empty() {
            return Err(AuditError::InvalidData("event_type cannot be empty".to_string()));
        }
        if event.action.is_empty() {
            return Err(AuditError::InvalidData("action cannot be empty".to_string()));
        }

        // Validate details size
        let details_size = self.calculate_json_size(&event.details);
        if details_size > self.max_details_size {
            return Err(AuditError::InvalidData(format!(
                "details size exceeds maximum allowed size of {} bytes",
                self.max_details_size
            )));
        }

        Ok(())
    }

    fn calculate_json_size(&self, value: &Value) -> usize {
        serde_json::to_string(value)
            .map(|s| s.len())
            .unwrap_or(0)
    }

    pub fn set_max_details_size(&mut self, size: usize) {
        self.max_details_size = size;
    }

    pub fn add_required_field(&mut self, field: String) {
        self.required_fields.push(field);
    }
}

impl Default for AuditValidator {
    fn default() -> Self {
        Self::new()
    }
}
