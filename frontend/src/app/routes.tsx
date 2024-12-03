// frontend/src/routes/index.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { 
  Login, 
  CreateAccount, 
  ForgotPassword, 
  ResetPassword 
} from '@/features/auth/components';
import Dashboard from '@/features/dashboard/components/Dashboard';
import NCODashboard from '@/features/dashboard/components/nco/NCODashboard';
import PersonnelProperty from '@/pages/property/personnel-property';
import ProtectedRoute from '@/shared/components/common/ProtectedRoute';
import TransferRequestPage from '@/pages/transfer';
import MyPropertyPage from '@/pages/property/MyPropertyPage';
import MaintenancePage from '@/pages/maintenance';
import NewMaintenanceRequest from '@/pages/maintenance/new';
import { Reports } from '@/features/reports/components';

// Property page components
const OfficerPropertyPage = React.lazy(() => import('@/pages/property/officer'));
const SoldierPropertyPage = React.lazy(() => import('@/pages/property/soldier'));

const AppRoutes: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();

  // Helper function to get role-specific dashboard path
  const getDashboardPath = (role?: string) => {
    switch (role) {
      case 'officer':
        return '/officer/dashboard';
      case 'nco':
        return '/nco/dashboard';
      case 'soldier':
        return '/soldier/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getDashboardPath(currentUser?.role)} />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/create-account"
        element={
          isAuthenticated ? (
            <Navigate to={getDashboardPath(currentUser?.role)} />
          ) : (
            <CreateAccount />
          )
        }
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to={getDashboardPath(currentUser?.role)} /> : <ForgotPassword />}
      />
      <Route
        path="/reset-password"
        element={isAuthenticated ? <Navigate to={getDashboardPath(currentUser?.role)} /> : <ResetPassword />}
      />

      {/* Landing Page - Redirects to role-specific dashboard */}
      <Route 
        path="/" 
        element={
          !isAuthenticated ? (
            <Navigate to="/login" />
          ) : (
            <Navigate to={getDashboardPath(currentUser?.role)} />
          )
        } 
      />
      
      {/* Shared Protected Routes */}
      <Route
        path="/property"
        element={
          <ProtectedRoute>
            <MyPropertyPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transfers"
        element={
          <ProtectedRoute>
            <TransferRequestPage />
          </ProtectedRoute>
        }
      />

      {/* Reports Routes */}
      <Route
        path="/reports/*"
        element={
          <ProtectedRoute role="officer">
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Maintenance Routes */}
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute>
            <MaintenancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance/new"
        element={
          <ProtectedRoute>
            <NewMaintenanceRequest />
          </ProtectedRoute>
        }
      />
      
      {/* Officer Routes */}
      <Route
        path="/officer/*"
        element={
          <ProtectedRoute role="officer">
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="property" element={<OfficerPropertyPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* NCO Routes */}
      <Route
        path="/nco/*"
        element={
          <ProtectedRoute role="nco">
            <Routes>
              <Route path="dashboard" element={<NCODashboard />} />
              <Route path="property" element={<PersonnelProperty />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Soldier Routes */}
      <Route
        path="/soldier/*"
        element={
          <ProtectedRoute role="soldier">
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="property" element={<SoldierPropertyPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Catch all - Redirect to role-specific dashboard */}
      <Route 
        path="*" 
        element={
          !isAuthenticated ? (
            <Navigate to="/login" />
          ) : (
            <Navigate to={getDashboardPath(currentUser?.role)} />
          )
        } 
      />
    </Routes>
  );
};

export default AppRoutes;