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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { GenerateQRSection } from './components/GenerateQRSection';
import { ManageQRSection } from './components/ManageQRSection';
import { MetricsSection } from './components/MetricsSection';
import { QRDetailsModal } from './components/QRDetailsModal';
import { PreviewModal } from './components/PreviewModal';
import type { QRCodeDetails, QRStatus, TrackingAction, GenerateQRFormData, ItemDetails } from './types';

// Base card styling following dashboard pattern
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

const QRManagementPage: React.FC = () => {
  const [selectedQR, setSelectedQR] = useState<QRCodeDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<GenerateQRFormData>({
    itemId: '',
    actionType: 'TRANSFER',
    actionDetails: {},
    metadata: {
      serialNumber: true,
      currentStatus: true,
      location: true,
      assignedUser: true,
      timestamp: true,
    },
  });
  const [selectedItem, setSelectedItem] = useState<ItemDetails | null>(null);

  const handleViewQRDetails = (qrDetails: QRCodeDetails | null) => {
    setSelectedQR(qrDetails);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedQR(null);
  };

  const handlePreviewQR = (qrDetails: QRCodeDetails) => {
    setSelectedQR(qrDetails);
    setIsPreviewModalOpen(true);
  };

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false);
  };

  const handleQRGenerated = (qrDetails: QRCodeDetails) => {
    handlePreviewQR(qrDetails);
  };

  const handleConfirmPreview = () => {
    // Handle QR code generation confirmation
    setIsPreviewModalOpen(false);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                QR CODE MANAGEMENT
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generate and manage QR codes for equipment tracking
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                placeholder="Search QR codes..."
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
              <IconButton>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Metrics Section */}
        <Box sx={{ mb: 4 }}>
          <MetricsSection />
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Generate QR Section - Full width */}
          <Grid item xs={12}>
            <DashboardCard>
              <div className="card-header">
                <Typography variant="h6">Generate QR Code</Typography>
              </div>
              <div className="card-content">
                <GenerateQRSection onQRGenerated={handleQRGenerated} />
              </div>
            </DashboardCard>
          </Grid>

          {/* Manage QR Codes Section - Full width */}
          <Grid item xs={12}>
            <DashboardCard>
              <div className="card-header">
                <Typography variant="h6">Manage QR Codes</Typography>
              </div>
              <div className="card-content">
                <ManageQRSection onViewQR={handleViewQRDetails} />
              </div>
            </DashboardCard>
          </Grid>
        </Grid>

        {/* Modals */}
        <QRDetailsModal
          open={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          qrDetails={selectedQR}
        />
        <PreviewModal
          open={isPreviewModalOpen}
          onClose={handleClosePreviewModal}
          onConfirm={handleConfirmPreview}
          formData={formData}
          selectedItem={selectedItem}
        />
      </Box>
    </Container>
  );
};

export default QRManagementPage; 