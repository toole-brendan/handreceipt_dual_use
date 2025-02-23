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
  Box,
  Chip,
  IconButton,
  Tooltip,
  Link,
} from '@mui/material';
import { Launch as LaunchIcon } from '@mui/icons-material';
import { BlockchainTransaction } from '../types';

interface BlockchainTransactionsProps {
  transactions: BlockchainTransaction[];
}

export const BlockchainTransactions: React.FC<BlockchainTransactionsProps> = ({
  transactions,
}) => {
  const getStatusColor = (status: BlockchainTransaction['status']): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: BlockchainTransaction['type']) => {
    switch (type) {
      case 'payment':
        return 'Payment';
      case 'inventory_update':
        return 'Inventory Update';
      case 'shipment_update':
        return 'Shipment Update';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Blockchain Transactions
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Details</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(transaction.type)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status}
                      size="small"
                      color={getStatusColor(transaction.status)}
                    />
                  </TableCell>
                  <TableCell>{transaction.details}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View on Etherscan">
                      <IconButton
                        size="small"
                        component={Link}
                        href={transaction.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <LaunchIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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