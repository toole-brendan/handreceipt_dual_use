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

const PropertyPage = lazy(() => import('@/pages/property/index.page'));

const routes = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/propertyview" replace />,
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
        path: 'propertyview',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PropertyPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export default routes;
