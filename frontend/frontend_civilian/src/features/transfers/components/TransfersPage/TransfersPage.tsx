import React from 'react';
import { Box, Button } from '@mui/material';
import { Plus } from 'lucide-react';
import TransfersTable from '../TransfersTable/TransfersTable';
import TransferMetrics from '../TransferMetrics/TransferMetrics';

const MOCK_METRICS = {
  pendingApprovals: {
    value: '12',
    change: {
      value: '+3',
      timeframe: 'since yesterday',
      isPositive: false
    }
  },
  processingTime: {
    value: '2.5 days',
    change: {
      value: '-0.5 days',
      timeframe: 'this week',
      isPositive: true
    }
  },
  completedToday: {
    value: '8',
    change: {
      value: '+2',
      timeframe: 'vs yesterday',
      isPositive: true
    }
  },
  approvalRate: {
    value: '94%',
    change: {
      value: '+2.1%',
      timeframe: 'this month',
      isPositive: true
    }
  }
};

export const TransfersPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.5rem', 
            fontWeight: 600,
            color: '#FFFFFF',
            marginBottom: '0.5rem'
          }}>
            Transfer Requests
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            Manage and track property transfer requests
          </p>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus className="h-4 w-4" />}
          sx={{
            backgroundColor: '#2563eb',
            '&:hover': {
              backgroundColor: '#1d4ed8',
            },
          }}
        >
          New Transfer
        </Button>
      </Box>

      <TransferMetrics {...MOCK_METRICS} />

      <TransfersTable />
    </Box>
  );
};
