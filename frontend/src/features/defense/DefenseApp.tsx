import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@frontend_defense/components/layout/Layout';
import { CircularProgress } from '@mui/material';

// Import defense components
const PropertyView = React.lazy(() => import('@frontend_defense/features/property/components/PropertyView').then(m => ({ default: m.PropertyView })));
const SensitiveItemsPage = React.lazy(() => import('@frontend_defense/features/sensitive-items/components/SensitiveItemsPage').then(m => ({ default: m.SensitiveItemsPage })));
const PersonnelIndex = React.lazy(() => import('@frontend_defense/features/personnel/components/PersonnelIndex'));
const TransfersPage = React.lazy(() => import('@frontend_defense/features/transfers/components/TransfersPage').then(m => ({ default: m.TransfersPage })));
const Settings = React.lazy(() => import('@frontend_defense/features/settings/components/Settings').then(m => ({ default: m.Settings })));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </div>
);

const DefenseApp: React.FC = () => {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="property" replace />} />
          <Route path="property/*" element={<PropertyView />} />
          <Route path="sensitive-items/*" element={<SensitiveItemsPage />} />
          <Route path="personnel/*" element={<PersonnelIndex />} />
          <Route path="transfers/*" element={<TransfersPage />} />
          <Route path="settings/*" element={<Settings />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default DefenseApp;
