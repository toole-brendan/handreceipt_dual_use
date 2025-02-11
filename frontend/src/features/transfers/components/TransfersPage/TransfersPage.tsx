import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Plus } from 'lucide-react';
import TransferMetrics from '../TransferMetrics/TransferMetrics';
import TransferFilters from '../TransferFilters/TransferFilters';
import TransfersTable from '../TransfersTable/TransfersTable';
import type { FiltersState } from '../../types';

export const TransfersPage: React.FC = () => {
  const [filters, setFilters] = useState<FiltersState>({});

  const handleFilterChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
  };

  const handleNewTransfer = () => {
    // TODO: Implement navigation to new transfer form
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Box>
          <Typography variant="h4" component="h4">
            Property Transfers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={handleNewTransfer}
          sx={{ height: 'fit-content' }}
        >
          New Transfer
        </Button>
      </Box>

      {/* Metrics Dashboard */}
      <TransferMetrics 
        pendingApprovals={{ 
          value: '8',
          change: { 
            value: '2', 
            timeframe: 'since yesterday', 
            isPositive: false 
          }
        }}
        processingTime={{ 
          value: '48h',
          change: { 
            value: '12h', 
            timeframe: 'vs last week', 
            isPositive: true 
          }
        }}
        completedToday={{ 
          value: '15',
          change: { 
            value: '5', 
            timeframe: 'vs yesterday', 
            isPositive: true 
          }
        }}
        approvalRate={{ 
          value: '94%',
          change: { 
            value: '2%', 
            timeframe: 'this month', 
            isPositive: true 
          }
        }}
      />

      {/* Filters Section */}
      <Box sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 1,
        p: 2
      }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filters
        </Typography>
        <TransferFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </Box>

      {/* Transfers Table */}
      <Box sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 1,
        p: 2
      }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Transfer Requests
        </Typography>
        <TransfersTable />
      </Box>
    </Box>
  );
};
