# HandReceipt

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

## Project Structure

```
.
├── backend/                 # Rust backend service
│   ├── src/
│   │   ├── domain/         # Core business logic
│   │   │   ├── property/   # Property management
│   │   │   └── transfer/   # Transfer processing
│   │   ├── application/    # Application services
│   │   ├── infrastructure/ # External implementations
│   │   └── security/       # Security features
│   └── tests/              # Integration & unit tests
│
├── frontend/               # React web interface
│   └── src/
│       ├── pages/         # Page components
│       │   ├── property/  # Property views
│       │   └── reports/   # Report generation
│       └── ui/            # Reusable components
│
└── mobile/                # Mobile QR scanner
    └── src/
        └── scanner/       # QR code scanning
```

## Getting Started

### Prerequisites

- Rust 1.70+
- Node.js 18+
- PostgreSQL 14+
- OpenSSL

### Backend Setup

1. Install dependencies:
```bash
cd backend
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

4. Start server:
```bash
cargo run
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

### Mobile Setup

1. Install dependencies:
```bash
cd mobile
cargo build
```

2. Run scanner:
```bash
cargo run
```

## Development

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

### Architecture

The system follows Domain-Driven Design with a clean architecture:

- Domain Layer: Core business logic and rules
- Application Layer: Use case implementations
- Infrastructure Layer: External service implementations
- API Layer: HTTP interface and middleware
- Security Layer: Cross-cutting security concerns

### Testing

Run backend tests:
```bash
cd backend
cargo test
```

Run frontend tests:
```bash
cd frontend
npm test
```

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

## License

This project is licensed under the MIT License - see LICENSE file for details.
