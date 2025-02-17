import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@shared';

// Import defense components
const PropertyView = React.lazy(() => import('@frontend_defense/features/property/components/PropertyView').then(m => ({ default: m.PropertyView })));
const SensitiveItemsPage = React.lazy(() => import('@frontend_defense/features/sensitive-items/components/SensitiveItemsPage').then(m => ({ default: m.SensitiveItemsPage })));
const PersonnelIndex = React.lazy(() => import('@frontend_defense/features/personnel/components/PersonnelIndex'));
const TransfersPage = React.lazy(() => import('@frontend_defense/features/transfers/components/TransfersPage').then(m => ({ default: m.TransfersPage })));
const Settings = React.lazy(() => import('@frontend_defense/features/settings/components/Settings').then(m => ({ default: m.Settings })));

const DefenseApp: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="property/*" element={<PropertyView />} />
        <Route path="sensitive-items/*" element={<SensitiveItemsPage />} />
        <Route path="personnel/*" element={<PersonnelIndex />} />
        <Route path="transfers/*" element={<TransfersPage />} />
        <Route path="settings/*" element={<Settings />} />
      </Routes>
    </ThemeProvider>
  );
};

export default DefenseApp;
