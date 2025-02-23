import React, { useState, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { PaymentsSummary } from '../../components/payments/PaymentsSummary';
import { PaymentsFilters } from '../../components/payments/PaymentsFilters';
import { PaymentsTable } from '../../components/payments/PaymentsTable';
import { PaymentDetailsModal } from '../../components/payments/PaymentDetailsModal';
import { InitiatePaymentModal } from '../../components/payments/InitiatePaymentModal';
import { PaymentsAnalytics } from '../../components/payments/PaymentsAnalytics';
import {
  PaymentFilters,
  PaymentTransaction,
  PaymentStats,
  InitiatePaymentData,
  PaymentChartData,
  PaymentStatusDistribution,
  TopEntity,
} from '@shared/types/payments';

// Mock data - Replace with actual API calls
const mockStats: PaymentStats = {
  totalIncoming: 10000,
  totalOutgoing: 5000,
  pendingCount: 3,
  walletBalance: 2500,
};

const mockPayments: PaymentTransaction[] = [
  {
    id: '1',
    type: 'INCOMING',
    amount: 1000,
    status: 'COMPLETED',
    blockchainStatus: 'CONFIRMED',
    recipientId: '1',
    recipientName: 'Your Company',
    senderId: '2',
    senderName: 'Café Delight',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orderNumber: '12345',
    transactionHash: '0x123...',
    blockNumber: 12345,
    confirmations: 10,
  },
  // Add more mock payments...
];

const mockRecipients = [
  { id: '1', name: 'BeanFarm Co.' },
  { id: '2', name: 'Café Delight' },
];

const mockOrders = [
  { id: '1', number: '12345' },
  { id: '2', number: '12346' },
];

const mockTimelineData: PaymentChartData[] = [
  {
    date: '2024-01-01',
    incoming: 1000,
    outgoing: 500,
  },
  // Add more mock timeline data...
];

const mockStatusDistribution: PaymentStatusDistribution[] = [
  { status: 'COMPLETED', count: 10, amount: 5000 },
  { status: 'PENDING', count: 3, amount: 1500 },
  { status: 'FAILED', count: 1, amount: 500 },
];

const mockTopEntities: TopEntity[] = [
  {
    id: '1',
    name: 'BeanFarm Co.',
    totalAmount: 5000,
    transactionCount: 5,
  },
  // Add more mock entities...
];

const PaymentsPage: React.FC = () => {
  // State
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [initiateModalOpen, setInitiateModalOpen] = useState(false);
  const [analyticsExpanded, setAnalyticsExpanded] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handlers
  const handleFiltersChange = useCallback((newFilters: PaymentFilters) => {
    setFilters(newFilters);
    setPage(0);
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilters({});
    setPage(0);
  }, []);

  const handleViewDetails = useCallback((payment: PaymentTransaction) => {
    setSelectedPayment(payment);
    setDetailsModalOpen(true);
  }, []);

  const handleViewBlockchain = useCallback((payment: PaymentTransaction) => {
    if (payment.transactionHash) {
      window.open(`https://explorer.blockchain.com/tx/${payment.transactionHash}`, '_blank');
    }
  }, []);

  const handleInitiatePayment = async (data: InitiatePaymentData) => {
    // TODO: Implement payment initiation
    console.log('Initiating payment:', data);
  };

  const handleDownloadReceipt = (payment: PaymentTransaction) => {
    // TODO: Implement receipt download
    console.log('Downloading receipt for:', payment.id);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Payments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your incoming and outgoing payments, track payment statuses, and verify transactions on the blockchain.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <PaymentsSummary stats={mockStats} />

      {/* Filters and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <PaymentsFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleFiltersReset}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setInitiateModalOpen(true)}
          sx={{ ml: 2, alignSelf: 'flex-start' }}
        >
          Initiate Payment
        </Button>
      </Box>

      {/* Payments Table */}
      <PaymentsTable
        payments={mockPayments}
        onViewDetails={handleViewDetails}
        onViewBlockchain={handleViewBlockchain}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={mockPayments.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />

      {/* Analytics */}
      <PaymentsAnalytics
        expanded={analyticsExpanded}
        onToggle={() => setAnalyticsExpanded(!analyticsExpanded)}
        timelineData={mockTimelineData}
        statusDistribution={mockStatusDistribution}
        topEntities={mockTopEntities}
      />

      {/* Modals */}
      {selectedPayment && (
        <PaymentDetailsModal
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          payment={selectedPayment}
          onViewBlockchain={handleViewBlockchain}
          onDownloadReceipt={handleDownloadReceipt}
          smartContract={
            selectedPayment.type === 'OUTGOING'
              ? {
                  address: '0x456...',
                  condition: 'Payment on Delivery',
                  status: 'Active',
                  timeout: 7,
                }
              : undefined
          }
        />
      )}

      <InitiatePaymentModal
        open={initiateModalOpen}
        onClose={() => setInitiateModalOpen(false)}
        onSubmit={handleInitiatePayment}
        recipients={mockRecipients}
        orders={mockOrders}
      />
    </Box>
  );
};

export default PaymentsPage; 