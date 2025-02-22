import { FC, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { VerifiedUser as VerifiedIcon } from '@mui/icons-material';

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
  blockchainTxId: string;
}

const MOCK_LOGS: ActivityLog[] = [
  {
    id: '1',
    user: 'LT Smith',
    action: 'Approved Transfer',
    timestamp: '10/02/2024 14:30',
    details: 'Item: M4 Carbine, Serial: 123456',
    blockchainTxId: '0x1234...5678',
  },
  {
    id: '2',
    user: 'SGT Jones',
    action: 'Updated Inventory',
    timestamp: '10/02/2024 13:15',
    details: 'Added 50 magazines to inventory',
    blockchainTxId: '0x5678...9012',
  },
];

const ACTION_TYPES = [
  'All',
  'Login',
  'Logout',
  'Create User',
  'Update User',
  'Deactivate User',
  'Approved Transfer',
  'Updated Inventory',
  'Generated Report',
];

export const ActivityLogs: FC = () => {
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    user: '',
    actionType: 'All',
  });

  const handleLogClick = (log: ActivityLog) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <DatePicker
              label="From Date"
              value={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <DatePicker
              label="To Date"
              value={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Action Type"
              value={filters.actionType}
              onChange={(e) => handleFilterChange('actionType', e.target.value)}
            >
              {ACTION_TYPES.map((action) => (
                <MenuItem key={action} value={action}>
                  {action}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="User"
              value={filters.user}
              onChange={(e) => handleFilterChange('user', e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Blockchain Verification</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_LOGS.map((log) => (
              <TableRow
                key={log.id}
                hover
                onClick={() => handleLogClick(log)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.timestamp}</TableCell>
                <TableCell>{log.details}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedIcon sx={{ color: '#4A5D23' }} />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Verified
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Log Details Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#4A5D23', color: 'white' }}>
          Activity Log Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedLog && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography>
                <strong>User:</strong> {selectedLog.user}
              </Typography>
              <Typography>
                <strong>Action:</strong> {selectedLog.action}
              </Typography>
              <Typography>
                <strong>Timestamp:</strong> {selectedLog.timestamp}
              </Typography>
              <Typography>
                <strong>Details:</strong> {selectedLog.details}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Blockchain Verification
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    Transaction ID: {selectedLog.blockchainTxId}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <VerifiedIcon sx={{ color: '#4A5D23', mr: 1 }} />
                    <Typography variant="body2">
                      Verified on Blockchain
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setModalOpen(false)}
            variant="contained"
            sx={{
              backgroundColor: '#4A5D23',
              '&:hover': { backgroundColor: '#3A4D13' },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 