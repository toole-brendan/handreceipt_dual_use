import React, { useMemo } from 'react';
import { Box, Paper, Typography, Tooltip, alpha, Link } from '@mui/material';
import { CheckCircle, AlertTriangle, XCircle, Server, ExternalLink } from 'lucide-react';
import { Transaction } from './TransactionTable';
import { formatDate } from '@/utils/dateUtils';
import { colors } from '@/styles/theme/colors';

interface TransactionsSummaryProps {
  transactions: Transaction[];
  networkHealth: {
    network: string;
    blockchain: string;
    security: string;
    performance: number;
  };
  onTransactionClick?: (transaction: Transaction) => void;
}

// Transaction type colors
const TYPE_COLORS = {
  'Batch Created': '#4caf50',
  'Shipment In Transit': '#2196f3',
  'Temperature Excursion': '#f44336',
  'Quality Check Passed': '#4caf50',
  'Quality Check Failed': '#f44336',
  'Dispensing': '#9c27b0',
  'Return': '#ff9800',
  'Disposal': '#795548'
} as const;

// Status opacity modifiers
const STATUS_OPACITY = {
  'Completed': 1,
  'Pending': 0.7,
  'Failed': 0.4
} as const;

// Explorer URLs for different networks
const EXPLORER_URLS = {
  'mainnet': 'https://etherscan.io/tx/',
  'polygon': 'https://polygonscan.com/tx/',
  'optimism': 'https://optimistic.etherscan.io/tx/'
};

