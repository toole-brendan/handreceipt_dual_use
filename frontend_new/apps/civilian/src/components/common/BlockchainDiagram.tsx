import React from 'react';
import { Box, Typography, Paper, alpha, useTheme } from '@mui/material';
import { Link2, ArrowRight } from 'lucide-react';
import { colors } from '../../styles/theme/colors';

interface BlockchainTransaction {
  hash: string;
  timestamp: string;
  type: string;
  data: Record<string, any>;
}

interface BlockchainDiagramProps {
  transactions?: BlockchainTransaction[];
  blocks?: number;
  onTransactionClick?: (transaction: BlockchainTransaction) => void;
}

const generateSampleTransactions = (blocks: number): BlockchainTransaction[] => {
  const types = ['create', 'update', 'transfer'];
  const now = new Date();
  
  return Array.from({ length: blocks }, (_, i) => ({
    hash: `0x${Math.random().toString(16).substring(2)}`,
    timestamp: new Date(now.getTime() - (blocks - i) * 60000).toISOString(),
    type: types[Math.floor(Math.random() * types.length)],
    data: {
      'Block Number': blocks - i,
      'Gas Used': Math.floor(Math.random() * 100000),
      'Size': `${Math.floor(Math.random() * 100)}KB`
    }
  }));
};

const BlockchainDiagram: React.FC<BlockchainDiagramProps> = ({
  transactions: propTransactions,
  blocks = 0,
  onTransactionClick
}) => {
  const transactions = propTransactions || (blocks > 0 ? generateSampleTransactions(blocks) : []);
  const theme = useTheme();

  const getTransactionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'create':
        return colors.success;
      case 'update':
        return colors.warning;
      case 'transfer':
        return colors.info;
      case 'delete':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', py: 2 }}>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        minWidth: transactions.length * 280,
        px: 2
      }}>
        {transactions.map((transaction, index) => (
          <React.Fragment key={transaction.hash}>
            <Paper
              elevation={0}
              sx={{
                width: 240,
                p: 2,
                bgcolor: alpha(getTransactionColor(transaction.type), 0.1),
                border: `1px solid ${alpha(getTransactionColor(transaction.type), 0.2)}`,
                borderRadius: 1,
                cursor: onTransactionClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
                '&:hover': onTransactionClick ? {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                } : undefined
              }}
              onClick={() => onTransactionClick?.(transaction)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(getTransactionColor(transaction.type), 0.2),
                    color: getTransactionColor(transaction.type),
                    mr: 1
                  }}
                >
                  <Link2 size={16} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {transaction.type}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 1,
                  fontFamily: 'monospace',
                  color: 'text.secondary'
                }}
              >
                {transaction.hash.substring(0, 16)}...
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {new Date(transaction.timestamp).toLocaleString()}
              </Typography>

              <Box sx={{ mt: 2 }}>
                {Object.entries(transaction.data).map(([key, value]) => (
                  <Typography
                    key={key}
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'text.secondary',
                      '&:not(:last-child)': { mb: 0.5 }
                    }}
                  >
                    <strong>{key}:</strong> {String(value)}
                  </Typography>
                ))}
              </Box>
            </Paper>

            {index < transactions.length - 1 && (
              <Box sx={{ mx: 2, color: 'text.disabled' }}>
                <ArrowRight size={24} />
              </Box>
            )}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export const BlockchainDiagramWithDescription: React.FC<BlockchainDiagramProps & {
  title?: string;
  description?: string;
}> = ({ title, description, ...props }) => {
  return (
    <Box>
      {title && (
        <Typography
          variant="h6"
          sx={{
            mb: 1,
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          {title}
        </Typography>
      )}
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          {description}
        </Typography>
      )}
      <BlockchainDiagram {...props} />
    </Box>
  );
};

export default BlockchainDiagram;
