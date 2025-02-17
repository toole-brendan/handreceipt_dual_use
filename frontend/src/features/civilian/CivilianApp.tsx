import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@frontend_civilian/components/layout/Layout';
import { CircularProgress } from '@mui/material';

// Import civilian components
const DashboardPage = React.lazy(() => import('@frontend_civilian/features/dashboard/DashboardPage'));
const PropertyView = React.lazy(() => import('@frontend_civilian/features/property/components/PropertyView').then(m => ({ default: m.PropertyView })));
const PersonnelIndex = React.lazy(() => import('@frontend_civilian/features/personnel/components/PersonnelIndex'));
const TransfersPage = React.lazy(() => import('@frontend_civilian/features/transfers/components/TransfersPage').then(m => ({ default: m.TransfersPage })));
const Settings = React.lazy(() => import('@frontend_civilian/features/settings/components/Settings').then(m => ({ default: m.Settings })));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </div>
);

const CivilianApp: React.FC = () => {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="dashboard/*" element={<DashboardPage />} />
          <Route path="property/*" element={<PropertyView />} />
          <Route path="personnel/*" element={<PersonnelIndex />} />
          <Route path="transfers/*" element={<TransfersPage />} />
          <Route path="settings/*" element={<Settings />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default CivilianApp;
