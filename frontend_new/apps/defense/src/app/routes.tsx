import React from 'react';
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
const DashboardPage = React.lazy(() => import('../pages/dashboard/Dashboard'));
const MaintenancePage = React.lazy(() => import('../pages/maintenance'));
const PropertyPage = React.lazy(() => import('../pages/property'));
const TransfersPage = React.lazy(() => import('../pages/transfers'));
const InventoryPage = React.lazy(() => import('../pages/inventory'));
const ReportsPage = React.lazy(() => import('../pages/reports'));
const AlertsPage = React.lazy(() => import('../pages/alerts'));
const UserManagementPage = React.lazy(() => import('../pages/users'));
const SupportPage = React.lazy(() => import('../pages/support'));
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
        element: <DashboardPage />,
      },
      {
        path: 'property',
        element: <PropertyPage />,
      },
      {
        path: 'transfers',
        element: <TransfersPage />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'maintenance',
        element: <MaintenancePage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'alerts',
        element: <AlertsPage />,
      },
      {
        path: 'users',
        element: <UserManagementPage />,
      },
      {
        path: 'support',
        element: <SupportPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'help',
        element: <HelpPage />,
      }
    ],
  },
];

export default defenseRoutes;
