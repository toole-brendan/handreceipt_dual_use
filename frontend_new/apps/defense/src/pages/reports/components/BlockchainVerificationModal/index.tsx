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
  IconButton,
  Tooltip,
  Divider,
  Chip,
} from '@mui/material';
import { Copy, ExternalLink } from 'lucide-react';
import type { ReportData, BlockchainRecord } from '../../types';

interface BlockchainVerificationModalProps {
  open: boolean;
  onClose: () => void;
  report: ReportData | null;
}

const truncateHash = (hash: string) => {
  if (hash.length <= 13) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date);
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'REPORT_CREATED':
      return 'primary';
    case 'REPORT_UPDATED':
      return 'info';
    case 'REPORT_APPROVED':
      return 'success';
    case 'REPORT_REJECTED':
      return 'error';
    default:
      return 'default';
  }
};

export const BlockchainVerificationModal: React.FC<BlockchainVerificationModalProps> = ({
  open,
  onClose,
  report,
}) => {
  if (!report) return null;

  const handleViewInExplorer = (transactionId: string) => {
    // Replace with actual blockchain explorer URL
    window.open(`https://explorer.example.com/tx/${transactionId}`, '_blank');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Blockchain Verification
        <Typography variant="subtitle2" color="text.secondary">
          Report ID: {report.id}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Report Information
          </Typography>
          <Typography variant="body2">
            Title: {report.title}
            <br />
            Created by: {report.createdBy.rank} {report.createdBy.name}
            <br />
            Unit: {report.createdBy.unit}
            <br />
            Status: <Chip label={report.status} size="small" color="primary" />
          </Typography>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Blockchain Records
        </Typography>
        <List>
          {report.blockchainRecords.map((record: BlockchainRecord, index: number) => (
            <React.Fragment key={record.transactionId}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 1,
                  py: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Chip
                    label={record.action}
                    size="small"
                    color={getActionColor(record.action) as any}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(record.timestamp)}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title="Copy Transaction ID">
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(record.transactionId)}
                    >
                      <Copy size={16} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View in Blockchain Explorer">
                    <IconButton
                      size="small"
                      onClick={() => handleViewInExplorer(record.transactionId)}
                    >
                      <ExternalLink size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                    Transaction ID: {truncateHash(record.transactionId)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Personnel: {record.personnel.rank} {record.personnel.name}
                    <br />
                    Unit: {record.personnel.unit}
                  </Typography>
                </Box>

                {Object.keys(record.details).length > 0 && (
                  <Box
                    sx={{
                      width: '100%',
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                      p: 1,
                      mt: 1,
                    }}
                  >
                    <Typography variant="caption" component="pre" sx={{ m: 0 }}>
                      {JSON.stringify(record.details, null, 2)}
                    </Typography>
                  </Box>
                )}
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 