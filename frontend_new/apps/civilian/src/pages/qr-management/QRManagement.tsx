import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Link,
  InputAdornment,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

// Mock data for coffee bean batches
const mockCoffeeBatches = [
  {
    id: 'BATCH-001',
    name: 'Ethiopian Yirgacheffe',
    batchNumber: '2023-10-01',
    origin: 'Ethiopia',
    roastDate: '2023-10-01',
    certifications: ['Organic', 'Fair Trade'],
    status: 'In Warehouse',
  },
  {
    id: 'BATCH-002',
    name: 'Colombian Supremo',
    batchNumber: '2023-09-15',
    origin: 'Colombia',
    roastDate: '2023-09-15',
    certifications: ['Fair Trade'],
    status: 'In Warehouse',
  },
];

// Mock data for QR codes
const mockQRCodes = [
  {
    id: 'QR12345',
    itemId: 'BATCH-001',
    itemName: 'Ethiopian Yirgacheffe - Batch 2023-10-01',
    action: 'Mark as Shipped',
    dateGenerated: '2023-10-15',
    status: 'Pending',
    transactionHash: null,
  },
  {
    id: 'QR12346',
    itemId: 'BATCH-002',
    itemName: 'Colombian Supremo - Batch 2023-09-15',
    action: 'Mark as Received',
    dateGenerated: '2023-10-14',
    status: 'Scanned',
    transactionHash: '0x1234...5678',
    scanDate: '2023-10-16 14:30',
  },
];

const QRManagement: React.FC = () => {
  // State for form and dialogs
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState<any>(null);

  // Stats calculations
  const totalQRCodes = mockQRCodes.length;
  const scannedToday = mockQRCodes.filter(qr => 
    qr.status === 'Scanned' && qr.scanDate?.startsWith('2023-10-16')).length;
  const pendingQRCodes = mockQRCodes.filter(qr => qr.status === 'Pending').length;

  const handleGenerateQR = () => {
    // TODO: Implement QR generation logic
    setIsGenerateDialogOpen(false);
  };

  const handlePreviewQR = (qr: any) => {
    setSelectedQR(qr);
    setIsPreviewDialogOpen(true);
  };

  const getStatusChipColor = (status: string) => {
    return status === 'Scanned' ? 'success' : 'warning';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        QR Codes
      </Typography>

      {/* Summary Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <QrCodeIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total QR Codes Generated</Typography>
              </Box>
              <Typography variant="h4">{totalQRCodes}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>QR Codes Scanned Today</Typography>
              <Typography variant="h4">{scannedToday}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pending QR Codes</Typography>
              <Typography variant="h4">{pendingQRCodes}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Generate QR Code Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Generate New QR Code
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Coffee Batch</InputLabel>
              <Select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                label="Select Coffee Batch"
              >
                {mockCoffeeBatches.map((batch) => (
                  <MenuItem key={batch.id} value={batch.id}>
                    {batch.name} - Batch {batch.batchNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Action</InputLabel>
              <Select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                label="Select Action"
              >
                <MenuItem value="ship">Mark as Shipped</MenuItem>
                <MenuItem value="receive">Mark as Received</MenuItem>
                <MenuItem value="sale">Initiate Sale</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {selectedBatch && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  {mockCoffeeBatches.find(b => b.id === selectedBatch) && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Selected Batch Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Origin: {mockCoffeeBatches.find(b => b.id === selectedBatch)?.origin}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Roast Date: {mockCoffeeBatches.find(b => b.id === selectedBatch)?.roastDate}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            Certifications: {mockCoffeeBatches.find(b => b.id === selectedBatch)?.certifications.join(', ')}
                          </Typography>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<QrCodeIcon />}
              onClick={handleGenerateQR}
              disabled={!selectedBatch || !selectedAction}
            >
              Generate QR Code
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Manage QR Codes Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Manage QR Codes
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by Item Name or QR Code ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="scanned">Scanned</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>QR Code ID</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockQRCodes.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell>{qr.itemName}</TableCell>
                  <TableCell>{qr.id}</TableCell>
                  <TableCell>{qr.action}</TableCell>
                  <TableCell>{qr.dateGenerated}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={qr.status}
                        color={getStatusChipColor(qr.status)}
                        size="small"
                      />
                      {qr.transactionHash && (
                        <Link href="#" onClick={(e) => {
                          e.preventDefault();
                          // TODO: Show blockchain transaction details
                        }}>
                          View Transaction
                        </Link>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View QR Code">
                      <IconButton size="small" onClick={() => handlePreviewQR(qr)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Regenerate QR Code">
                      <IconButton size="small">
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete QR Code">
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* QR Code Preview Dialog */}
      <Dialog
        open={isPreviewDialogOpen}
        onClose={() => setIsPreviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>QR Code Preview</DialogTitle>
        <DialogContent>
          {selectedQR && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              {/* Placeholder for QR Code Image */}
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  bgcolor: 'grey.200',
                  margin: '0 auto',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QrCodeIcon sx={{ fontSize: 100, color: 'grey.400' }} />
              </Box>
              <Typography variant="body1" gutterBottom>
                Scan to {selectedQR.action}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {selectedQR.itemName}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Status: {selectedQR.status}
                {selectedQR.scanDate && ` - Scanned on ${selectedQR.scanDate}`}
              </Typography>
              {selectedQR.transactionHash && (
                <Link href="#" onClick={(e) => {
                  e.preventDefault();
                  // TODO: Show blockchain transaction details
                }}>
                  View Blockchain Transaction
                </Link>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<DownloadIcon />}
            onClick={() => {/* TODO: Implement PDF download */}}
          >
            Download as PDF
          </Button>
          <Button
            startIcon={<PrintIcon />}
            onClick={() => {/* TODO: Implement print functionality */}}
          >
            Print
          </Button>
          <Button onClick={() => setIsPreviewDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QRManagement; 