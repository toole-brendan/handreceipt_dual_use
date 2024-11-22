export const migrations = [
  // Assets table
  `CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    location TEXT,
    last_scanned TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending',
    encrypted_data TEXT
  );`,

  // Operations queue table
  `CREATE TABLE IF NOT EXISTS operations (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    asset_id TEXT,
    data TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    priority INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    retry_count INTEGER DEFAULT 0,
    FOREIGN KEY (asset_id) REFERENCES assets (id)
  );`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_assets_sync_status ON assets(sync_status);`,
  `CREATE INDEX IF NOT EXISTS idx_operations_status ON operations(status);`,
  `CREATE INDEX IF NOT EXISTS idx_operations_priority ON operations(priority);`,

  // Add conflicts table
  `CREATE TABLE IF NOT EXISTS conflicts (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL,
    conflict_data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    resolved_at TEXT,
    status TEXT DEFAULT 'pending',
    resolution_type TEXT,
    FOREIGN KEY (asset_id) REFERENCES assets (id)
  );`,

  // Add index for conflicts
  `CREATE INDEX IF NOT EXISTS idx_conflicts_status ON conflicts(status);`,
  `CREATE INDEX IF NOT EXISTS idx_conflicts_asset ON conflicts(asset_id);`
];
