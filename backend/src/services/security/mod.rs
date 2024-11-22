use std::sync::Arc;
use crate::core::SecurityContext;
use crate::models::error::CoreError;

pub struct SecurityModule {
    context: Arc<SecurityContext>,
}

impl SecurityModule {
    pub fn new(context: SecurityContext) -> Self {
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
} 