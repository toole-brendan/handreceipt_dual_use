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
import { DefenseLayout } from '../components/layout';
const DashboardPage = React.lazy(() => import('../pages/dashboard/Dashboard'));
const MaintenancePage = React.lazy(() => import('../pages/maintenance'));
const PropertyPage = React.lazy(() => import('../pages/property'));
const SettingsPage = React.lazy(() => import('../pages/settings'));
const UtilityPage = React.lazy(() => import('../pages/utility'));

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
    element: <DefenseLayout />,
    children: [
      {
        path: '',
        element: <Navigate to={DEFENSE_ROUTES.DASHBOARD} replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'maintenance-inspections',
        element: <MaintenancePage />,
      },
      {
        path: 'maintenance-inspections/scheduled-logs',
        element: <MaintenancePage />,
      },
      {
        path: 'maintenance-inspections/report-issue',
        element: <MaintenancePage />,
      },
      {
        path: 'maintenance-inspections/historical-records',
        element: <MaintenancePage />,
      },
      {
        path: 'my-property',
        element: <PropertyPage />,
      },
      {
        path: 'my-property/assigned-items',
        element: <PropertyPage />,
      },
      {
        path: 'my-property/item-details',
        element: <PropertyPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'utility',
        element: <UtilityPage />,
      },
    ],
  },
];

export default defenseRoutes;
