# Revised Backend Structure

## Core Functionality
- QR code scanning for property transfers
- Role-based property book visibility
- Blockchain-verified transactions
- Fast transfer validation

```
backend/
├── src/
│   ├── domain/                    # Core business logic
│   │   ├── property/             # Property management
│   │   │   ├── entity.rs         # Property entity
│   │   │   ├── repository.rs     # Repository interface
│   │   │   └── service.rs        # Domain service
│   │   │
│   │   ├── transfer/            # Transfer management
│   │   │   ├── entity.rs         # Transfer records
│   │   │   ├── repository.rs     # Repository interface
│   │   │   └── service.rs        # Transfer logic
│   │   │
│   │   └── user/                # User management
│   │       ├── entity.rs         # User entity & roles
│   │       ├── repository.rs     # Repository interface
│   │       └── service.rs        # User logic
│   │
│   ├── application/              # Use cases
│   │   ├── property/            # Property management
│   │   │   ├── commands.rs       # Property commands
│   │   │   ├── queries.rs        # Property queries
│   │   │   └── qr.rs            # QR code generation
│   │   │
│   │   ├── transfer/            # Transfer processing
│   │   │   ├── commands.rs       # Transfer commands
│   │   │   └── validation.rs     # Transfer validation
│   │   │
│   │   └── reports/             # Property book reports
│   │       ├── queries.rs        # Report queries
│   │       └── views.rs          # Report views
│   │
│   ├── infrastructure/           # External implementations
│   │   ├── persistence/         # Data storage
│   │   │   └── postgres/         # Primary database
│   │   │
│   │   ├── blockchain/          # Transaction ledger
│   │   │   ├── ledger.rs        # Transfer records
│   │   │   └── validation.rs    # Transaction validation
│   │   │
│   │   └── security/           # Security features
│   │       ├── auth.rs          # Authentication
│   │       └── roles.rs         # Role management
│   │
│   └── api/                     # API endpoints
│       ├── mobile/             # Mobile endpoints
│       │   ├── property.rs      # Property endpoints
│       │   └── transfer.rs      # Transfer endpoints
│       │
│       ├── web/               # Web endpoints
│       │   ├── property.rs     # Property management
│       │   ├── transfers.rs    # Transfer management
│       │   └── reports.rs      # Officer/NCO reports
│       │
│       └── middleware/        # API middleware
│           ├── auth.rs         # Authentication
│           └── roles.rs        # Role validation
│
├── migrations/                  # Database migrations
│   └── ...
│
└── tests/                      # Tests
    ├── integration/            # Integration tests
    │   ├── property/           # Property tests
    │   ├── transfer/           # Transfer tests
    │   └── blockchain/         # Blockchain tests
    │
    └── unit/                   # Unit tests
        ├── property/           # Property tests
        ├── transfer/           # Transfer tests
        └── blockchain/         # Blockchain tests
```

## Key Features

1. **QR-Based Transfers**
   - QR code generation for property items
   - Fast scanning and validation
   - Immutable transfer records

2. **Role-Based Access**
   - Officers: View all under command
   - NCOs: View all under command
   - Soldiers: View own property

3. **Property Management**
   - Property registration
   - Transfer history
   - Property book views

4. **Blockchain Integration**
   - Immutable transfer ledger
   - Transaction validation
   - Audit trail

## Extension Points

1. **Future RFID Support**
   - The `property` module can be extended with RFID capabilities
   - Add RFID-specific endpoints in `api/mobile`
   - Add RFID scanning logic in application layer

2. **Future Offline Support**
   - Add offline storage in infrastructure
   - Add sync management in application layer
   - Add mesh networking capabilities

## Implementation Priorities

1. Core Property Management
   - Property registration
   - QR code generation
   - Property book views

2. Transfer Processing
   - QR code scanning
   - Transfer validation
   - Blockchain ledger

3. Role-Based Access
   - User authentication
   - Command hierarchy
   - Property visibility

This structure focuses on a single, authoritative database with blockchain for transfer record immutability, following standard military security practices.
