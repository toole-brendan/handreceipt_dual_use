use std::collections::HashMap;
use async_trait::async_trait;
use uuid::Uuid;

use crate::{
    error::CoreError,
    types::security::{SecurityContext, SecurityClassification},
};

pub struct AccessControlImpl {
    rules: HashMap<String, Vec<String>>, // resource -> allowed actions
}

impl AccessControlImpl {
    pub fn new() -> Self {
        Self {
            rules: HashMap::new(),
        }
    }

    pub fn add_rule(&mut self, resource: String, action: String) {
        self.rules
            .entry(resource)
            .or_insert_with(Vec::new)
            .push(action);
    }
}

impl Default for AccessControlImpl {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl super::AccessControl for AccessControlImpl {
    async fn check_permission(
        &self,
        context: &SecurityContext,
        resource: &str,
        action: &str,
    ) -> Result<bool, CoreError> {
        // Check if the resource exists and action is allowed
        if let Some(allowed_actions) = self.rules.get(resource) {
            if !allowed_actions.contains(&action.to_string()) {
                return Ok(false);
            }
        } else {
            return Ok(false);
        }

        // Check security classification
        if context.classification < SecurityClassification::Confidential {
            return Ok(false);
        }

        // TODO: Implement more sophisticated permission checks
        // For now, just return true if basic checks pass
        Ok(true)
    }
}
