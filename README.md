# HandReceipt - Blockchain-Based Supply Chain Management

HandReceipt is a dual-use blockchain application designed for both military property management and civilian supply chain operations. It leverages blockchain technology to create a secure, transparent, and efficient system for tracking assets and managing transfers.

## Core Features

### Military Use Case
- Digital Hand Receipt Management
- Property Book Integration
- Sub-Hand Receipt System
- QR Code-based Asset Tracking
- Chain of Custody Tracking
- Compliance with Military Standards
- Secure Authentication and Authorization
- Unit/Organization Structure Management

### Civilian Use Case
- Supply Chain Management
- Inventory Tracking
- USDC Integration for Payments
- Smart Contract-based Transactions
- Supplier Management
- Purchase Order System
- Real-time Asset Tracking
- Digital Twin Technology

## Technology Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- React Native for mobile applications
- QR Code scanning and generation
- D3.js for data visualization

### Backend
- Rust for core business logic
- Blockchain integration (Hyperledger Sawtooth)
- Smart Contract System
- RESTful API

### Blockchain
- Digital Twin System
- Smart Contracts for:
  - Property Transfers
  - Payment Processing (USDC)
  - Asset Verification
  - Chain of Custody

## Getting Started

### Prerequisites
- Node.js 18+
- Rust
- Docker
- Hyperledger Sawtooth

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/handreceipt.git
cd handreceipt
```

2. Install dependencies
```bash
# Frontend
cd frontend_new
npm install

# Backend
cd ../backend
cargo build
```

3. Start the development environment
```bash
docker-compose up
```

## Architecture

The application follows a microservices architecture with:

1. Frontend Service
   - Web interface (React)
   - Mobile interface (React Native)

2. Backend Services
   - Asset Management Service
   - Authentication Service
   - Blockchain Integration Service
   - Payment Processing Service

3. Blockchain Layer
   - Digital Twin Management
   - Smart Contract Execution
   - Transaction Processing

## Security

- Military-grade encryption for sensitive data
- Role-based access control
- Blockchain-based immutable audit trail
- Secure key management
- Multi-factor authentication

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.






This is a description of my app — HandReceipt

Goal: Develop a secure, blockchain-based system for tracking property, ensuring high availability, enabling offline operation, and providing robust auditability.

Meant to be a secure military property management system using QR codes and blockchain verification. (mobile-first with offline support). Where QR codes or barcodes are affixed to property which, when scanned, prompt a transfer request to be sent to the current person assigned that property. (And Transfer Workflow =
 - QR code scanning for transfers with mobile, transfer approved or denied
* transfer "sent" to the backend where sawtooth blockchain uses PoET to verify and record the transfer.)


QR codes or barcodes are generated only by "officer" users (RBAC) and are linked to a digital twin of a piece of property