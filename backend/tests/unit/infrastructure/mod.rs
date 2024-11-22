use deadpool_postgres::Config;
use backend::{
    types::error::CoreError,
    services::infrastructure::InfrastructureService,
};

pub async fn create_test_service() -> Result<InfrastructureService, CoreError> {
    let mut cfg = Config::new();
    cfg.host = Some("localhost".to_string());
    cfg.port = Some(5432);
    cfg.dbname = Some("test_db".to_string());
    cfg.user = Some("test_user".to_string());
    cfg.password = Some("test_pass".to_string());
    
    let pool = cfg.create_pool(None, tokio_postgres::NoTls)
        .map_err(|e| CoreError::Database(e.to_string()))?;

    let service = InfrastructureService::new(pool);
    service.initialize().await?;
    Ok(service)
}

#[cfg(test)]
mod tests {
    use super::*;
    use backend::types::{
        security::{SecurityContext, SecurityClassification},
        asset::Asset,
    };
    use uuid::Uuid;

    #[tokio::test]
    async fn test_infrastructure_service() -> Result<(), CoreError> {
        let service = create_test_service().await?;
        let context = SecurityContext {
            user_id: Uuid::new_v4(),
            classification: SecurityClassification::Unclassified,
            permissions: vec![],
        };

        // Test asset operations
        let asset = Asset::new(
            "Test Asset".to_string(),
            "Test Description".to_string(),
            SecurityClassification::Unclassified,
        );

        // Test update
        service.update_asset(&asset, &context).await?;

        // Test get
        let retrieved = service.get_asset(asset.id, &context).await?;
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().id, asset.id);

        // Test list
        let assets = service.list_assets(&context).await?;
        assert!(!assets.is_empty());

        Ok(())
    }
}
