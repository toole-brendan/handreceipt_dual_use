import React from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Layout } from '@shared/components/layout';
import { ProtectedRoute } from '@shared/components/common';
import { LoginPage } from '@shared/components/auth';
import { DashboardPage } from '../pages/dashboard';
import { InventoryPage } from '../pages/inventory';
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
        element: <div>Orders</div>,
      },
      {
        path: 'supply-chain/*',
        element: <div>Supply Chain</div>,
      },
      {
        path: 'contracts/*',
        element: <div>Smart Contracts</div>,
      },
      {
        path: 'wallet/*',
        element: <div>Payments/Wallet</div>,
      },
      {
        path: 'reports/*',
        element: <div>Reports</div>,
      },
      {
        path: 'users/*',
        element: <div>User Management</div>,
      },
      {
        path: 'settings/*',
        element: <div>Settings</div>,
      },
      {
        path: 'support/*',
        element: <div>Help/Support</div>,
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
