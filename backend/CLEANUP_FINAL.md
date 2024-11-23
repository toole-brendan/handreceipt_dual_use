# Final Backend Structure

## Core Functionality Focus
- QR code-based property transfers
- Role-based access (Officers, NCOs, Soldiers)
- Blockchain-verified transactions
- Property book management

## Directory Structure

```
backend/
├── src/
│   ├── domain/                    # Core business logic
│   │   ├── property/             # Property management
│   │   │   ├── entity.rs         # Property entity
│   │   │   ├── repository.rs     # Repository interface
│   │   │   ├── service.rs        # Domain service
│   │   │   └── mod.rs           # Module exports
│   │   │
│   │   └── transfer/            # Transfer management
│   │       ├── entity.rs         # Transfer records
│   │       ├── repository.rs     # Repository interface
│   │       ├── service.rs        # Transfer logic
│   │       └── mod.rs           # Module exports
│   │
│   ├── application/              # Application services
│   │   ├── property/            # Property use cases
│   │   │   ├── commands.rs       # Create, update, etc.
│   │   │   ├── queries.rs        # Search, get, etc.
│   │   │   └── qr.rs            # QR generation
│   │   │
│   │   └── transfer/            # Transfer use cases
│   │       ├── commands.rs       # Initiate, complete, etc.
│   │       └── validation.rs     # Transfer validation
│   │
│   ├── infrastructure/           # External implementations
│   │   ├── persistence/         # Data storage
│   │   │   └── postgres/        # PostgreSQL implementation
│   │   │
│   │   └── blockchain/          # Transaction verification
│   │       ├── authority.rs      # Authority node
│   │       └── verification.rs   # Transaction verification
│   │
│   └── api/                     # Web API
│       ├── auth/                # Authentication
│       │   ├── middleware.rs     # Auth middleware
│       │   └── service.rs        # Auth service
│       │
│       ├── handlers/            # Request handlers
│       │   ├── property.rs       # Property endpoints
│       │   └── transfer.rs       # Transfer endpoints
│       │
│       └── routes/              # Route definitions
│           └── mod.rs           # Route configuration
│
├── migrations/                  # Database migrations
│   └── ...
│
└── tests/                      # Tests
    ├── integration/            # Integration tests
    └── unit/                   # Unit tests
```

## Components to Remove
1. Barcode scanning (using QR only)
2. RFID functionality (future addition)
3. Mesh networking (future addition)
4. Offline functionality (future addition)
5. Unused middleware
6. Unused services

## Components to Keep
1. Property Management
   - Property entity and repository
   - QR code generation
   - Property book views

2. Transfer Processing
   - QR-based transfers
   - Transfer validation
   - Blockchain verification

3. Authentication/Authorization
   - Role-based access control
   - Command hierarchy
   - JWT authentication

4. API Layer
   - Property endpoints
   - Transfer endpoints
   - Role-based middleware

## Implementation Priority
1. Core Property Management
   - Property registration
   - QR code generation
   - Property queries

2. Transfer Processing
   - QR code scanning
   - Transfer validation
   - Blockchain verification

3. Access Control
   - Role-based permissions
   - Command hierarchy
   - Authentication

## Migration Steps
1. Move all property code to domain/property/
2. Move all transfer code to domain/transfer/
3. Consolidate auth code in api/auth/
4. Remove unused components
5. Update dependencies
6. Update tests

This structure focuses on the core functionality while maintaining clean separation of concerns and clear extension points for future features.
