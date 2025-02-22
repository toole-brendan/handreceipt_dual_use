import React, { useEffect, useCallback } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useProperty } from '../../hooks/useProperty';
import {
  PropertySummaryCards,
  AssignedEquipmentGrid,
  ItemDetailPanel,
  QuickTransferModule,
  ComplianceStatusWidget,
  PropertySkeleton,
} from '../../components/property';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';

const PropertyPage: React.FC = () => {
  const {
    loadSummary,
    loadEquipmentList,
    loadComplianceStatus,
    loading,
    error,
  } = useProperty();

  useEffect(() => {
    loadSummary();
    loadEquipmentList();
    loadComplianceStatus();
  }, [loadSummary, loadEquipmentList, loadComplianceStatus]);

  if (loading.summary || loading.equipmentList || loading.compliance) {
    return <PropertySkeleton />;
  }

  const handleRetry = useCallback(() => {
    loadSummary();
    loadEquipmentList();
    loadComplianceStatus();
  }, [loadSummary, loadEquipmentList, loadComplianceStatus]);

  if (error.summary || error.equipmentList || error.compliance) {
    return (
      <ErrorDisplay
        title="Error Loading Property Data"
        message="There was a problem loading your property information. Please try again."
        onRetry={handleRetry}
      />
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Stack spacing={3}>
        {/* Header Section */}
        <Box>
          <Typography variant="h4" gutterBottom>My Property</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your assigned equipment and track custody changes
          </Typography>
        </Box>

        {/* Summary Cards */}
        <PropertySummaryCards />

        {/* Equipment Grid/Table */}
        <AssignedEquipmentGrid />

        {/* Quick Transfer Module */}
        <QuickTransferModule />

        {/* Item Detail Panel */}
        <ItemDetailPanel />

        {/* Compliance Status */}
        <ComplianceStatusWidget />
      </Stack>
    </Box>
  );
};

export default PropertyPage;
