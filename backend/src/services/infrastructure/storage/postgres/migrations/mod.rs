use tokio_postgres::Client;
use crate::types::error::CoreError;
use super::extensions;

const CREATE_ASSETS_TABLE: &str = r#"
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    classification VARCHAR(50) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    signatures JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    qr_code TEXT,
    last_verified TIMESTAMP WITH TIME ZONE,
    verification_count INTEGER NOT NULL DEFAULT 0,
    rfid_tag_id VARCHAR(255),
    rfid_last_scanned TIMESTAMP WITH TIME ZONE,
    token_id UUID,
    current_custodian VARCHAR(255),
    hand_receipt_hash VARCHAR(255),
    last_known_location GEOMETRY(Point, 4326),
    location_history JSONB NOT NULL DEFAULT '[]',
    geofence_restrictions UUID[] NOT NULL DEFAULT '{}',
    location_classification VARCHAR(50) NOT NULL DEFAULT 'UNCLASSIFIED'
);

CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_classification ON assets(classification);
CREATE INDEX IF NOT EXISTS idx_assets_last_verified ON assets(last_verified);
CREATE INDEX IF NOT EXISTS idx_assets_current_custodian ON assets(current_custodian);
CREATE INDEX IF NOT EXISTS idx_assets_location ON assets USING GIST(last_known_location);
"#;

pub async fn run_migrations(client: &Client) -> Result<(), CoreError> {
    // Enable required extensions
    extensions::enable_extensions(client).await?;

    // Create assets table
    client.batch_execute(CREATE_ASSETS_TABLE)
        .await
        .map_err(|e| CoreError::Database(e.to_string()))?;

    Ok(())
}

pub async fn run_test_migrations(client: &Client) -> Result<(), CoreError> {
    run_migrations(client).await?;
    
    // Add any test-specific migrations here
    
    Ok(())
}
