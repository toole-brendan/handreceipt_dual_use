import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import { Close, OpenInNew, Download } from '@mui/icons-material';
import { PaymentTransaction, SmartContractDetails } from '@shared/types/payments';
import { formatCurrency } from '@shared/utils/formatting';
import { format } from 'date-fns';

interface PaymentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  payment: PaymentTransaction;
  smartContract?: SmartContractDetails;
  onViewBlockchain: (payment: PaymentTransaction) => void;
  onDownloadReceipt: (payment: PaymentTransaction) => void;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  open,
  onClose,
  payment,
  smartContract,
  onViewBlockchain,
  onDownloadReceipt,
}) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
  };

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Grid container spacing={2} sx={{ mb: 1 }}>
      <Grid item xs={4}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="body2">{value}</Typography>
      </Grid>
    </Grid>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        Payment Details - {payment.id}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            General Information
          </Typography>
          <DetailRow label="Date" value={formatDate(payment.createdAt)} />
          <DetailRow label="Type" value={payment.type} />
          <DetailRow
            label="Amount"
            value={<Typography variant="body2" fontWeight="bold">{formatCurrency(payment.amount)} USDC</Typography>}
          />
          <DetailRow
            label="Status"
            value={
              <Chip
                label={payment.status}
                color={
                  payment.status === 'COMPLETED'
                    ? 'success'
                    : payment.status === 'PENDING'
                    ? 'warning'
                    : 'error'
                }
                size="small"
              />
            }
          />
          <DetailRow
            label="Order/Shipment"
            value={
              payment.orderNumber
                ? <Typography variant="body2" component="span" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
                    Order #{payment.orderNumber}
                  </Typography>
                : '-'
            }
          />
          <DetailRow
            label={payment.type === 'INCOMING' ? 'Sender' : 'Recipient'}
            value={payment.type === 'INCOMING' ? payment.senderName : payment.recipientName}
          />
          {payment.notes && <DetailRow label="Notes" value={payment.notes} />}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Blockchain Information
          </Typography>
          {payment.transactionHash ? (
            <>
              <DetailRow
                label="Transaction Hash"
                value={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'action.hover',
                        p: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {payment.transactionHash}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => onViewBlockchain(payment)}
                    >
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </Box>
                }
              />
              <DetailRow label="Block Number" value={payment.blockNumber || 'Pending'} />
              <DetailRow label="Confirmations" value={payment.confirmations || 0} />
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Transaction not yet submitted to blockchain
            </Typography>
          )}
        </Box>

        {smartContract && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Smart Contract Information
              </Typography>
              <DetailRow
                label="Contract Address"
                value={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'action.hover',
                        p: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {smartContract.address}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => onViewBlockchain(payment)}
                    >
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </Box>
                }
              />
              <DetailRow label="Condition" value={smartContract.condition} />
              <DetailRow label="Status" value={smartContract.status} />
              <DetailRow label="Timeout" value={`${smartContract.timeout} days`} />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          startIcon={<OpenInNew />}
          onClick={() => onViewBlockchain(payment)}
          disabled={!payment.transactionHash}
        >
          View on Blockchain
        </Button>
        <Button
          startIcon={<Download />}
          onClick={() => onDownloadReceipt(payment)}
          variant="contained"
        >
          Download Receipt
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDetailsModal; 