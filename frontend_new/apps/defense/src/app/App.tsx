import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { RouterProvider, createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider } from '@shared/contexts/ThemeContext';
import { ProtectedRoute } from '@shared/components/common';
import { LoginPage } from '@shared/components/auth';
import ErrorBoundary from '@shared/components/feedback/ErrorBoundary';
import { Layout } from '../components/layout';
import { defenseTheme } from '../styles/theme';
import { store } from '../store';
import { DEFENSE_ROUTES } from '../constants/routes';
import { DEFENSE_NAV_ITEMS } from '@shared/components/common/navigation-config';

// Lazy load pages
const DashboardPage = React.lazy(() => import('../pages/dashboard'));
const PropertyPage = React.lazy(() => import('../pages/property'));
const TransfersPage = React.lazy(() => import('../pages/transfers'));
const UnitInventoryPage = React.lazy(() => import('../pages/unit-inventory'));
const MaintenancePage = React.lazy(() => import('../pages/maintenance'));
const QRManagementPage = React.lazy(() => import('../pages/qr-management'));
const ReportsPage = React.lazy(() => import('../pages/reports'));
const AlertsPage = React.lazy(() => import('../pages/alerts'));
const UserManagementPage = React.lazy(() => import('../pages/users'));
const SupportPage = React.lazy(() => import('../pages/support'));
const SettingsPage = React.lazy(() => import('../pages/settings'));
const HelpPage = React.lazy(() => import('../pages/help'));

// Error element component
const RouteErrorElement: React.FC = () => {
  const error = useRouteError();
  return (
    <ErrorBoundary>
      <div>An error occurred loading this route: {error?.toString()}</div>
    </ErrorBoundary>
  );
};

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    backgroundColor: '#000',
    color: '#fff' 
  }}>
    Loading...
  </div>
);

// Create router configuration
const router = createBrowserRouter([
  {
    path: DEFENSE_ROUTES.ROOT,
    element: <Navigate to={DEFENSE_ROUTES.LOGIN} replace />,
    errorElement: <RouteErrorElement />
  },
  {
    path: DEFENSE_ROUTES.LOGIN,
    element: <LoginPage />,
    errorElement: <RouteErrorElement />
  },
  {
    path: DEFENSE_ROUTES.DEFENSE,
    element: (
      <ProtectedRoute>
        <Layout navItems={DEFENSE_NAV_ITEMS} />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
    children: [
      {
        index: true,
        element: <Navigate to={DEFENSE_ROUTES.DASHBOARD} replace />
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
              <DashboardPage />
            </ErrorBoundary>
          </Suspense>
        ),
        errorElement: <RouteErrorElement />
      },
      {
        path: 'property',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
              <PropertyPage />
            </ErrorBoundary>
          </Suspense>
        ),
        errorElement: <RouteErrorElement />
      },
      {
        path: 'transfers',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
              <TransfersPage />
            </ErrorBoundary>
          </Suspense>
        ),
        errorElement: <RouteErrorElement />
      },
      {
        path: 'unit-inventory',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
              <UnitInventoryPage />
            </ErrorBoundary>
          </Suspense>
        ),
        errorElement: <RouteErrorElement />
      },
      {
        path: 'maintenance',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
              <MaintenancePage />
            </ErrorBoundary>
          </Suspense>
        ),
        errorElement: <RouteErrorElement />
      },
      {
        path: 'qr',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
              <QRManagementPage />
            </ErrorBoundary>
          </Suspense>
        ),
        errorElement: <RouteErrorElement />
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
              <ReportsPage />
            </ErrorBoundary>
          </Suspense>
        ),
        errorElement: <RouteErrorElement />
      },
      {
        path: 'alerts',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
              <AlertsPage />
            </ErrorBoundary>
          </Suspense>
        ),
        errorElement: <RouteErrorElement />
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
              <UserManagementPage />
            </ErrorBoundary>
          </Suspense>
        ),
        errorElement: <RouteErrorElement />
      },
      {
        path: 'support',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
              <SupportPage />
            </ErrorBoundary>
          </Suspense>
        ),
        errorElement: <RouteErrorElement />
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
              <SettingsPage />
            </ErrorBoundary>
          </Suspense>
        ),
        errorElement: <RouteErrorElement />
      },
      {
        path: 'help',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
              <HelpPage />
            </ErrorBoundary>
          </Suspense>
        ),
        errorElement: <RouteErrorElement />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to={DEFENSE_ROUTES.LOGIN} replace />,
    errorElement: <RouteErrorElement />
  }
]);

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <ThemeProvider>
          <MuiThemeProvider theme={defenseTheme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CssBaseline />
              <RouterProvider router={router} />
            </LocalizationProvider>
          </MuiThemeProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