const TransactionsSummary: React.FC<TransactionsSummaryProps> = ({
  transactions,
  networkHealth,
  onTransactionClick
}) => {
  // Get last 24 hours of transactions
  const recentTransactions = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return transactions
      .filter(tx => new Date(tx.timestamp) >= yesterday)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [transactions]);

  const getNetworkHealthIcon = () => {
    const { network, blockchain, performance } = networkHealth;
    if (network === 'healthy' && blockchain === 'synced' && performance >= 90) {
      return <CheckCircle color="#4caf50" size={24} />;
    } else if (network === 'healthy' && blockchain === 'synced' && performance >= 70) {
      return <AlertTriangle color="#ff9800" size={24} />;
    } else {
      return <XCircle color="#f44336" size={24} />;
    }
  };

  const getConfirmationTimeColor = () => {
    const { performance } = networkHealth;
    if (performance >= 90) return '#4caf50';
    if (performance >= 70) return '#ff9800';
    return '#f44336';
  };

  const getConfirmationTimeStatus = () => {
    const { performance } = networkHealth;
    if (performance >= 90) return 'Fast';
    if (performance >= 70) return 'Normal';
    return 'Slow';
  };

  const handleTimelineClick = (transaction: Transaction) => {
    if (onTransactionClick) {
      onTransactionClick(transaction);
    }
  };

  const getExplorerUrl = (hash: string) => {
    // For this example, we'll use Polygon's explorer
    return EXPLORER_URLS.polygon + hash;
  };

  const renderDigitalTwin = (transaction: Transaction) => {
    if (!transaction.digitalTwinId || !transaction.details?.data) return null;

    const data = transaction.details.data;
    const temperature = transaction.temperature?.avg 
      ? `${transaction.temperature.avg}°C`
      : data.Temperature || 'N/A';
    const humidity = transaction.humidity?.avg 
      ? `${transaction.humidity.avg}%`
      : data.Humidity || 'N/A';
    const location = data.Location || transaction.details.location || 'N/A';

    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box component="span" sx={{ 
            width: 20, 
            height: 20, 
            borderRadius: '50%',
            bgcolor: transaction.status === 'Completed' ? '#4caf50' : '#ff9800',
            animation: transaction.status === 'Pending' ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            }
          }} />
          Digital Twin Status
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Temperature</Typography>
            <Typography>{temperature}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Humidity</Typography>
            <Typography>{humidity}</Typography>
          </Box>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Typography variant="caption" color="text.secondary">Location</Typography>
            <Typography>{location}</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Network Health */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Network Status
            </Typography>
            <Tooltip
              title={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Network: {networkHealth.network}
                  </Typography>
                  <Typography variant="body2">
                    Blockchain: {networkHealth.blockchain}
                  </Typography>
                  <Typography variant="body2">
                    Security: {networkHealth.security}
                  </Typography>
                </Box>
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 32 }}>
                {getNetworkHealthIcon()}
                <Typography>
                  {networkHealth.network === 'healthy' ? 'Healthy' : 'Issues Detected'}
                </Typography>
              </Box>
            </Tooltip>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Block Confirmation Time
            </Typography>
            <Tooltip
              title={`Average block confirmation time based on network performance (${networkHealth.performance}%)`}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 32 }}>
                {/* Gauge visualization */}
                <Box sx={{ position: 'relative', width: 48, height: 24 }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      bgcolor: alpha(getConfirmationTimeColor(), 0.2),
                      borderRadius: '12px'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: `${networkHealth.performance}%`,
                      height: '100%',
                      bgcolor: getConfirmationTimeColor(),
                      borderRadius: '12px',
                      transition: 'width 0.3s ease-in-out'
                    }}
                  />
                </Box>
                <Typography>{getConfirmationTimeStatus()}</Typography>
              </Box>
            </Tooltip>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Network Performance
            </Typography>
            <Tooltip title="Overall network performance score based on latency, throughput, and error rates">
              <Box sx={{ display: 'flex', alignItems: 'center', height: 32 }}>
                <Typography>{networkHealth.performance}%</Typography>
              </Box>
            </Tooltip>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Nodes Online
            </Typography>
            <Tooltip title="Status of network nodes and their synchronization">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 32 }}>
                <Server size={16} color={networkHealth.performance >= 70 ? '#4caf50' : '#f44336'} />
                <Typography>
                  {networkHealth.performance >= 70 ? 'All Nodes Operational' : 'Node Issues Detected'}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Recent Activity Timeline */}
      <Paper sx={{ p: 1 }}>
        <Typography variant="subtitle1" sx={{ px: 2, pt: 1.5, pb: 1 }}>
          Recent Activity Timeline
        </Typography>

        <Box sx={{ 
          position: 'relative', 
          height: 'auto',
          minHeight: 80,
          bgcolor: alpha(colors.background.paper, 0.03),
          borderRadius: 1,
          py: 1.5,
          px: 3,
          border: `1px solid ${alpha(colors.primary, 0.1)}`,
          mb: 2,
          overflow: 'hidden'
        }}>
          {/* Time axis */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 26,
              left: 0,
              right: 0,
              height: 1,
              bgcolor: 'divider'
            }}
          />
          
          {recentTransactions.map((transaction, index) => {
            const startTime = new Date(transaction.timestamp).getTime();
            const endTime = startTime + (transaction.type === 'Shipment In Transit' ? 3600000 : 0);
            const now = Date.now();
            const timeRange = now - (now - 24 * 60 * 60 * 1000);
            const leftPosition = ((startTime - (now - 24 * 60 * 60 * 1000)) / timeRange) * 100;
            const width = transaction.type === 'Shipment In Transit' 
              ? ((endTime - startTime) / timeRange) * 100
              : 1.5; // Slightly smaller fixed width for point events

            return (
              <Tooltip
                key={transaction.transactionHash}
                title={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {transaction.type}
                    </Typography>
                    <Typography variant="body2">
                      Hash: {transaction.transactionHash.substring(0, 16)}...
                    </Typography>
                    <Typography variant="body2">
                      Time: {formatDate(transaction.timestamp)}
                    </Typography>
                    <Typography variant="body2">
                      Product: {transaction.productName}
                    </Typography>
                    <Typography variant="body2">
                      From: {transaction.fromName}
                    </Typography>
                    <Typography variant="body2">
                      To: {transaction.toName}
                    </Typography>
                    {transaction.digitalTwinId && (
                      <Typography variant="body2">
                        Digital Twin: {transaction.digitalTwinId}
                      </Typography>
                    )}
                    {renderDigitalTwin(transaction)}
                  </Box>
                }
              >
                <Box
                  onClick={() => handleTimelineClick(transaction)}
                  sx={{
                    position: 'absolute',
                    bottom: 18,
                    left: `${leftPosition}%`,
                    width: `${width}%`,
                    height: 32,
                    bgcolor: TYPE_COLORS[transaction.type as keyof typeof TYPE_COLORS] || colors.primary,
                    opacity: STATUS_OPACITY[transaction.status],
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      opacity: 1,
                      transform: 'scale(1.1)',
                      boxShadow: 2,
                      zIndex: 1
                    }
                  }}
                />
              </Tooltip>
            );
          })}

          {/* Time labels */}
          {Array.from({ length: 7 }).map((_, i) => {
            const time = new Date(Date.now() - (24 - i * 4) * 60 * 60 * 1000);
            return (
              <Typography
                key={i}
                variant="caption"
                color="text.secondary"
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  left: `${1 + (i * 4) / 24 * 98}%`,
                  transform: 'translateX(-50%)',
                  letterSpacing: -0.5
                }}
              >
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            );
          })}
        </Box>

        {/* Transaction Hash with Explorer Link */}
        {recentTransactions.length > 0 && (
          <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Latest Transaction:
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
              {recentTransactions[recentTransactions.length - 1].transactionHash}
            </Typography>
            <Link 
              href={getExplorerUrl(recentTransactions[recentTransactions.length - 1].transactionHash)}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main', textDecoration: 'none' }}
            >
              View in Explorer
              <ExternalLink size={14} />
            </Link>
          </Box>
        )}

        {/* Legend */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
          gap: 2, 
          mt: 2, 
          px: 1 
        }}>
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  bgcolor: color,
                  borderRadius: 0.5,
                  border: `1px solid ${alpha(colors.primary, 0.1)}`
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{type}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default TransactionsSummary;
