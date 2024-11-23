#!/bin/bash
set -e

echo "Starting cleanup..."

# Clean up root level
echo "Cleaning up root level..."
rm -rf ../contracts
rm -rf ../deployment
rm -rf ../docs/mesh-network.md
rm -rf ../docs/communication.md
rm -rf ../docs/offline-operations.md
rm -rf ../docs/scanner.md

# Remove unused modules
echo "Removing unused modules..."

# Remove all mesh/network related code
rm -rf src/blockchain/network
rm -rf src/services/network
rm -rf src/types/mesh.rs
rm -rf src/models/mesh.rs
rm -rf src/models/network.rs
rm -rf src/error/mesh.rs
rm -rf src/error/network.rs
rm -rf src/error/sync.rs

# Remove old asset code
rm -rf src/domain/entities/asset.rs
rm -rf src/infrastructure/persistence/postgres/asset_repository.rs
rm -rf src/domain/repositories/asset_repository.rs
rm -rf src/application/services/asset_service.rs
rm -rf src/models/asset.rs
rm -rf src/services/infrastructure/storage/postgres/queries/asset.rs
rm -rf src/services/infrastructure/storage/postgres/repositories/asset.rs
rm -rf src/services/infrastructure/storage/repositories/asset
rm -rf src/services/infrastructure/storage/repositories/asset.rs

# Remove duplicate service implementations
rm -rf src/services/core
rm -rf src/services/infrastructure/storage

# Clean up backend tests
echo "Cleaning up backend tests..."

# Remove unused test directories
rm -rf tests/unit/mesh
rm -rf tests/unit/network
rm -rf tests/unit/scanning/barcode_test.rs
rm -rf tests/unit/scanning/rfid_test.rs
rm -rf tests/unit/scanning/nfc_test.rs
rm -rf tests/unit/location
rm -rf tests/integration/location_tracking_test.rs
rm -rf tests/integration/multi_device_test.rs
rm -rf tests/integration/offline_sync_test.rs

# Create unit test directory if it doesn't exist
mkdir -p tests/unit

# Move security tests if they exist
for test in access_control_test.rs audit_test.rs encryption_test.rs; do
    if [ -f "tests/unit/security/$test" ]; then
        mv "tests/unit/security/$test" "tests/unit/"
    fi
done

# Clean up mobile app
echo "Cleaning up mobile app..."
rm -rf ../mobile-app/src/mesh
rm -rf ../mobile-app/src/offline
rm -rf ../mobile-app/src/communication
rm -rf ../mobile-app/src/__tests__/mesh.test.ts
rm -rf ../mobile-app/src/__tests__/offline.test.ts
rm -rf ../mobile-app/src/scanning/implementations/barcode_scanner.ts
rm -rf ../mobile-app/src/scanning/implementations/nfc_scanner.ts
rm -rf ../mobile-app/src/scanning/implementations/rfid_scanner.ts

# Clean up frontend
echo "Cleaning up frontend..."
rm -rf ../frontend/src/components/assets
rm -rf ../frontend/src/ui/components/assets
rm -rf ../frontend/src/pages/assets
rm -rf ../frontend/src/store/slices/assetSlice.ts
rm -rf ../frontend/src/store/slices/meshSlice.ts
rm -rf ../frontend/src/store/slices/offlineSlice.ts
rm -rf ../frontend/src/types/asset.ts
rm -rf ../frontend/src/types/rfid.ts
rm -rf ../frontend/src/types/mesh.ts

# Clean up empty directories
echo "Cleaning up empty directories..."
find src -type d -empty -delete
find tests -type d -empty -delete
find ../frontend/src -type d -empty -delete
find ../mobile-app/src -type d -empty -delete

# Update module files
echo "Updating module files..."

# Update domain/mod.rs
cat > src/domain/mod.rs << 'EOL'
//! Core domain models and business logic

pub mod property;
pub mod transfer;
EOL

# Update application/services/mod.rs
cat > src/application/services/mod.rs << 'EOL'
//! Application services implementing core business logic

pub mod property_service;
pub mod qr_service;
pub mod transfer_service;
EOL

# Update infrastructure/mod.rs
cat > src/infrastructure/mod.rs << 'EOL'
//! External service implementations

pub mod blockchain;
pub mod persistence;
EOL

# Update security/mod.rs
cat > src/security/mod.rs << 'EOL'
//! Security module providing core security features for the property management system.
//! 
//! This module includes:
//! - Role-based access control
//! - Audit trail with Merkle tree verification
//! - Encryption for sensitive data
//! - Digital signatures for transfer verification

pub mod access_control;
pub mod audit;
pub mod encryption;
pub mod merkle;

pub use access_control::AccessControl;
pub use audit::AuditChain;
pub use encryption::Encryption;
EOL

# Update models/mod.rs
cat > src/models/mod.rs << 'EOL'
//! Core data models

pub mod blockchain;
pub mod location;
pub mod qr;
pub mod signature;
pub mod transfer;
pub mod types;
pub mod verification;
EOL

# Update error/mod.rs
cat > src/error/mod.rs << 'EOL'
//! Error types and handling

pub mod api;
pub mod audit;
pub mod blockchain;
pub mod core;
pub mod database;
pub mod security;
pub mod validation;

pub use api::ApiError;
pub use audit::AuditError;
pub use blockchain::BlockchainError;
pub use core::CoreError;
pub use database::DatabaseError;
pub use security::SecurityError;
pub use validation::ValidationError;
EOL

# Update tests/mod.rs
cat > tests/mod.rs << 'EOL'
//! Integration and unit tests for core functionality

pub mod integration;
pub mod unit;
EOL

echo "Cleanup complete!"
echo "
Core Features Preserved:
- Property management (domain/property/)
- Transfer workflow (domain/transfer/)
- QR code handling (services/qr_service.rs)
- Blockchain verification (infrastructure/blockchain/)
- Security features:
  * Role-based access (security/access_control.rs)
  * Audit trail (security/audit/)
  * Encryption (security/encryption/)
  * Digital signatures (security/merkle.rs)
- Core tests:
  * Transfer workflow tests
  * Security tests
  * API integration tests

Please review changes before committing."
