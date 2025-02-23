import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@shared/components/layout';

// Lazy load page components
const Dashboard = React.lazy(() => import('../pages/dashboard/Dashboard'));
const Inventory = React.lazy(() => import('../pages/inventory/Inventory'));
const Orders = React.lazy(() => import('../pages/orders/Orders'));
const Shipments = React.lazy(() => import('../pages/shipments/Shipments'));
const Payments = React.lazy(() => import('../pages/payments/Payments'));
const QRManagement = React.lazy(() => import('../pages/qr-management/QRManagement'));
const Reports = React.lazy(() => import('../pages/reports/Reports'));
const Settings = React.lazy(() => import('../pages/settings/Settings'));

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="page-loading">Loading...</div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <React.Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Default route redirects to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Main routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/qr-management" element={<QRManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />

          {/* Fallback for unmatched routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </React.Suspense>
    </Layout>
  );
}; 