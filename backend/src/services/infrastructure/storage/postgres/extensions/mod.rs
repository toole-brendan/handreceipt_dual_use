use tokio_postgres::Client;
use crate::types::error::CoreError;

pub async fn enable_extensions(client: &Client) -> Result<(), CoreError> {
    // Enable PostGIS extension
    client.execute("CREATE EXTENSION IF NOT EXISTS postgis;", &[])
        .await
        .map_err(|e| CoreError::Database(e.to_string()))?;

    Ok(())
}
