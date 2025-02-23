import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Tab,
  Tabs,
  Badge,
  Paper,
  Grid,
  useTheme,
} from '@mui/material';
import {
  RefreshCw,
  Calendar,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Plus,
} from 'lucide-react';
import { MetricCard } from './components/MetricCard';
import { MaintenanceFilters } from './components/MaintenanceFilters';
import { MaintenanceTable } from './components/MaintenanceTable';
import { MaintenanceChart } from './components/MaintenanceChart';
import { RequestMaintenanceModal } from './components/RequestMaintenanceModal';
import { MaintenanceDetailsModal } from './components/MaintenanceDetailsModal';
import { BlockchainRecordModal } from './components/BlockchainRecordModal';
import { GenerateDA2404Modal } from './components/GenerateDA2404Modal';
import type { MaintenanceTask, MaintenanceMetrics } from './types';

// Mock data - replace with actual API calls
const MOCK_METRICS: MaintenanceMetrics = {
  totalScheduled: {
    value: '15',
    change: {
      value: '+2',
      timeframe: 'since yesterday',
      isPositive: false
    }
  },
  inProgress: {
    value: '5',
    change: {
      value: '-1',
      timeframe: 'this week',
      isPositive: true
    }
  },
  completedThisMonth: {
    value: '20',
    change: {
      value: '+5',
      timeframe: 'vs last month',
      isPositive: true
    }
  },
  overdueTasks: {
    value: '2',
    change: {
      value: '+1',
      timeframe: 'this week',
      isPositive: false
    }
  },
  avgCompletionTime: {
    value: '3 days',
    change: {
      value: '-0.5 days',
      timeframe: 'this month',
      isPositive: true
    }
  }
};

export const MaintenancePage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isBlockchainModalOpen, setIsBlockchainModalOpen] = useState(false);
  const [isDA2404ModalOpen, setIsDA2404ModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMaintenanceAction = (action: 'approve' | 'reject' | 'complete' | 'cancel', task: MaintenanceTask) => {
    console.log('Maintenance action:', action, task);
    // Implement maintenance actions
  };

  const handleViewDetails = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const handleViewBlockchain = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsBlockchainModalOpen(true);
  };

  const handleGenerateDA2404 = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsDA2404ModalOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4 
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h4" sx={{ 
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.75rem',
              textTransform: 'uppercase'
            }}>
              MAINTENANCE
            </Typography>
            <Tooltip title="Last synced with blockchain 3 minutes ago">
              <IconButton size="small">
                <RefreshCw size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<FileText />}
            onClick={() => setIsDA2404ModalOpen(true)}
          >
            Generate DA 2404
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => setIsRequestModalOpen(true)}
            sx={{
              bgcolor: '#2563eb',
              '&:hover': {
                bgcolor: '#1d4ed8',
              },
            }}
          >
            Request Maintenance
          </Button>
        </Box>
      </Box>

      {/* Metrics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Total Scheduled"
            metric={MOCK_METRICS.totalScheduled}
            icon={<Calendar size={24} />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="In Progress"
            metric={MOCK_METRICS.inProgress}
            icon={<Wrench size={24} />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Completed (30d)"
            metric={MOCK_METRICS.completedThisMonth}
            icon={<CheckCircle size={24} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Overdue Tasks"
            metric={MOCK_METRICS.overdueTasks}
            icon={<AlertTriangle size={24} />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Avg. Completion"
            metric={MOCK_METRICS.avgCompletionTime}
            icon={<Clock size={24} />}
            color={theme.palette.primary.main}
          />
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={
              <Badge badgeContent={3} color="error">
                Pending Approvals
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={15} color="warning">
                Scheduled
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={5} color="info">
                In Progress
              </Badge>
            } 
          />
          <Tab label="Completed" />
        </Tabs>
      </Box>

      {/* Filters Section */}
      <MaintenanceFilters
        onFiltersChange={() => {}}
        filters={{}}
      />

      {/* Table Section */}
      <Paper sx={{ mt: 3, mb: 4 }}>
        <MaintenanceTable
          tasks={[]}
          activeTab={activeTab}
          onApprove={(task) => handleMaintenanceAction('approve', task)}
          onReject={(task) => handleMaintenanceAction('reject', task)}
          onComplete={(task) => handleMaintenanceAction('complete', task)}
          onCancel={(task) => handleMaintenanceAction('cancel', task)}
          onViewDetails={handleViewDetails}
          onViewBlockchain={handleViewBlockchain}
          onGenerateDA2404={handleGenerateDA2404}
        />
      </Paper>

      {/* Chart Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Maintenance Status Overview
        </Typography>
        <MaintenanceChart data={[]} />
      </Paper>

      {/* Modals */}
      <RequestMaintenanceModal
        open={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={(data) => {
          console.log('Submit maintenance request:', data);
          setIsRequestModalOpen(false);
        }}
      />
      <MaintenanceDetailsModal
        open={isDetailsModalOpen}
        task={selectedTask}
        onClose={() => setIsDetailsModalOpen(false)}
      />
      <BlockchainRecordModal
        open={isBlockchainModalOpen}
        task={selectedTask}
        onClose={() => setIsBlockchainModalOpen(false)}
      />
      <GenerateDA2404Modal
        open={isDA2404ModalOpen}
        task={selectedTask}
        onClose={() => setIsDA2404ModalOpen(false)}
        onGenerate={(data) => {
          console.log('Generate DA 2404:', data);
          setIsDA2404ModalOpen(false);
        }}
      />
    </Box>
  );
}; 