import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Paper,
  useTheme,
} from '@mui/material';
import {
  X as CloseIcon,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  Hash,
  Link as LinkIcon,
  Shield,
} from 'lucide-react';
import type { Transfer } from '../../types';

interface BlockchainRecordModalProps {
  open: boolean;
  onClose: () => void;
  transfer: Transfer | null;
}

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
}> = ({ icon, label, value, copyable }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
      <Box sx={{ color: 'text.secondary', pt: 0.5 }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}
          >
            {value}
          </Typography>
          {copyable && (
            <IconButton size="small" onClick={handleCopy}>
              <Copy size={14} />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export const BlockchainRecordModal: React.FC<BlockchainRecordModalProps> = ({
  open,
  onClose,
  transfer,
}) => {
  const theme = useTheme();

  if (!transfer || !transfer.blockchainTxId) return null;

  // Mock blockchain data - replace with actual blockchain query
  const blockchainData = {
    transactionHash: transfer.blockchainTxId,
    blockNumber: '12345678',
    timestamp: new Date().toISOString(),
    fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
    toAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    status: 'Confirmed',
    confirmations: '128',
    gasUsed: '21000',
    networkName: 'Ethereum Mainnet',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6">Blockchain Record</Typography>
          <Typography variant="caption" color="text.secondary">
            Transfer ID: {transfer.id}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
            },
          }}
        >
          <CloseIcon size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: theme.palette.success.main + '15',
              border: `1px solid ${theme.palette.success.main}33`,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CheckCircle size={20} color={theme.palette.success.main} />
            <Typography
              variant="body2"
              sx={{ color: theme.palette.success.main, fontWeight: 500 }}
            >
              This transfer has been verified and recorded on the blockchain
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Transaction Details
          </Typography>
          <InfoRow
            icon={<Hash size={16} />}
            label="Transaction Hash"
            value={blockchainData.transactionHash}
            copyable
          />
          <InfoRow
            icon={<LinkIcon size={16} />}
            label="Block Number"
            value={blockchainData.blockNumber}
          />
          <InfoRow
            icon={<Clock size={16} />}
            label="Timestamp"
            value={new Date(blockchainData.timestamp).toLocaleString()}
          />
          <InfoRow
            icon={<Shield size={16} />}
            label="Status"
            value={`${blockchainData.status} (${blockchainData.confirmations} confirmations)`}
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Network Information
          </Typography>
          <InfoRow
            icon={<Shield size={16} />}
            label="Network"
            value={blockchainData.networkName}
          />
          <InfoRow
            icon={<Hash size={16} />}
            label="From Address"
            value={blockchainData.fromAddress}
            copyable
          />
          <InfoRow
            icon={<Hash size={16} />}
            label="To Address"
            value={blockchainData.toAddress}
            copyable
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ExternalLink size={16} />}
          onClick={() => window.open(`https://etherscan.io/tx/${blockchainData.transactionHash}`, '_blank')}
        >
          View on Explorer
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 