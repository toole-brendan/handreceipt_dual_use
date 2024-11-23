use anyhow::Result;
use sqlx::postgres::PgPoolOptions;
use backend::services::infrastructure::storage::postgres::migrations::{
    ensure_migrations_table,
    run_migrations,
};

#[tokio::test]
async fn test_migrations() -> Result<()> {
    // This requires a test database to be available
    let database_url = std::env::var("TEST_DATABASE_URL")
        .unwrap_or_else(|_| "postgres://localhost/handreceipt_test".to_string());

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    ensure_migrations_table(&pool).await?;
    run_migrations(&pool).await?;

    // Verify migrations were applied
    let migrations = sqlx::query!(
        "SELECT version FROM schema_migrations ORDER BY version"
    )
    .fetch_all(&pool)
    .await?;

    assert!(!migrations.is_empty(), "No migrations were applied");
    
    // Verify updates table exists and has correct structure
    let table_exists = sqlx::query!(
        r#"
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'updates'
        ) as "exists!"
        "#
    )
    .fetch_one(&pool)
    .await?;

    assert!(table_exists.exists, "Updates table was not created");

    // Clean up test database
    sqlx::query!("DROP TABLE IF EXISTS updates, sync_states, failed_updates_archive, schema_migrations")
        .execute(&pool)
        .await?;

    Ok(())
}

#[tokio::test]
async fn test_idempotent_migrations() -> Result<()> {
    let database_url = std::env::var("TEST_DATABASE_URL")
        .unwrap_or_else(|_| "postgres://localhost/handreceipt_test".to_string());

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    // Run migrations twice
    ensure_migrations_table(&pool).await?;
    run_migrations(&pool).await?;
    run_migrations(&pool).await?; // Should not error

    // Clean up
    sqlx::query!("DROP TABLE IF EXISTS updates, sync_states, failed_updates_archive, schema_migrations")
        .execute(&pool)
        .await?;

    Ok(())
}
