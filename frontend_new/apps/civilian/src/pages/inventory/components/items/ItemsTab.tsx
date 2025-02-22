import React, { useState } from 'react';
import { Box, Grid, Drawer } from '@mui/material';
import { InventoryList, ItemDetails } from './';
import type { CivilianProperty } from '../../../../types/property';

// Mock data - replace with actual data fetching
const mockItems: CivilianProperty[] = [
  {
    id: '1',
    name: 'Green Coffee Beans - Ethiopian Yirgacheffe',
    description: 'Premium unroasted coffee beans from Yirgacheffe region',
    serialNumber: 'ETH-YRG-001',
    value: 2500,
    status: 'SERVICEABLE',
    category: 'Raw Materials',
    createdAt: '2025-02-20T09:00:00Z',
    updatedAt: '2025-02-21T14:30:00Z',
    isSensitive: false,
    productType: 'Green Coffee',
    supplier: 'Ethiopian Coffee Exporters',
    quantity: 500,
    reorderPoint: 100,
    reorderQuantity: 250,
    unitPrice: 5.00,
    blockchainId: '0x123...abc',
    warehouseLocation: {
      zone: 'A',
      bin: '101',
    },
  },
  {
    id: '2',
    name: 'Roasted Coffee Beans - Colombian Supremo',
    description: 'Medium roast Colombian Supremo beans',
    serialNumber: 'COL-SUP-001',
    value: 3000,
    status: 'SERVICEABLE',
    category: 'Finished Goods',
    createdAt: '2025-02-19T10:00:00Z',
    updatedAt: '2025-02-21T15:45:00Z',
    isSensitive: false,
    productType: 'Roasted Coffee',
    supplier: 'Colombian Coffee Co.',
    quantity: 75,
    reorderPoint: 100,
    reorderQuantity: 200,
    unitPrice: 8.50,
    blockchainId: '0x456...def',
    warehouseLocation: {
      zone: 'B',
      bin: '202',
    },
  },
];

export const ItemsTab: React.FC = () => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedItemId(null);
  };

  const handleEditItem = (itemId: string) => {
    console.log('Edit item:', itemId);
    // TODO: Implement edit functionality
  };

  const handleTransferItem = (itemId: string) => {
    console.log('Transfer item:', itemId);
    // TODO: Implement transfer functionality
  };

  const handleViewQR = (itemId: string) => {
    console.log('View QR code:', itemId);
    // TODO: Implement QR code viewer
  };

  const selectedItem = mockItems.find(item => item.id === selectedItemId);

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <InventoryList
        items={mockItems}
        onItemClick={handleItemClick}
        onEditItem={handleEditItem}
        onTransferItem={handleTransferItem}
        onViewQR={handleViewQR}
      />

      <Drawer
        anchor="right"
        open={isDetailsOpen}
        onClose={handleCloseDetails}
        variant="temporary"
        PaperProps={{
          sx: {
            width: '40%',
            minWidth: 400,
            maxWidth: 600,
          },
        }}
      >
        {selectedItem && (
          <ItemDetails
            item={selectedItem}
            onClose={handleCloseDetails}
            onEdit={handleEditItem}
            onTransfer={handleTransferItem}
            onViewQR={handleViewQR}
          />
        )}
      </Drawer>
    </Box>
  );
};
