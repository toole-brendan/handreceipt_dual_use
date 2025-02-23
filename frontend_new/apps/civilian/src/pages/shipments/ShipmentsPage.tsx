import React, { useState } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { Shipment, ShipmentFilters, ShipmentStats } from '@shared/types/shipments';
import { ShipmentSummaryCards } from '@components/shipments/ShipmentSummaryCards';
import { ShipmentFilters as ShipmentFiltersComponent } from '@components/shipments/ShipmentFilters';
import { ShipmentDetailsModal } from '@components/shipments/ShipmentDetailsModal';
import ShipmentTable from '@components/shipments/ShipmentTable';

// Mock data - Replace with actual API calls
const mockShipments: Shipment[] = [
  {
    id: 'SHP-001',
    orderId: 'ORD-001',
    type: 'OUTBOUND',
    customer: {
      id: 'CUST-001',
      name: 'Bean Haven Co.',
      address: '123 Coffee St, Seattle, WA',
      contact: 'John Doe',
    },
    supplier: {
      id: 'SUP-001',
      name: 'Coffee Bean Farms',
      address: '456 Farm Rd, Colombia',
      contact: 'Maria Garcia',
    },
    shipmentDate: '2024-02-25T10:00:00Z',
    expectedDeliveryDate: '2024-02-27T15:00:00Z',
    status: 'IN_TRANSIT',
    items: [
      {
        id: 'ITEM-001',
        name: 'Ethiopian Yirgacheffe Beans',
        quantity: 50,
        unit: 'kg',
        unitPrice: 20,
        totalPrice: 1000,
      },
    ],
    blockchain: {
      status: 'VERIFIED',
      transactionHash: '0x123abc...',
      timestamp: '2024-02-25T10:00:00Z',
    },
    payment: {
      status: 'PAYMENT_PENDING',
      amount: 1000,
      currency: 'USD',
      smartContractAddress: '0x456def...',
    },
    createdAt: '2024-02-25T10:00:00Z',
    updatedAt: '2024-02-25T10:00:00Z',
  },
  // Add more mock shipments as needed
];

const mockStats: ShipmentStats = {
  inTransit: 5,
  deliveredToday: 3,
  pendingConfirmation: 2,
};

export const ShipmentsPage: React.FC = () => {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [filters, setFilters] = useState<ShipmentFilters>({});

  const handleGenerateQrCode = (shipmentId: string) => {
    console.log('Generating QR code for shipment:', shipmentId);
    // Implement QR code generation logic
  };

  const handleDownloadQrCode = (shipmentId: string) => {
    console.log('Downloading QR code for shipment:', shipmentId);
    // Implement QR code download logic
  };

  const handleConfirmReceipt = (shipmentId: string) => {
    console.log('Confirming receipt for shipment:', shipmentId);
    // Implement receipt confirmation logic
  };

  const handleUpdateStatus = (shipmentId: string, status: string) => {
    console.log('Updating status for shipment:', shipmentId, 'to:', status);
    // Implement status update logic
  };

  const handleDelete = (ids: string[]) => {
    console.log('Deleting shipments:', ids);
    // Implement delete logic
  };

  const handleEdit = (ids: string[]) => {
    console.log('Editing shipments:', ids);
    // Implement edit logic
  };

  const handleExport = (ids: string[]) => {
    console.log('Exporting shipments:', ids);
    // Implement export logic
  };

  const handleShare = (ids: string[]) => {
    console.log('Sharing shipments:', ids);
    // Implement share logic
  };

  const handleArchive = (ids: string[]) => {
    console.log('Archiving shipments:', ids);
    // Implement archive logic
  };

  const handleTag = (ids: string[]) => {
    console.log('Tagging shipments:', ids);
    // Implement tag logic
  };

  const handleMarkDelivered = (ids: string[]) => {
    console.log('Marking shipments as delivered:', ids);
    // Implement mark delivered logic
  };

  const handleMarkDelayed = (ids: string[]) => {
    console.log('Marking shipments as delayed:', ids);
    // Implement mark delayed logic
  };

  const handleCancel = (ids: string[]) => {
    console.log('Canceling shipments:', ids);
    // Implement cancel logic
  };

  const handleTrack = (ids: string[]) => {
    console.log('Tracking shipments:', ids);
    // Implement track logic
  };

  return (
    <Container maxWidth={false}>
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Shipments
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your inbound and outbound shipments here
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => console.log('Create new shipment')}
          >
            Create Shipment
          </Button>
        </Box>

        {/* Summary Cards */}
        <ShipmentSummaryCards stats={mockStats} />

        {/* Filters */}
        <ShipmentFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Shipments Table */}
        <ShipmentTable
          shipments={mockShipments}
          loading={false}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onExport={handleExport}
          onShare={handleShare}
          onArchive={handleArchive}
          onTag={handleTag}
          onMarkDelivered={handleMarkDelivered}
          onMarkDelayed={handleMarkDelayed}
          onCancel={handleCancel}
          onTrack={handleTrack}
          onViewDetails={(shipment: Shipment) => setSelectedShipment(shipment)}
        />

        {/* Details Modal */}
        {selectedShipment && (
          <ShipmentDetailsModal
            open={!!selectedShipment}
            onClose={() => setSelectedShipment(null)}
            shipment={selectedShipment}
            onGenerateQrCode={handleGenerateQrCode}
            onDownloadQrCode={handleDownloadQrCode}
            onConfirmReceipt={handleConfirmReceipt}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </Box>
    </Container>
  );
};

export default ShipmentsPage; 