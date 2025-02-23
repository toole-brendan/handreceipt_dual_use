import React, { useState } from 'react';
import {
  Box,
  Button,
  Tab,
  Tabs,
  Typography,
  Badge,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Plus,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { TransfersTable } from '../TransfersTable';
import { TransferMetrics } from '../TransferMetrics';
import { TransferFilters } from '../TransferFilters';
import { InitiateTransferModal } from '../InitiateTransferModal';
import { TransferDetailsModal } from '../TransferDetailsModal';
import { BlockchainRecordModal } from '../BlockchainRecordModal';
import type { Transfer, TransferTabData, MetricsData } from '../../types';

// Mock data - replace with actual API calls
const MOCK_METRICS: MetricsData = {
  pendingApprovals: {
    value: '5',
    change: {
      value: '+2',
      timeframe: 'since yesterday',
      isPositive: false
    }
  },
  processingTime: {
    value: '1.5 days',
    change: {
      value: '-0.5 days',
      timeframe: 'this week',
      isPositive: true
    }
  },
  completedToday: {
    value: '12',
    change: {
      value: '+3',
      timeframe: 'vs yesterday',
      isPositive: true
    }
  },
  approvalRate: {
    value: '95%',
    change: {
      value: '+1.5%',
      timeframe: 'this month',
      isPositive: true
    }
  }
};

const MOCK_TAB_DATA: TransferTabData = {
  pendingApprovals: [],
  awaitingConfirmations: [],
  history: []
};

export const TransfersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [isBlockchainModalOpen, setIsBlockchainModalOpen] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleNewTransfer = () => {
    setIsNewTransferOpen(true);
  };

  const handleTransferAction = (action: 'approve' | 'reject' | 'confirm' | 'cancel', transfer: Transfer) => {
    // Implement transfer actions
    console.log('Transfer action:', action, transfer);
  };

  const handleViewBlockchain = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
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
            <Typography variant="h4" sx={{ 
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.75rem',
              textTransform: 'uppercase'
            }}>
              TRANSFERS
            </Typography>
            <Tooltip title="Last synced with blockchain 2 minutes ago">
              <IconButton size="small">
                <RefreshCw size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<QrCode />}
            onClick={() => {/* Implement QR scanner */}}
          >
            Scan QR Code
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={handleNewTransfer}
            sx={{
              bgcolor: '#2563eb',
              '&:hover': {
                bgcolor: '#1d4ed8',
              },
            }}
          >
            New Transfer
          </Button>
        </Box>
      </Box>

      {/* Metrics Section */}
      <TransferMetrics {...MOCK_METRICS} />

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={
              <Badge badgeContent={MOCK_TAB_DATA.pendingApprovals.length} color="error">
                Pending Approvals
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={MOCK_TAB_DATA.awaitingConfirmations.length} color="warning">
                Awaiting Confirmations
              </Badge>
            } 
          />
          <Tab label="Transfer History" />
        </Tabs>
      </Box>

      {/* Filters Section */}
      <Box sx={{ mt: 3 }}>
        <TransferFilters 
          filters={{}}
          onFiltersChange={() => {}}
          personnel={[]}
        />
      </Box>

      {/* Table Section */}
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <TransfersTable
            transfers={MOCK_TAB_DATA.pendingApprovals}
            onApprove={(transfer) => handleTransferAction('approve', transfer)}
            onReject={(transfer) => handleTransferAction('reject', transfer)}
            onViewDetails={setSelectedTransfer}
            onViewBlockchain={handleViewBlockchain}
          />
        )}
        {activeTab === 1 && (
          <TransfersTable
            transfers={MOCK_TAB_DATA.awaitingConfirmations}
            onConfirm={(transfer) => handleTransferAction('confirm', transfer)}
            onCancel={(transfer) => handleTransferAction('cancel', transfer)}
            onViewDetails={setSelectedTransfer}
            onViewBlockchain={handleViewBlockchain}
          />
        )}
        {activeTab === 2 && (
          <TransfersTable
            transfers={MOCK_TAB_DATA.history}
            onViewDetails={setSelectedTransfer}
            onViewBlockchain={handleViewBlockchain}
            isHistory
          />
        )}
      </Box>

      {/* Modals */}
      <InitiateTransferModal
        open={isNewTransferOpen}
        onClose={() => setIsNewTransferOpen(false)}
        onSubmit={(data) => {
          console.log('Submit transfer:', data);
          setIsNewTransferOpen(false);
        }}
        availableItems={[]}
        availableRecipients={[]}
      />
      <TransferDetailsModal
        open={!!selectedTransfer}
        transfer={selectedTransfer}
        onClose={() => setSelectedTransfer(null)}
      />
      <BlockchainRecordModal
        open={isBlockchainModalOpen}
        transfer={selectedTransfer}
        onClose={() => setIsBlockchainModalOpen(false)}
      />
    </Box>
  );
}; 