import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Link,
  Clock,
  User,
  FileText,
  Copy,
  ExternalLink,
} from 'lucide-react';
import type { MaintenanceTask } from '../../types';

interface BlockchainRecordModalProps {
  open: boolean;
  task: MaintenanceTask | null;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const truncateHash = (hash: string) => {
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
};

export const BlockchainRecordModal: React.FC<BlockchainRecordModalProps> = ({
  open,
  task,
  onClose,
}) => {
  if (!task) return null;

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleViewInExplorer = (transactionId: string) => {
    // Replace with actual blockchain explorer URL
    window.open(`https://explorer.example.com/tx/${transactionId}`, '_blank');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Blockchain Records
          </Typography>
          <Chip
            icon={<Link size={16} />}
            label={`${task.blockchainRecords.length} Records`}
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" paragraph>
          All maintenance actions are recorded on the blockchain for transparency
          and accountability. Each record is immutable and can be independently verified.
        </Typography>

        <List>
          {task.blockchainRecords.map((record, index) => (
            <Paper
              key={record.transactionId}
              sx={{
                mb: 2,
                p: 2,
                bgcolor: 'background.default',
              }}
              elevation={0}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={20} />
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2">
                    {record.action}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mt: 1,
                      color: 'text.secondary',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Clock size={14} />
                      <Typography variant="caption">
                        {formatDate(record.timestamp)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <User size={14} />
                      <Typography variant="caption">
                        {record.performedBy.rank} {record.performedBy.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        Transaction ID: {truncateHash(record.transactionId)}
                      </Typography>
                      <Box>
                        <Tooltip title="Copy Transaction ID">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyToClipboard(record.transactionId)}
                          >
                            <Copy size={14} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View in Blockchain Explorer">
                          <IconButton
                            size="small"
                            onClick={() => handleViewInExplorer(record.transactionId)}
                          >
                            <ExternalLink size={14} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 