import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Tabs,
  Tab,
  Badge,
  TextField,
  InputAdornment,
  Paper,
  Grid,
} from '@mui/material';
import {
  RefreshCw,
  Search,
  FileText,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { ReportMetrics } from './components/ReportMetrics';
import { ReportFilters } from './components/ReportFilters';
import { ReportTable } from './components/ReportTable';
import { ReportChart } from './components/ReportChart';
import { CustomReportForm } from './components/CustomReportForm';
import { BlockchainVerificationModal } from './components/BlockchainVerificationModal';
import type { ReportType, ReportData, CustomReportConfig } from './types';

// Mock data - replace with actual API calls
const MOCK_METRICS = {
  inventory: {
    totalItems: {
      value: '1,245',
      change: { value: '+45', timeframe: 'vs last month', isPositive: true }
    },
    itemsInGoodCondition: {
      value: '1,100',
      change: { value: '+2%', timeframe: 'vs last month', isPositive: true }
    },
    itemsNeedingMaintenance: {
      value: '100',
      change: { value: '-10', timeframe: 'vs last month', isPositive: true }
    },
    criticalItems: {
      value: '500',
      change: { value: '+5', timeframe: 'vs last month', isPositive: false }
    }
  },
  transfers: {
    totalTransfers: {
      value: '50',
      change: { value: '+10', timeframe: 'vs last month', isPositive: true }
    },
    pendingApprovals: {
      value: '5',
      change: { value: '-2', timeframe: 'vs last month', isPositive: true }
    },
    awaitingConfirmations: {
      value: '3',
      change: { value: '-1', timeframe: 'vs last month', isPositive: true }
    },
    completedTransfers: {
      value: '42',
      change: { value: '+13', timeframe: 'vs last month', isPositive: true }
    }
  },
  maintenance: {
    scheduledTasks: {
      value: '15',
      change: { value: '+3', timeframe: 'vs last month', isPositive: false }
    },
    inProgressTasks: {
      value: '5',
      change: { value: '-2', timeframe: 'vs last month', isPositive: true }
    },
    completedTasks: {
      value: '20',
      change: { value: '+5', timeframe: 'vs last month', isPositive: true }
    },
    overdueTasks: {
      value: '2',
      change: { value: '-1', timeframe: 'vs last month', isPositive: true }
    }
  }
};

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportType>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBlockchainModalOpen, setIsBlockchainModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: ReportType) => {
    setActiveTab(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRefresh = () => {
    // Implement refresh logic
    console.log('Refreshing data...');
  };

  const handleExport = (format: 'pdf' | 'csv') => {
    // Implement export logic
    console.log(`Exporting as ${format}...`);
  };

  const handleCustomReportGenerate = (config: CustomReportConfig) => {
    // Implement custom report generation logic
    console.log('Generating custom report with config:', config);
  };

  const handleViewDetails = (report: ReportData) => {
    // Implement view details logic
    console.log('Viewing report details:', report);
    setSelectedReport(report);
  };

  const handleViewBlockchain = (report: ReportData) => {
    // Implement blockchain view logic
    console.log('Viewing blockchain records:', report);
    setSelectedReport(report);
    setIsBlockchainModalOpen(true);
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
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Reports & Analytics
            </Typography>
            <Tooltip title="Last synced 2 minutes ago">
              <IconButton size="small" onClick={handleRefresh}>
                <RefreshCw size={20} />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="body2" color="text.secondary">
            CPT John Doe, Company Commander, F CO - 2-506, 3BCT, 101st Airborne
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FileText />}
            onClick={() => handleExport('pdf')}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileSpreadsheet />}
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab value="inventory" label="Inventory Reports" />
          <Tab value="transfers" label="Transfer Reports" />
          <Tab value="maintenance" label="Maintenance Reports" />
          <Tab value="custom" label="Custom Reports" />
        </Tabs>
      </Box>

      {/* Search Section */}
      <Box sx={{ my: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Content Section */}
      {activeTab !== 'custom' ? (
        <>
          <ReportMetrics type={activeTab} metrics={MOCK_METRICS[activeTab]} />
          <ReportFilters type={activeTab} onFiltersChange={() => {}} />
          <Box sx={{ mb: 3 }}>
            <ReportChart type={activeTab} />
          </Box>
          <ReportTable
            type={activeTab}
            onViewDetails={handleViewDetails}
            onViewBlockchain={handleViewBlockchain}
          />
        </>
      ) : (
        <CustomReportForm onGenerate={handleCustomReportGenerate} />
      )}

      {/* Modals */}
      <BlockchainVerificationModal
        open={isBlockchainModalOpen}
        onClose={() => setIsBlockchainModalOpen(false)}
        report={selectedReport}
      />
    </Box>
  );
};

export default ReportsPage; 