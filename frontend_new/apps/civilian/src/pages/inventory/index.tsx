import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import {
  InventoryItem,
  InventoryStats,
  InventoryFilters as IInventoryFilters,
  NewInventoryItemData,
  InventoryTransaction,
  InventoryChartData,
} from '@shared/types/inventory';
import { InventorySummary } from '../../components/inventory/InventorySummary';
import { InventoryFilters } from '../../components/inventory/InventoryFilters';
import { InventoryTable } from '../../components/inventory/InventoryTable';
import { InventoryDetailsModal } from '../../components/inventory/InventoryDetailsModal';
import { InventoryFormModal } from '../../components/inventory/InventoryFormModal';
import { InventoryAnalytics } from '../../components/inventory/InventoryAnalytics';

// Mock data - Replace with actual API calls
const mockStats: InventoryStats = {
  totalItems: 150,
  totalValue: 25000,
  lowStockItems: 5,
  expiringSoon: 10,
};

const mockItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Ethiopian Yirgacheffe Green Beans',
    sku: 'SKU12345',
    category: 'RAW_MATERIALS',
    quantity: 500,
    unit: 'kg',
    location: 'Warehouse A',
    status: 'IN_STOCK',
    roastDate: null,
    bestByDate: '2024-12-31',
    blockchainStatus: 'VERIFIED',
    transactionHash: '0x123...',
    supplier: 'BeanFarm Co.',
    origin: 'Ethiopia',
    certifications: ['Organic', 'Fair Trade'],
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
  // Add more mock items...
];

const mockTransactions: InventoryTransaction[] = [
  {
    id: '1',
    itemId: '1',
    date: '2023-01-01',
    action: 'Received',
    location: 'Warehouse A',
    notes: 'Initial stock',
    quantity: 500,
    transactionHash: '0x123...',
  },
  // Add more mock transactions...
];

const mockChartData: InventoryChartData = {
  categoryDistribution: [
    { category: 'RAW_MATERIALS', count: 50, value: 10000 },
    { category: 'WORK_IN_PROGRESS', count: 30, value: 5000 },
    { category: 'FINISHED_GOODS', count: 70, value: 10000 },
  ],
  locationDistribution: [
    { location: 'Warehouse A', count: 80, percentage: 53.3 },
    { location: 'Roasting Facility', count: 40, percentage: 26.7 },
    { location: 'Distribution Center', count: 30, percentage: 20 },
  ],
  valueOverTime: [
    { date: '2023-01-01', value: 20000 },
    { date: '2023-02-01', value: 22000 },
    { date: '2023-03-01', value: 25000 },
  ],
  stockStatus: [
    { status: 'In Stock', count: 120, percentage: 80 },
    { status: 'Low Stock', count: 20, percentage: 13.3 },
    { status: 'Out of Stock', count: 10, percentage: 6.7 },
  ],
};

export const InventoryPage: React.FC = () => {
  const [filters, setFilters] = React.useState<IInventoryFilters>({});
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<InventoryItem | undefined>(undefined);

  // Replace with actual API calls
  const handleFiltersChange = (newFilters: IInventoryFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleAddItem = (data: NewInventoryItemData) => {
    console.log('Adding new item:', data);
    setIsFormModalOpen(false);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditItem(item);
    setIsFormModalOpen(true);
  };

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailsModalOpen(true);
  };

  const handleGenerateQR = (item: InventoryItem) => {
    console.log('Generating QR code for:', item);
  };

  const handleMarkUsed = (item: InventoryItem) => {
    console.log('Marking item as used:', item);
    setIsDetailsModalOpen(false);
  };

  const handleDownloadQR = (item: InventoryItem) => {
    console.log('Downloading QR code for:', item);
  };

  const handlePrintQR = (item: InventoryItem) => {
    console.log('Printing QR code for:', item);
  };

  return (
    <Container maxWidth={false}>
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Inventory
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your coffee bean inventory, track stock levels, and verify items on the blockchain
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditItem(undefined);
              setIsFormModalOpen(true);
            }}
          >
            Add New Item
          </Button>
        </Box>

        <InventorySummary stats={mockStats} />

        <Box sx={{ mt: 3 }}>
          <InventoryFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onResetFilters={() => handleFiltersChange({})}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <InventoryTable
            items={mockItems}
            onViewDetails={handleViewDetails}
            onEdit={handleEditItem}
            onGenerateQR={handleGenerateQR}
            page={page}
            rowsPerPage={rowsPerPage}
            totalItems={mockItems.length}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Box>

        <InventoryAnalytics data={mockChartData} />
      </Box>

      {selectedItem && (
        <InventoryDetailsModal
          open={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          item={selectedItem}
          transactions={mockTransactions}
          onEdit={handleEditItem}
          onMarkUsed={handleMarkUsed}
          onDownloadQR={handleDownloadQR}
          onPrintQR={handlePrintQR}
        />
      )}

      <InventoryFormModal
        open={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleAddItem}
        editItem={editItem}
      />
    </Container>
  );
}; 