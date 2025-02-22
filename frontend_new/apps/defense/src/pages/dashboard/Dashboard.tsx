import React, { useState, useEffect } from 'react';
import { Grid, Stack, Typography, Box } from '@mui/material';
import {
  CriticalAlertsBanner,
  QuickActionBar,
  SummaryCards,
  PriorityWidgets,
  EquipmentReadinessChart,
  ChainOfCustodyFeed,
  RoleBasedWidgets,
  DashboardSkeleton,
} from '../../components/dashboard';
import type { Alert } from '../../components/dashboard/CriticalAlertsBanner';

// Mock data
const mockAlerts: Alert[] = [
  {
    id: '1',
    message: '3x M4 Carbines overdue for inspection - Unit A-12',
    type: 'error',
    timestamp: '10 minutes ago',
  },
  {
    id: '2',
    message: 'NVG Batteries running low in FOB Bravo - 12hrs remaining',
    type: 'warning',
    timestamp: '30 minutes ago',
  },
];

const mockSummaryData = {
  assignedProperty: {
    total: 50,
    serviceable: 45,
  },
  pendingActions: 3,
  readinessStatus: {
    percentage: 82,
    trend: 'up' as const,
  },
  criticalShortages: {
    count: 2,
    mostCritical: 'NVG Batteries',
  },
};

const mockOverdueInspections = [
  {
    id: '1',
    item: 'M2 Machine Gun',
    daysOverdue: 7,
    unit: 'Unit A-12',
    priority: 'high' as const,
  },
  {
    id: '2',
    item: 'HMMWV Tire Rotation',
    daysOverdue: 3,
    unit: 'Unit B-5',
    priority: 'medium' as const,
  },
];

const mockRecentTransfers = [
  {
    id: '1',
    timestamp: '2023-10-05 14:30',
    item: 'M249 SAW',
    fromUser: 'PVT Smith',
    toUser: 'SGT Jones',
    transactionId: '0x1234...abcd',
  },
  {
    id: '2',
    timestamp: '2023-10-05 13:15',
    item: 'AN/PRC-152 Radio',
    fromUser: 'PV2 Lee',
    toUser: 'SGT Park',
    transactionId: '0x5678...efgh',
  },
];

const mockEquipmentStatus = [
  { status: 'Operational', count: 72, color: '#4CAF50' },
  { status: 'Pending Inspection', count: 18, color: '#FFD700' },
  { status: 'Damaged', count: 10, color: '#FF3B3B' },
];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState(mockAlerts);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const handleDismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const handleInitiateTransfer = () => {
    console.log('Initiating transfer...');
  };

  const handleScanQrCode = () => {
    console.log('Opening QR code scanner...');
  };

  const handleReportDamage = () => {
    console.log('Opening damage report form...');
  };

  const handleGenerateForm = () => {
    console.log('Generating DA 2062 form...');
  };

  const handleEscalateInspection = (inspectionId: string) => {
    console.log('Escalating inspection:', inspectionId);
  };

  const handleVerifyTransaction = (transactionId: string) => {
    console.log('Verifying transaction:', transactionId);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <CriticalAlertsBanner
        alerts={alerts}
        onDismiss={handleDismissAlert}
      />
      <QuickActionBar
        onInitiateTransfer={handleInitiateTransfer}
        onScanQrCode={handleScanQrCode}
        onReportDamage={handleReportDamage}
        onGenerateForm={handleGenerateForm}
      />
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SummaryCards {...mockSummaryData} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Visual Map Component (Coming Soon)</Typography>
            {/* Visual Map Component */}
          </Grid>
          <Grid item xs={12}>
            <PriorityWidgets
              overdueInspections={mockOverdueInspections}
              recentTransfers={mockRecentTransfers}
              onEscalate={handleEscalateInspection}
              onVerify={handleVerifyTransaction}
            />
          </Grid>
          <Grid item xs={12}>
            <EquipmentReadinessChart
              data={mockEquipmentStatus}
              totalItems={100}
            />
          </Grid>
          <Grid item xs={12}>
            <ChainOfCustodyFeed
              changes={[
                {
                  id: '1',
                  timestamp: '2024-02-21 14:30 EST',
                  item: {
                    name: 'M249 SAW',
                    nsn: '1005-01-123-4567',
                  },
                  from: {
                    name: 'Smith',
                    rank: 'PVT',
                  },
                  to: {
                    name: 'Jones',
                    rank: 'SGT',
                  },
                  transactionId: '0x1234...abcd',
                  verified: true,
                },
                {
                  id: '2',
                  timestamp: '2024-02-21 13:15 EST',
                  item: {
                    name: 'AN/PRC-152 Radio',
                    nsn: '5820-01-456-7890',
                  },
                  from: {
                    name: 'Lee',
                    rank: 'PV2',
                  },
                  to: {
                    name: 'Park',
                    rank: 'SGT',
                  },
                  transactionId: '0x5678...efgh',
                  verified: true,
                },
                {
                  id: '3',
                  timestamp: '2024-02-21 12:45 EST',
                  item: {
                    name: 'M4 Carbine',
                    nsn: '1005-01-231-0973',
                  },
                  from: {
                    name: 'Supply',
                    rank: 'CW2',
                  },
                  to: {
                    name: 'Martinez',
                    rank: 'SPC',
                  },
                  transactionId: '0x90ab...cdef',
                  verified: false,
                },
              ]}
              onVerify={handleVerifyTransaction}
              onFilter={() => console.log('Opening filter dialog...')}
            />
          </Grid>
          <Grid item xs={12}>
            <RoleBasedWidgets
              role="commander"
              tasks={[
                {
                  id: '1',
                  type: 'inspection',
                  title: 'Monthly Weapons Inspection',
                  dueDate: '2024-02-25',
                  priority: 'high',
                },
                {
                  id: '2',
                  type: 'transfer',
                  title: 'Equipment Transfer to Unit B-5',
                  dueDate: '2024-02-23',
                  priority: 'medium',
                },
                {
                  id: '3',
                  type: 'signature',
                  title: 'Sign Off on New Equipment',
                  dueDate: '2024-02-22',
                  priority: 'low',
                },
              ]}
              assignedItems={[
                {
                  id: '1',
                  name: 'M4 Carbine',
                  nsn: '1005-01-231-0973',
                  status: 'serviceable',
                  qrCode: 'QR_CODE_1',
                },
                {
                  id: '2',
                  name: 'AN/PVS-14 Night Vision',
                  nsn: '5855-01-432-0524',
                  status: 'pending',
                  qrCode: 'QR_CODE_2',
                },
              ]}
              discrepancies={[
                {
                  id: '1',
                  item: 'M249 SAW',
                  type: 'mismatch',
                  description: 'Physical count differs from blockchain record',
                  timestamp: '2024-02-21 11:30 EST',
                },
                {
                  id: '2',
                  item: 'Combat Medical Kit',
                  type: 'missing',
                  description: 'Item not found during inventory',
                  timestamp: '2024-02-21 10:15 EST',
                },
              ]}
              supplyRates={[
                {
                  id: '1',
                  item: 'AT4 Anti-Tank Weapon',
                  rate: 200,
                  period: 'last 30 days',
                  trend: 'up',
                },
                {
                  id: '2',
                  item: '5.56mm Ammunition',
                  rate: -15,
                  period: 'last 7 days',
                  trend: 'down',
                },
              ]}
              onTaskClick={(taskId: string) => console.log('Opening task:', taskId)}
              onQrCodeClick={(itemId: string) => console.log('Showing QR code for:', itemId)}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
