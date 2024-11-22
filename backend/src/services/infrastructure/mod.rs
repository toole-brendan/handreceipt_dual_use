pub mod storage;

use std::sync::Arc;
use crate::services::core::security::SecurityModule;
use crate::types::error::DatabaseError;

/// Infrastructure service factory
pub struct InfrastructureService {
    storage: Arc<storage::postgres::PostgresPool>,
}

impl InfrastructureService {
    /// Create a new infrastructure service
    pub async fn new(security: Arc<SecurityModule>) -> Result<Self, DatabaseError> {
        let storage = Arc::new(storage::postgres::PostgresPool::new(security).await?);
        
        Ok(Self {
            storage,
        })
    }

    /// Get the asset repository
    pub fn asset_repository(&self) -> Arc<dyn storage::repositories::AssetRepository + Send + Sync> {
        Arc::new(storage::postgres::repositories::PostgresAssetRepository::new(self.storage.clone()))
    }

    /// Get the audit repository
    pub fn audit_repository(&self) -> Arc<dyn storage::repositories::AuditRepository + Send + Sync> {
        // TODO: Implement PostgresAuditRepository
        unimplemented!()
    }

    /// Get the security repository
    pub fn security_repository(&self) -> Arc<dyn storage::repositories::SecurityRepository + Send + Sync> {
        // TODO: Implement PostgresSecurityRepository
        unimplemented!()
    }

    /// Get the raw database connection pool
    /// 
    /// Warning: This is provided for legacy support and direct database access.
    /// New code should use the repository interfaces instead.
    #[deprecated(
        since = "0.1.0",
        note = "Use repository interfaces instead of direct database access"
    )]
    pub fn database(&self) -> Arc<storage::postgres::PostgresPool> {
        self.storage.clone()
    }
}

#[cfg(test)]
pub mod test {
    use super::*;
    use crate::services::core::security::test::MockSecurityModule;

    /// Create a test infrastructure service
    pub async fn create_test_service() -> InfrastructureService {
        let security = Arc::new(MockSecurityModule::new());
        InfrastructureService::new(security).await.unwrap()
    }
}
