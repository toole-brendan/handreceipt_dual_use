pub mod encryption;
pub mod access_control;
pub mod audit;
pub mod hsm;
pub mod key_management;
pub mod mfa;
pub mod validation;

pub use encryption::KeyManagement;
pub use access_control::AccessControl;

use std::sync::Arc;
use uuid::Uuid;
use crate::types::{
    security::{SecurityContext, SecurityClassification},
    permissions::{Action, Permission, ResourceType},
    error::CoreError,
};

pub struct SecurityModule {
    context: Arc<SecurityContext>,
}

impl SecurityModule {
    pub fn new() -> Self {
        // Create a default security context for initialization
        let context = SecurityContext::new(
            SecurityClassification::Unclassified,
            Uuid::new_v4(),
            "default-token".to_string(),
            vec![],
        );
        
        Self {
            context: Arc::new(context),
        }
    }

    pub fn with_context(context: SecurityContext) -> Self {
        Self {
            context: Arc::new(context),
        }
    }

    pub async fn hash_document(&self, data: &str) -> Result<String, CoreError> {
        use sha2::{Sha256, Digest};
        let mut hasher = Sha256::new();
        hasher.update(data);
        Ok(format!("{:x}", hasher.finalize()))
    }

    pub fn get_context(&self) -> Arc<SecurityContext> {
        self.context.clone()
    }
}

#[cfg(test)]
pub mod test {
    use super::*;

    pub fn create_test_context() -> SecurityContext {
        SecurityContext::new(
            SecurityClassification::Unclassified,
            Uuid::new_v4(),
            "test-token".to_string(),
            vec![],
        )
    }
}
