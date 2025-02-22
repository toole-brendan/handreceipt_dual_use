# Hand Receipt Management System Frontend

This monorepo contains the frontend applications for the Hand Receipt Management System, including both civilian and defense variants.

## Project Structure

```
frontend/
├── apps/                    # Application-specific code
│   ├── civilian/           # Civilian variant
│   └── defense/            # Defense variant
├── shared/                 # Shared components and utilities
├── config/                 # Shared configuration files
└── scripts/                # Build and utility scripts
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Setup git hooks
npm run prepare
```

### Development

```bash
# Start civilian app
npm run dev:civilian

# Start defense app
npm run dev:defense

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run typecheck

# Format code
npm run format
```

### Building

```bash
# Build both apps
npm run build

# Build specific app
npm run build:civilian
npm run build:defense
```

## Architecture

### Shared Code

The `shared/` directory contains code shared between both applications:

- `components/`: Reusable UI components
- `utils/`: Utility functions and helpers
- `services/`: API and service integrations
- `store/`: Redux store configuration and slices
- `types/`: TypeScript type definitions
- `styles/`: Global styles and theme configuration

### Application-Specific Code

Each application in `apps/` follows a similar structure:

- `src/app/`: Application entry point and routing
- `src/components/`: App-specific components
- `src/features/`: Feature modules
- `src/pages/`: Page components
- `src/services/`: App-specific services
- `src/store/`: App-specific store configuration
- `src/types/`: App-specific type definitions

## Development Guidelines

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- Lint-staged for pre-commit checks

### Testing

- Jest for unit testing
- React Testing Library for component testing
- Run tests before committing

### PWA Support

Both applications include PWA support with:

- Offline functionality
- Asset caching
- Push notifications
- App manifest
- Service worker

### Security

- Environment-specific configurations
- Secure API communication
- Authentication handling
- Role-based access control

## Deployment

Deployments are handled automatically through GitHub Actions:

- Push to `main` triggers production deployment
- Separate deployments for civilian and defense apps
- Automated testing and security checks
- Deployment notifications via Slack

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Run tests and linting
4. Create a pull request
5. Ensure CI checks pass

## License

Proprietary - All rights reserved
