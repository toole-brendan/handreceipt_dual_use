import React from 'react';
import { Box, Typography, Paper, alpha, Link } from '@mui/material';
import { ExternalLink, Hash, Clock, Database, FileText } from 'lucide-react';
import { colors } from '../../styles/theme/colors';

interface TransactionData {
  hash: string;
  timestamp: string;
  blockNumber: number;
  type: string;
  data: Record<string, any>;
  explorerUrl?: string;
}

interface TransactionDetailsProps {
  transaction: TransactionData;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transaction }) => {
  return (
    <Box>
      {/* Transaction Hash */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          bgcolor: alpha(colors.primary, 0.05),
          border: `1px solid ${alpha(colors.primary, 0.1)}`,
          borderRadius: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Hash size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Transaction Hash
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}
              >
                {transaction.hash}
              </Typography>
              {transaction.explorerUrl && (
                <Link
                  href={transaction.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'text.secondary',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  <ExternalLink size={16} />
                  View in Explorer
                </Link>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Transaction Details */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {/* Timestamp */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2,
            bgcolor: alpha(colors.background.paper, 0.5),
            border: `1px solid ${alpha(colors.primary, 0.1)}`,
            borderRadius: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Clock size={16} />
            <Typography variant="subtitle2" color="text.secondary">
              Timestamp
            </Typography>
          </Box>
          <Typography variant="body2">
            {new Date(transaction.timestamp).toLocaleString()}
          </Typography>
        </Paper>

        {/* Block Number */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2,
            bgcolor: alpha(colors.background.paper, 0.5),
            border: `1px solid ${alpha(colors.primary, 0.1)}`,
            borderRadius: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Database size={16} />
            <Typography variant="subtitle2" color="text.secondary">
              Block Number
            </Typography>
          </Box>
          <Typography variant="body2">
            {transaction.blockNumber.toLocaleString()}
          </Typography>
        </Paper>

        {/* Transaction Type */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2,
            bgcolor: alpha(colors.background.paper, 0.5),
            border: `1px solid ${alpha(colors.primary, 0.1)}`,
            borderRadius: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <FileText size={16} />
            <Typography variant="subtitle2" color="text.secondary">
              Type
            </Typography>
          </Box>
          <Typography variant="body2">
            {transaction.type}
          </Typography>
        </Paper>
      </Box>

      {/* Transaction Data */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: alpha(colors.background.paper, 0.5),
          border: `1px solid ${alpha(colors.primary, 0.1)}`,
          borderRadius: 1
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Transaction Data
        </Typography>
        <Box sx={{ mt: 1 }}>
          {Object.entries(transaction.data).map(([key, value]) => (
            <Box
              key={key}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                py: 1,
                '&:not(:last-child)': {
                  borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`
                }
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ width: 120, flexShrink: 0 }}
              >
                {key}:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  wordBreak: 'break-all',
                  fontFamily: typeof value === 'string' && value.startsWith('0x')
                    ? 'monospace'
                    : 'inherit'
                }}
              >
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default TransactionDetails;
