import React, { useState, useEffect } from 'react';
import '../../../../styles/components/blockchain/transactions.css';
import LoadingFallback from '../../../../shared/components/common/LoadingFallback';
import { PropertyTransaction, fetchPropertyTransactions, exportPropertyTransactions } from '../../../../services/transactions';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Download } from 'lucide-react';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<PropertyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await fetchPropertyTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'xlsx') => {
    try {
      const blob = await exportPropertyTransactions(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export transactions:', error);
    }
  };

  if (loading) {
    return <LoadingFallback message="Loading transactions..." />;
  }

  return (
    <div className="transactions-container">
      <div className="header">
        <h2>Property Transactions</h2>
        <div className="actions">
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Asset</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.id}</TableCell>
                <TableCell>
                  <span className={`transaction-type ${transaction.type}`}>
                    {transaction.type}
                  </span>
                </TableCell>
                <TableCell>{transaction.asset.name}</TableCell>
                <TableCell>{transaction.fromUser || '-'}</TableCell>
                <TableCell>{transaction.toUser || '-'}</TableCell>
                <TableCell>
                  <span className={`transaction-status ${transaction.status}`}>
                    {transaction.status}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(transaction.timestamp).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
