use sqlx::PgPool;
use std::error::Error;

pub async fn run_migrations(pool: &PgPool) -> Result<(), Box<dyn Error>> {
    // Run initial migrations
    sqlx::query(include_str!("migrations/20231201_000_create_migrations.sql"))
        .execute(pool)
        .await?;

    sqlx::query(include_str!("migrations/20231201_001_initial_schema.sql"))
        .execute(pool)
        .await?;

    // Run sync schema migration
    sqlx::query(include_str!("migrations/20231201_002_sync_schema.sql"))
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn rollback_migrations(pool: &PgPool) -> Result<(), Box<dyn Error>> {
    // Drop sync tables
    sqlx::query(
        r#"
        DROP TABLE IF EXISTS changes CASCADE;
        DROP TABLE IF EXISTS resources CASCADE;
        DROP TABLE IF EXISTS sync_states CASCADE;
        DROP TABLE IF EXISTS failed_updates_archive CASCADE;
        "#,
    )
    .execute(pool)
    .await?;

    // Drop initial schema tables
    sqlx::query(
        r#"
        DROP TABLE IF EXISTS migrations CASCADE;
        "#,
    )
    .execute(pool)
    .await?;

    Ok(())
}
