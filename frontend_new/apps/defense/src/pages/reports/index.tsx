import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  styled,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import { format } from 'date-fns';
import { BlockchainVerificationModal } from './components/BlockchainVerificationModal';
import { GenerateReportModal } from './components/GenerateReportModal';
import { CustomReportForm } from './components/CustomReportForm';
import { ReportChart } from './components/ReportChart';
import { ReportFilters } from './components/ReportFilters';
import type { ReportType, ReportData } from './types';

// Styled Components
const DashboardCard = styled(Paper)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  '& .card-header': {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '& h6': {
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  '& .card-content': {
    padding: theme.spacing(2),
  },
}));

// Mock data
const mockMetrics = {
  inventory: {
    totalItems: 1245,
    itemsInGoodCondition: 1100,
    itemsNeedingMaintenance: 100,
    criticalItems: 500,
  },
  transfers: {
    totalTransfers: 50,
    pendingApprovals: 5,
    awaitingConfirmations: 3,
    completedTransfers: 42,
  },
  maintenance: {
    scheduledTasks: 15,
    inProgressTasks: 5,
    completedTasks: 20,
    overdueTasks: 2,
  },
};

const mockReports = [
  {
    id: 'RPT-001',
    name: 'Monthly Inventory Summary',
    type: 'Inventory',
    frequency: 'Monthly',
    lastGenerated: '2024-04-15',
    format: 'PDF',
    status: 'Generated',
    blockchainHash: '0x1234...5678',
  },
  {
    id: 'RPT-002',
    name: 'Transfer Activity Log',
    type: 'Transfer',
    frequency: 'Weekly',
    lastGenerated: '2024-04-14',
    format: 'CSV',
    status: 'Pending',
    blockchainHash: '0x8765...4321',
  },
];

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportType>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isBlockchainModalOpen, setIsBlockchainModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: ReportType) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'generated':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleViewBlockchain = (report: any) => {
    setSelectedReport(report);
    setIsBlockchainModalOpen(true);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" gutterBottom>
                  REPORTS
                </Typography>
                <Tooltip title="Last blockchain sync: 1 minute ago">
                  <Badge color="success" variant="dot">
                    <IconButton size="small">
                      <RefreshIcon />
                    </IconButton>
                  </Badge>
                </Tooltip>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Generate and manage reports for auditing, compliance, and operational needs
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                placeholder="Search reports..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={() => setIsGenerateModalOpen(true)}
              >
                Generate Report
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Tabs Section */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Inventory Reports" value="inventory" />
            <Tab label="Transfer Reports" value="transfers" />
            <Tab label="Maintenance Reports" value="maintenance" />
            <Tab label="Custom Reports" value="custom" />
          </Tabs>
        </Box>

        {activeTab !== 'custom' ? (
          <>
            {/* Metrics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {Object.entries(mockMetrics[activeTab]).map(([key, value]) => (
                <Grid item xs={12} sm={6} md={3} key={key}>
                  <DashboardCard>
                    <div className="card-content">
                      <Typography variant="h4" color="primary" gutterBottom>
                        {value}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                    </div>
                  </DashboardCard>
                </Grid>
              ))}
            </Grid>

            {/* Filters & Chart Section */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <DashboardCard>
                    <div className="card-header">
                      <Typography variant="h6">Filters</Typography>
                    </div>
                    <div className="card-content">
                      <ReportFilters 
                        type={activeTab} 
                        onFiltersChange={(filters) => {
                          console.log('Filters changed:', filters);
                        }} 
                      />
                    </div>
                  </DashboardCard>
                </Grid>
                <Grid item xs={12} md={8}>
                  <DashboardCard>
                    <div className="card-header">
                      <Typography variant="h6">Analytics</Typography>
                    </div>
                    <div className="card-content">
                      <ReportChart type={activeTab} />
                    </div>
                  </DashboardCard>
                </Grid>
              </Grid>
            </Box>

            {/* Reports Table */}
            <DashboardCard>
              <div className="card-header">
                <Typography variant="h6">Report List</Typography>
              </div>
              <div className="card-content">
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Report ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Frequency</TableCell>
                        <TableCell>Last Generated</TableCell>
                        <TableCell>Format</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.id}</TableCell>
                          <TableCell>{report.name}</TableCell>
                          <TableCell>{report.type}</TableCell>
                          <TableCell>{report.frequency}</TableCell>
                          <TableCell>{format(new Date(report.lastGenerated), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Chip
                              label={report.format}
                              size="small"
                              color="default"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={report.status}
                              color={getStatusColor(report.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Download Report">
                              <IconButton size="small">
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Print Report">
                              <IconButton size="small">
                                <PrintIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Share Report">
                              <IconButton size="small">
                                <ShareIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Blockchain Record">
                              <IconButton
                                size="small"
                                onClick={() => handleViewBlockchain(report)}
                              >
                                <RefreshIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={100}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </div>
            </DashboardCard>
          </>
        ) : (
          <CustomReportForm 
            onGenerate={(config) => {
              console.log('Custom report config:', config);
            }} 
          />
        )}

        {/* Modals */}
        <BlockchainVerificationModal
          open={isBlockchainModalOpen}
          onClose={() => setIsBlockchainModalOpen(false)}
          report={selectedReport}
        />
        <GenerateReportModal
          open={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          onGenerate={(reportData) => {
            console.log('Generated report:', reportData);
            setIsGenerateModalOpen(false);
          }}
        />
      </Box>
    </Container>
  );
};

export default ReportsPage; 