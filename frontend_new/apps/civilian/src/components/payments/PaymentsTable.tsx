import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  TablePagination,
} from '@mui/material';
import {
  OpenInNew,
  CheckCircle,
  Error,
  HourglassEmpty,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { PaymentTransaction } from '@shared/types/payments';
import { formatCurrency } from '@shared/utils/formatting';
import { format } from 'date-fns';

interface PaymentsTableProps {
  payments: PaymentTransaction[];
  onViewDetails: (payment: PaymentTransaction) => void;
  onViewBlockchain: (payment: PaymentTransaction) => void;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  onViewDetails,
  onViewBlockchain,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle fontSize="small" />;
      case 'PENDING':
        return <HourglassEmpty fontSize="small" />;
      case 'FAILED':
        return <Error fontSize="small" />;
      default:
        return <CheckCircle fontSize="small" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'INCOMING' ? (
      <ArrowDownward fontSize="small" color="success" />
    ) : (
      <ArrowUpward fontSize="small" color="error" />
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Order/Shipment</TableCell>
              <TableCell>Recipient/Sender</TableCell>
              <TableCell>Blockchain Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" sx={{ py: 2, fontStyle: 'italic' }}>
                    No payments found. Try adjusting your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{formatDate(payment.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTypeIcon(payment.type)}
                      {payment.type}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(payment.amount)} USDC
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(payment.status)}
                      label={payment.status}
                      color={getStatusColor(payment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {payment.orderNumber ? (
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => {/* Handle order click */}}
                      >
                        Order #{payment.orderNumber}
                      </Typography>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{payment.type === 'INCOMING' ? payment.senderName : payment.recipientName}</TableCell>
                  <TableCell>
                    <Tooltip title={`${payment.confirmations || 0} confirmations`}>
                      <Chip
                        icon={getStatusIcon(payment.blockchainStatus)}
                        label={payment.blockchainStatus.replace('_', ' ')}
                        color={getStatusColor(payment.blockchainStatus)}
                        size="small"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => onViewDetails(payment)}
                      >
                        <OpenInNew />
                      </IconButton>
                    </Tooltip>
                    {payment.transactionHash && (
                      <Tooltip title="View on Blockchain">
                        <IconButton
                          size="small"
                          onClick={() => onViewBlockchain(payment)}
                        >
                          <OpenInNew />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
};

export default PaymentsTable; 