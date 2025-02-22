/* ProtectedRoute.tsx */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '@shared/store/slices/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: string;
}

type RoleType = 'OFFICER' | 'NCO' | 'SOLDIER';

// Define role hierarchy - who can access what
const roleHierarchy: Record<RoleType, RoleType[]> = {
  'OFFICER': ['OFFICER'],
  'NCO': ['OFFICER', 'NCO'],
  'SOLDIER': ['OFFICER', 'NCO', 'SOLDIER']
};

const normalizeRole = (role: string): RoleType | null => {
  try {
    const upperRole = role.toUpperCase();
    if (upperRole === 'OFFICER' || upperRole === 'NCO' || upperRole === 'SOLDIER') {
      return upperRole as RoleType;
    }
  } catch (error) {
    console.error('Error normalizing role:', error);
  }
  return null;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  // Only check authentication, no role checks for Defense version
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <React.Suspense fallback={null}>{children}</React.Suspense>;
};

export default React.memo(ProtectedRoute);
