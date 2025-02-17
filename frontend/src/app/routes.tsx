import { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

// Lazy load components
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </div>
);

// Error fallback for routes
const RouteErrorFallback = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>Something went wrong loading this page</h2>
    <button 
      onClick={() => window.location.reload()}
      style={{ 
        marginTop: '10px',
        padding: '8px 16px',
        background: '#333',
        color: 'white',
        border: '1px solid #666',
        cursor: 'pointer'
      }}
    >
      Retry
    </button>
  </div>
);

// Auth pages
const Login = lazy(() => import('@/pages/auth/login.page'));

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, version } = useSelector((state: RootState) => state.auth);
  const currentPath = window.location.pathname;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is accessing the correct version
  const isDefensePath = currentPath.startsWith('/defense');
  const isCivilianPath = currentPath.startsWith('/civilian');
  
  if (version === 'Defense' && isCivilianPath) {
    return <Navigate to="/defense/property" replace />;
  }
  
  if (version === 'Civilian' && isDefensePath) {
    return <Navigate to="/civilian/dashboard" replace />;
  }

  return <>{children}</>;
};

// Defense components
const DefenseApp = lazy(() => import('@/features/defense/DefenseApp'));

// Civilian components
const CivilianApp = lazy(() => import('@/features/civilian/CivilianApp'));

const routes = [
  // Auth routes (no layout wrapper)
  {
    path: '/login',
    element: <Suspense fallback={<LoadingFallback />}><Login /></Suspense>,
    errorElement: <RouteErrorFallback />
  },
  // Defense routes
  {
    path: '/defense/*',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <DefenseApp />
        </Suspense>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorFallback />
  },
  // Civilian routes
  {
    path: '/civilian/*',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <CivilianApp />
        </Suspense>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorFallback />
  },
  // Default route
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  // 404 route
  {
    path: '*',
    element: <Navigate to="/login" replace />,
    errorElement: <RouteErrorFallback />
  }
];

export default routes;
