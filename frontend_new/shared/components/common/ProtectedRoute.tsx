/* ProtectedRoute.tsx */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@shared/store/slices/auth/slice';
import ErrorBoundary from '@shared/components/feedback/ErrorBoundary';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

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
    Loading Protected Route...
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // Get the version from the URL path
  const version = location.pathname.split('/')[1]; // 'civilian' or 'defense'

  if (!isAuthenticated) {
    // Redirect to the version-specific login page
    return (
      <Navigate 
        to={`/${version}/login`} 
        state={{ redirectTo: location.pathname }}
        replace 
      />
    );
  }

  return (
    <ErrorBoundary>
      <React.Suspense fallback={<LoadingFallback />}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
};

export default ProtectedRoute;
