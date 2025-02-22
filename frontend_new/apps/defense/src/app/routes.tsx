import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
interface RouteConfig {
  path: string;
  element: React.ReactNode;
  auth?: boolean;
  permissions?: string[];
  children?: RouteConfig[];
}
import { DEFENSE_ROUTES } from '../constants/routes';

import { LoginPage } from '@shared/components/auth';
import Layout from '../components/layout/Layout';
import ErrorBoundary from '@shared/components/feedback/ErrorBoundary';
import { ProtectedRoute } from '@shared/components/common';

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

const DashboardPage = React.lazy(() => import('../pages/dashboard'));
const MaintenancePage = React.lazy(() => import('../pages/maintenance'));
const PropertyPage = React.lazy(() => import('../pages/property'));
const UnitInventoryPage = React.lazy(() => import('../pages/unit-inventory'));
const TransfersPage = React.lazy(() => import('../pages/transfers'));
const ReportsPage = React.lazy(() => import('../pages/reports'));
const UserManagementPage = React.lazy(() => import('../pages/users'));
const SettingsPage = React.lazy(() => import('../pages/settings'));
const HelpPage = React.lazy(() => import('../pages/help'));

export const defenseRoutes: RouteConfig[] = [
  // Root shows login/version selector
  {
    path: '/',
    element: <LoginPage />,
    auth: false,
  },
  // Defense routes under /defense prefix with layout
  {
    path: '/defense',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Navigate to="/defense/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary>
                <DashboardPage />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'property',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary>
                <PropertyPage />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'unit-inventory',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary>
                <UnitInventoryPage />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'transfers',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary>
                <TransfersPage />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        ),
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
      }
    ],
  },
];

export default defenseRoutes;
