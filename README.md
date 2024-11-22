# HandReceipt

A modern digital hand receipt system for tracking and managing military assets with support for offline operations, mesh networking, and multi-level security.

## Overview

HandReceipt modernizes the traditional military hand receipt process by providing:
- Digital asset tracking and chain of custody
- Offline-capable mobile scanning
- Secure mesh networking for remote operations
- Multi-level security classifications
- Automated inventory management

## Features

- **Digital Hand Receipts**
  - QR code and RFID scanning
  - Digital signatures
  - Chain of custody tracking
  - Automated inventory reconciliation

- **Security**
  - Multi-level security classifications
  - Role-based access control
  - Comprehensive audit logging
  - Hardware security module integration
  - Quantum-resistant encryption

- **Mesh Networking**
  - Peer-to-peer communication
  - Offline operation support
  - Automatic sync when online
  - Bluetooth and Wi-Fi Direct support

- **Mobile Support**
  - Native mobile apps
  - Offline scanning capability
  - Secure data storage
  - Background sync

## Architecture

### Backend (Rust)
- Clean architecture with domain-driven design
- Repository pattern for data access
- Async/await for high performance
- PostgreSQL with PostGIS for location data
- Comprehensive test coverage

### Frontend (React + TypeScript)
- Modern React with hooks
- Type-safe development
- Responsive design
- Offline-first architecture
- Progressive Web App (PWA)

### Mobile (React Native + Rust)
- Cross-platform mobile apps
- Native device features
- Secure storage
- Background sync

## Project Structure

```
.
├── backend/             # Rust backend service
│   ├── src/
│   │   ├── services/   # Business logic
│   │   ├── types/      # Domain types
│   │   └── infrastructure/  # External interfaces
│   └── tests/          # Unit and integration tests
├── frontend/           # React web application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Route pages
│   │   └── services/   # API clients
│   └── public/         # Static assets
└── mobile-app/         # React Native mobile app
    ├── src/
    │   ├── screens/    # Mobile screens
    │   └── services/   # Mobile services
    └── native/         # Native modules
```

## Setup

### Prerequisites
- Rust 1.70 or later
- Node.js 18 or later
- PostgreSQL 14 or later
- Docker (optional)

### Backend Setup
```bash
cd backend
cargo build
cargo test
cargo run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Mobile Setup
```bash
cd mobile-app
npm install
npm run ios     # For iOS
npm run android # For Android
```

### Database Setup
```bash
# Create database
createdb handreceipt

# Run migrations
cd backend
cargo run --bin migrate
```

## Development

### Running Tests
```bash
# Backend tests
cd backend
cargo test

# Frontend tests
cd frontend
npm test

# Mobile tests
cd mobile-app
npm test
```

### Code Style
- Rust: `rustfmt` and `clippy`
- TypeScript: ESLint and Prettier
- Pre-commit hooks enforce style

## Deployment

### Production Build
```bash
# Backend
cd backend
cargo build --release

# Frontend
cd frontend
npm run build

# Mobile
cd mobile-app
npm run build
```

### Docker
```bash
docker-compose up -d
```

## Security Considerations

- All data is encrypted at rest
- TLS for all network communication
- Regular security audits
- Hardware security module support
- Multi-factor authentication

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
