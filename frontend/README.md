# HandReceipt Frontend

A modern web and mobile application for military property accountability, replacing traditional paper-based hand receipts with a secure, efficient digital system.

## Core Purpose

This frontend application serves as the digital transformation of the military's property accountability system. It provides role-based interfaces determined by military rank, enabling seamless property management, transfers, and oversight across all levels of command.

## Key Features

### Universal Features (All Users)
- 📱 Mobile-first design with QR code scanning capability
- 📦 Personal property book management
- 🔄 Equipment transfer initiation and tracking
- 🛠️ Maintenance request submission and tracking
- 📊 Personal transfer history
- 🔔 Real-time notifications

### NCO-Specific Features
- 👥 Squad/team-level property management
- 🏷️ QR code generation for equipment
- ✅ Transfer approval within unit
- 📊 Team equipment status monitoring
- 📋 Inventory management tools

### Officer-Specific Features
- 📈 Command dashboard with real-time activity
- 📊 Unit-wide analytics and metrics
- 📦 Bulk transfer management
- 📄 Audit report generation
- 📋 Compliance monitoring

## Technical Architecture

### Role-Based Access Control
- Military rank determines system role
- Automatic feature activation based on rank
- Hierarchical command structure integration

### Frontend Stack
- React 18+ with TypeScript
- Vite for build tooling
- Redux for state management
- WebSocket for real-time updates
- Mobile-responsive design

### Security Features
- JWT authentication
- Role-based route protection
- Secure QR code generation
- Blockchain transfer validation
- Session management
- Audit logging

## Project Structure

```
src/
├── app/                  # Core application setup
├── features/            # Feature-based modules
│   ├── soldier/         # Base user features
│   ├── nco/            # NCO-specific features
│   ├── officer/        # Officer-specific features
│   ├── property/       # Property management
│   ├── transfer/       # Transfer workflows
│   └── verification/   # Equipment verification
├── shared/             # Shared components
├── services/           # API and service integration
└── styles/             # Global styling system
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Modern web browser

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure required environment variables:
   - API endpoints
   - WebSocket URL
   - Blockchain network details

## Development Guidelines

### Code Organization
- Feature-based architecture
- Shared components for reusability
- Strong typing with TypeScript
- CSS modules for styling

### Testing
- Unit tests with Jest
- Component tests with React Testing Library
- E2E tests with Cypress

### Performance
- Code splitting by feature
- Lazy loading for role-specific modules
- Optimized asset loading

## Mobile Support

### Progressive Web App
- Installable on devices
- Push notifications
- QR code scanning

### Responsive Design
- Mobile-first approach
- Touch-friendly interfaces
- Adaptive layouts
- Optimized for field use

## Security Considerations

### Authentication
- JWT token management
- Secure session handling
- MFA support
- Role validation

### Data Protection
- Encrypted storage
- Secure transfer protocols
- Blockchain validation
- Audit trails

## Contributing

1. Follow feature-based architecture
2. Maintain type safety
3. Include tests
4. Update documentation
5. Follow code style guide

## License

This project is licensed under the MIT License - see LICENSE file for details. 