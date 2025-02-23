import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { PendingPayment } from '../types';

interface PendingPaymentsProps {
  payments: PendingPayment[];
  onViewAll: () => void;
}

export const PendingPayments: React.FC<PendingPaymentsProps> = ({
  payments,
  onViewAll,
}) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Pending Payments</Typography>
          <Button
            color="primary"
            onClick={onViewAll}
            sx={{ textTransform: 'none' }}
          >
            View All
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Payment ID</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Due Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: 'action.hover',
                    },
                    ...(payment.isOverdue && {
                      backgroundColor: '#FFF4F4',
                      '&:nth-of-type(odd)': {
                        backgroundColor: '#FFE7E7',
                      },
                    }),
                  }}
                >
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>{payment.recipient}</TableCell>
                  <TableCell align="right">
                    {payment.amount.toLocaleString()} USDC
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {new Date(payment.dueDate).toLocaleDateString()}
                      {payment.isOverdue && (
                        <Chip
                          label="Overdue"
                          color="error"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}; 