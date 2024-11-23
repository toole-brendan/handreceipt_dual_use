# HandReceipt Backend

A secure military property management system using QR codes and blockchain verification.

## Core Features

- **Property Management**
  - QR code-based property tracking
  - Role-based access control (Officers, NCOs, Soldiers)
  - Location and condition tracking
  - Audit trail with Merkle tree verification

- **Transfer Workflow**
  - QR code scanning for transfers
  - Commander approval for sensitive items
  - Blockchain verification of transfers
  - Digital signatures with Ed25519

- **Security**
  - Role-based access control
  - Audit trails with Merkle tree verification
  - Encryption for sensitive data
  - Command chain validation

## Architecture

The system follows Domain-Driven Design with a clean architecture:

```
src/
├── domain/           # Core business logic
│   ├── property/     # Property management
│   │   ├── entity.rs     # Property entity
│   │   ├── repository.rs # Repository interface
│   │   └── service.rs    # Domain service
│   └── transfer/     # Transfer processing
│
├── application/      # Application services
│   └── services/
│       ├── property_service.rs    # Property operations
│       ├── qr_service.rs         # QR code handling
│       └── transfer_service.rs   # Transfer workflow
│
├── infrastructure/   # External implementations
│   ├── persistence/
│   │   └── postgres/    # PostgreSQL repositories
│   └── blockchain/
│       └── authority.rs # Blockchain verification
│
├── api/             # Web API layer
│   ├── handlers/    # Request handlers
│   ├── routes/      # API routes
│   └── middleware/  # Auth & validation
│
└── security/        # Security features
    ├── access_control.rs # RBAC
    ├── audit/           # Audit trail
    ├── encryption/      # Data encryption
    └── merkle.rs        # Merkle tree
```

## Getting Started

### Prerequisites

- Rust 1.70+
- PostgreSQL 14+
- OpenSSL

### Setup

1. Install dependencies:
```bash
cargo install sqlx-cli
```

2. Create database:
```bash
createdb handreceipt
```

3. Run migrations:
```bash
sqlx migrate run
```

4. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

### Running

Development:
```bash
cargo run
```

Production:
```bash
cargo build --release
./target/release/handreceipt
```

### Testing

Run all tests:
```bash
cargo test
```

Run integration tests:
```bash
cargo test --test '*'
```

## API Documentation

See [api.md](docs/api.md) for detailed API documentation.

Key endpoints:

- `POST /api/v1/property` - Create property
- `GET /api/v1/property/{id}` - Get property details
- `GET /api/v1/property/{id}/qr` - Generate QR code
- `POST /api/v1/property/transfer` - Initiate transfer
- `POST /api/v1/property/transfer/{id}/approve` - Approve transfer

## Development

### Code Organization

- `domain/` - Core business logic and interfaces
- `application/` - Use case implementations
- `infrastructure/` - External service implementations
- `api/` - HTTP interface and middleware
- `security/` - Security features

### Key Components

1. Property Management
   - Property entity with QR code support
   - Role-based access control
   - Location tracking
   - Condition monitoring

2. Transfer Processing
   - QR code scanning
   - Commander approval workflow
   - Blockchain verification
   - Digital signatures

3. Security
   - JWT authentication
   - Role-based authorization
   - Command hierarchy validation
   - Audit trails

### Adding Features

1. Create domain entities/interfaces in `domain/`
2. Implement services in `application/services/`
3. Add persistence in `infrastructure/persistence/`
4. Create API handlers in `api/handlers/`
5. Add tests in `tests/`

## Security Features

### Authentication

Uses JWT tokens with:
- User ID
- Name
- Rank
- Unit
- Role

### Authorization

Role-based access control:
- Officers can approve sensitive transfers
- NCOs can manage property
- Soldiers can initiate transfers

### Blockchain Verification

Transfers are verified using:
- Digital signatures (Ed25519)
- Authority consensus
- Command chain validation
- Merkle tree verification

### Audit Trail

All actions are logged with:
- Merkle tree verification
- Digital signatures
- Timestamp
- User information
- Location data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Add tests
5. Create pull request

## License

This project is licensed under the MIT License - see LICENSE file for details.






JUST SO YOU ARE AWARE THE AVERAGE USER WILL USE THIS APP ON THEIR MOBILE BY TAKING A PHOTO OF A BARCODE OR QR CODE (USUALLY QR) THAT THEN REGISTERS THEY ARE "SIGNING FOR" THAT PIECE OF PROPERTY, AUTOMATICALLY GENERATING THE HAND RECEIPT TRANSACTION BETWEEN THE THE PREVIOUS HOLDER AND THE NEW HOLDER, AND THEN COMMANDERS AND OFFICERS HAVE VISIBILITY ABOUT INTO WHO ALL CURRENT HOLDERS OF ALL PROPERTY ARE AND WHEN TRANSACTIONS TOOK PLACE, ETC..... BUT ALSO ALL USERS, INCLUDING OFFICERS AND SOLDIERS, CAN SEE ALL THE PROPERTY THAT THEY ARE CURRENTLY SIGNED FOR AND WHAT THEIR TRANSACTION HISTORY IS LIKE
- QR CODE FOR EACH INDIVIDUAL ITEM, APP NEEDS ABILITY TO GENERATE NEW QR CODES WHICH NEEDS TO BE A FEATURE THAT OFFICERS AND NCOS CAN ACCESS WHERE THEY FILL OUT THE SPECIFICS OF THE PIECE OF PROPERTY, JUST ONE TYPE OF QR CODE, TRANSFERS CAN BE BATCHED IF ITS EASIER I JUST WNAT THE TRANSFERS TO BE VALIDATED VERY QUICKLY, OFFICERS (JUST USE "OFFICERS" NOT COMMANDERS) DONT NEED REAL-TIME NOTIFICATIONS BUT THEY NEED TO HAVE ABILITY TO VIEW LIVE THE TRANSACTIONS TAKING PLACE ON THEIR DASHBOARD WHICH THEY CAN VIEW WHENEVER THEY WANT, IN TERMS OF ANALYTICS THEY JUST NEED TO SEE ALL SOLDIERS' PROPERTY BOOK AND TRANSACTION HISTORY (SOLDIERS UNDER THIER COMMAND), THERE ARE 3 DIFFERENT TYPES OF USERS THAT WOULD USE THIS APP -- OFFICERS, NCOs, AND SOLDIERS -- OFFICERS AND NCOs CAN VIEW PROPERTY BOOKS AND TRANSACTION HISTORIES OF THE SOLDIERS UNDER THEIR COMMAND (BUT NOT SOLDIERS NOT UNDER THEIR COMMAND), I WANT THE TRANSACTIONS TO BE FAST BUT UNALTERABLE SO THAT IS WHY I WANT A BLOCKCHAIN FUNCTIONALITY