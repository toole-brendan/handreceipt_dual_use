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

## Routing Architecture

### Overview

The application uses React Router v6 with a nested routing structure. There are two main applications (civilian and defense) with shared authentication and protected routes.

### Route Structure

```
/                           # Root redirect to login
├── /login                  # Login page with version selection
├── /civilian              # Civilian application routes
│   ├── /dashboard         # Dashboard page
│   ├── /inventory         # Inventory management
│   ├── /orders           # Order processing
│   ├── /supply-chain     # Supply chain operations
│   ├── /contracts        # Contract management
│   ├── /qr              # QR code management
│   ├── /reports         # Reporting
│   └── /settings        # Settings
└── /defense              # Defense application routes
    ├── /dashboard        # Military dashboard
    ├── /property        # Property book
    ├── /transfers       # Transfer management
    └── ... (other military routes)
```

### Route Configuration

1. **Route Constants**
   ```typescript
   // constants/routes.ts
   export const CIVILIAN_ROUTES = {
     ROOT: '/',
     LOGIN: '/login',
     CIVILIAN: '/civilian',
     DASHBOARD: '/civilian/dashboard',
     // ... other routes
   };
   ```

2. **Router Setup**
   ```typescript
   // App.tsx
   const router = createBrowserRouter([
     {
       path: CIVILIAN_ROUTES.ROOT,
       element: <Navigate to={CIVILIAN_ROUTES.LOGIN} replace />,
     },
     {
       path: CIVILIAN_ROUTES.LOGIN,
       element: <LoginPage />,
     },
     {
       path: CIVILIAN_ROUTES.CIVILIAN,
       element: (
         <ProtectedRoute>
           <Layout />
         </ProtectedRoute>
       ),
       children: [
         // Nested routes here
       ],
     },
   ]);
   ```

### Adding a New Page

1. **Create the Page Component**
   ```typescript
   // pages/new-feature/NewFeaturePage.tsx
   const NewFeaturePage: React.FC = () => {
     return <div>New Feature Content</div>;
   };
   export default NewFeaturePage;
   ```

2. **Add Route Constants**
   ```typescript
   // constants/routes.ts
   export const CIVILIAN_ROUTES = {
     // ... existing routes
     NEW_FEATURE: '/civilian/new-feature',
   };
   ```

3. **Add Router Configuration**
   ```typescript
   // App.tsx
   {
     path: 'new-feature/*',
     element: <NewFeaturePage />,
   }
   ```

4. **Add Navigation Item**
   ```typescript
   // navigation-config.tsx
   export const CIVILIAN_NAV_ITEMS: NavItemConfig[] = [
     // ... existing items
     {
       to: '/civilian/new-feature',
       text: 'New Feature',
       icon: <FeatureIcon />
     }
   ];
   ```

### Navigation Components

1. **Sidebar Navigation**
   - Uses `NavItemConfig` for type-safe navigation items
   - Automatically handles active states
   - Supports nested navigation items

2. **Protected Routes**
   - Wraps authenticated routes
   - Handles version-specific redirects
   - Manages loading states

### Common Routing Patterns

1. **Version Selection**
   - Login page determines application version
   - Redirects to appropriate root route
   - Maintains version context throughout session

2. **Nested Routes**
   - Parent routes define layouts
   - Child routes render in `<Outlet>`
   - Supports route-specific breadcrumbs

3. **Route Guards**
   - `ProtectedRoute` component checks authentication
   - Role-based access control
   - Version-specific restrictions

### Best Practices

1. **Route Organization**
   - Keep routes centralized in constants
   - Use typed route definitions
   - Maintain consistent naming conventions

2. **Navigation**
   - Always use route constants
   - Implement proper active state handling
   - Support breadcrumb navigation

3. **Code Splitting**
   - Lazy load page components
   - Use Suspense boundaries
   - Implement loading states

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
