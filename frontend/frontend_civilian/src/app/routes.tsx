import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CircularProgress } from '@mui/material';
import { Login, User } from '@handreceipt/shared';
import Layout from '@/pages/layout';

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </div>
);

const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));

const routes = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <Login onLogin={(user: User) => {
      localStorage.setItem('user', JSON.stringify(user));
    }} />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export default routes;
