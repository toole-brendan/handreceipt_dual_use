use sqlx::postgres::PgPoolOptions;
use sqlx::Executor;
use futures::TryStreamExt;
use std::fs;
use std::path::Path;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Get database URL from environment or use default
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://localhost/handreceipt".to_string());

    println!("Connecting to database...");
    
    // Create connection pool
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    println!("Creating schema_migrations table...");

    // Create schema_migrations table first
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        "#,
    )
    .execute(&pool)
    .await?;

    // Get migration files directly from CARGO_MANIFEST_DIR
    let migration_dir = Path::new(env!("CARGO_MANIFEST_DIR"));

    let mut migration_files: Vec<_> = fs::read_dir(&migration_dir)?
        .filter_map(|entry| entry.ok())
        .filter(|entry| {
            entry.path()
                .extension()
                .map(|ext| ext == "sql")
                .unwrap_or(false)
        })
        .collect();

    // Sort migrations by filename
    migration_files.sort_by_key(|a| a.path());

    // Execute each migration
    for migration in migration_files {
        let path = migration.path();
        let filename = path.file_name().unwrap().to_string_lossy();

        // Check if already applied using raw query
        let already_applied = sqlx::query_scalar::<_, bool>(
            "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = $1)"
        )
        .bind(filename.to_string())
        .fetch_one(&pool)
        .await?;

        if already_applied {
            println!("Migration {} already applied, skipping", filename);
            continue;
        }

        println!("Applying migration: {}", filename);

        let sql = fs::read_to_string(&path)?;
        
        // Execute the migration using raw connection to support multiple statements
        let mut conn = pool.acquire().await?;
        let mut stream = conn.execute_many(sql.as_str());
        
        while let Some(result) = stream.try_next().await? {
            println!("Executed statement: {} rows affected", result.rows_affected());
        }

        // Record migration
        sqlx::query(
            "INSERT INTO schema_migrations (version, applied_at) VALUES ($1, NOW())"
        )
        .bind(filename.to_string())
        .execute(&pool)
        .await?;

        println!("Successfully applied migration: {}", filename);
    }

    println!("Database setup completed successfully");
    Ok(())
}
