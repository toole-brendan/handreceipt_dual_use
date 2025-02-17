import React, { useState, useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import TransactionTable, { Transaction } from '@/components/transactions/TransactionTable';
import TransactionsSummary from '@/components/transactions/TransactionsSummary';
import TransactionDetailsModal from '@/components/transactions/TransactionDetails.modal';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import { mockTransactions, mockSystemHealth, mockEntities } from '@/mocks/mockData';
import dayjs, { Dayjs } from 'dayjs';

interface TransactionFiltersState {
  search: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  types: string[];
  productSearch: string;
  batchLotNumber: string;
  fromLocation: string;
  toLocation: string;
  status: ('Completed' | 'Pending' | 'Failed')[];
}

const initialFilters: TransactionFiltersState = {
  search: '',
  startDate: null,
  endDate: null,
  types: [],
  productSearch: '',
  batchLotNumber: '',
  fromLocation: '',
  toLocation: '',
  status: []
};

const TransactionsPage: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<TransactionFiltersState>(initialFilters);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseDetails = () => {
    setSelectedTransaction(null);
  };

  const handleFilterChange = (newFilters: TransactionFiltersState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  // Get entity name by ID
  const getEntityName = (id: string) => {
    const entity = [
      ...mockEntities.manufacturers,
      ...mockEntities.distributionCenters,
      ...mockEntities.pharmacies
    ].find(e => e.id === id);
    return entity?.name || id;
  };

  // Filter transactions based on all filters
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(transaction => {
      // Search filter (across all text fields)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableFields = [
          transaction.transactionHash,
          transaction.type,
          transaction.productId,
          transaction.productName,
          transaction.batchLotNumber,
          transaction.from,
          transaction.to,
          transaction.user,
          transaction.eventSummary,
          transaction.details?.action,
          transaction.details?.location,
          transaction.details?.actor
        ].map(field => String(field).toLowerCase());

        if (!searchableFields.some(field => field.includes(searchLower))) {
          return false;
        }
      }

      // Date range filter
      if (filters.startDate) {
        const txDate = dayjs(transaction.timestamp);
        if (txDate.isBefore(filters.startDate)) {
          return false;
        }
      }
      if (filters.endDate) {
        const txDate = dayjs(transaction.timestamp);
        if (txDate.isAfter(filters.endDate)) {
          return false;
        }
      }

      // Transaction type filter
      if (filters.types.length > 0 && !filters.types.includes(transaction.type)) {
        return false;
      }

      // Product search filter
      if (filters.productSearch) {
        const searchLower = filters.productSearch.toLowerCase();
        const productFields = [
          transaction.productId,
          transaction.productName
        ].map(field => String(field).toLowerCase());
        if (!productFields.some(field => field.includes(searchLower))) {
          return false;
        }
      }

      // Batch/Lot number filter
      if (filters.batchLotNumber && !transaction.batchLotNumber.toLowerCase().includes(filters.batchLotNumber.toLowerCase())) {
        return false;
      }

      // Location filters
      if (filters.fromLocation && transaction.from !== filters.fromLocation) {
        return false;
      }
      if (filters.toLocation && transaction.to !== filters.toLocation) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(transaction.status)) {
        return false;
      }

      return true;
    });
  }, [mockTransactions, filters]);

  // Enrich transactions with entity names
  const enrichedTransactions = useMemo(() => {
    return filteredTransactions.map(transaction => ({
      ...transaction,
      fromName: getEntityName(transaction.from),
      toName: getEntityName(transaction.to)
    }));
  }, [filteredTransactions]);

  // Enrich all transactions for the summary view
  const enrichedAllTransactions = useMemo(() => {
    return mockTransactions.map(transaction => ({
      ...transaction,
      fromName: getEntityName(transaction.from),
      toName: getEntityName(transaction.to)
    }));
  }, [mockTransactions]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Blockchain Transactions
      </Typography>

      {/* Visual Summary Panel */}
      <TransactionsSummary
        transactions={enrichedAllTransactions}
        networkHealth={mockSystemHealth}
        onTransactionClick={handleTransactionClick}
      />

      {/* Transaction Filters */}
      <TransactionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Transactions Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          All Transactions
          {filteredTransactions.length !== mockTransactions.length && (
            <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
              ({filteredTransactions.length} of {mockTransactions.length})
            </Typography>
          )}
        </Typography>
        <TransactionTable
          transactions={enrichedTransactions}
          onTransactionClick={handleTransactionClick}
        />
      </Paper>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        onClose={handleCloseDetails}
      />
    </Box>
  );
};

export default TransactionsPage;
