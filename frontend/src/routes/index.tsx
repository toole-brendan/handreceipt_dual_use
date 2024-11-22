// frontend/src/routes/index.tsx

import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from '@/ui/components/common/ErrorBoundary';

// Lazy load components
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Reports = lazy(() => import('@/pages/reports/Reports'));
const PersonnelProperty = lazy(() => import('@/pages/property/personnel-property'));
const MyProperty = lazy(() => import('@/pages/property/my-property'));
const CreateQRCode = lazy(() => import('@/pages/assets/CreateQRCode'));
const BlockchainExplorer = lazy(() => import('@/pages/blockchain/explorer'));
const BlockchainTransactions = lazy(() => import('@/pages/blockchain/transactions'));
const Scanner = lazy(() => import('@/pages/mobile/scanner'));

export const AppRoutes: React.FC = () => {
  console.log('AppRoutes rendering');

  try {
    return (
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        } />

        {/* Property Routes */}
        <Route path="/property">
          <Route path="my-property" element={
            <ErrorBoundary>
              <MyProperty />
            </ErrorBoundary>
          } />
          <Route path="personnel-property" element={
            <ErrorBoundary>
              <PersonnelProperty />
            </ErrorBoundary>
          } />
        </Route>

        {/* Assets */}
        <Route path="/assets/create-qr" element={
          <ErrorBoundary>
            <CreateQRCode />
          </ErrorBoundary>
        } />

        {/* Reports */}
        <Route path="/reports/*" element={
          <ErrorBoundary>
            <Reports />
          </ErrorBoundary>
        } />

        {/* Blockchain */}
        <Route path="/blockchain">
          <Route path="explorer" element={
            <ErrorBoundary>
              <BlockchainExplorer />
            </ErrorBoundary>
          } />
          <Route path="transactions" element={
            <ErrorBoundary>
              <BlockchainTransactions />
            </ErrorBoundary>
          } />
        </Route>

        {/* Mobile */}
        <Route path="/mobile/scanner" element={
          <ErrorBoundary>
            <Scanner />
          </ErrorBoundary>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  } catch (error) {
    console.error('Error in AppRoutes:', error);
    return <div>Failed to load routes</div>;
  }
};

export default AppRoutes;