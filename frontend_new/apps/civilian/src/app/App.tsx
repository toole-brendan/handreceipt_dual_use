import React from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Layout } from '@shared/components/layout';
import { ProtectedRoute } from '@shared/components/common';
import { LoginPage } from '@shared/components/auth';
import { DashboardPage } from '../pages/dashboard';
import { InventoryPage } from '../pages/inventory';
import { OrdersPage } from '../pages/orders';
import { SupplyChainPage } from '../pages/supply-chain';
import { ContractsPage } from '../pages/contracts';
import { PaymentsPage } from '../pages/payments';
import { ReportsPage } from '../pages/reports';
import { UserManagementPage } from '../pages/users';
import { SettingsPage } from '../pages/settings';
import { SupportPage } from '../pages/support';
import { civilianTheme } from '../styles/theme';
import { CIVILIAN_ROUTES } from '../constants/routes';

// Define routes
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
      {
        index: true,
        element: <Navigate to={CIVILIAN_ROUTES.DASHBOARD} replace />,
      },
      {
        path: 'dashboard/*',
        element: <DashboardPage />,
      },
      {
        path: 'inventory/*',
        element: <InventoryPage />,
      },
      {
        path: 'orders/*',
        element: <OrdersPage />,
      },
      {
        path: 'supply-chain/*',
        element: <SupplyChainPage />,
      },
      {
        path: 'contracts/*',
        element: <ContractsPage />,
      },
      {
        path: 'wallet/*',
        element: <PaymentsPage />,
      },
      {
        path: 'reports/*',
        element: <ReportsPage />,
      },
      {
        path: 'users/*',
        element: <UserManagementPage />,
      },
      {
        path: 'settings/*',
        element: <SettingsPage />,
      },
      {
        path: 'support/*',
        element: <SupportPage />,
      },
    ],
  },
]);

// App component
const App: React.FC = () => {
  return (
    <MuiThemeProvider theme={civilianTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </MuiThemeProvider>
  );
};

export default App;
