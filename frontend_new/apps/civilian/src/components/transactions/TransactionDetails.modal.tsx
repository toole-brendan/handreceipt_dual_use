import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  Link,
  Paper,
  alpha,
  Divider,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  X,
  ExternalLink,
  Hash,
  Clock,
  Database,
  FileText,
  FileCheck,
  FileSpreadsheet,
  FileBarChart,
  AlertTriangle,
  Box as BoxIcon,
  Activity,
  History,
  Package
} from 'lucide-react';
import { Transaction } from './TransactionTable';
import { formatDate } from '@/utils/dateUtils';
import { colors } from '@/styles/theme/colors';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDocumentIcon = (docName: string) => {
    const lowerName = docName.toLowerCase();
    if (lowerName.includes('certificate') || lowerName.includes('analysis')) {
      return <FileCheck size={16} />;
    }
    if (lowerName.includes('report')) {
      return <FileBarChart size={16} />;
    }
    if (lowerName.includes('manifest') || lowerName.includes('record')) {
      return <FileSpreadsheet size={16} />;
    }
    return <FileText size={16} />;
  };

  // Mock event log data (in a real app, this would come from the backend)
  const eventLog = [
    {
      timestamp: transaction.timestamp,
      event: 'Transaction Created',
      actor: transaction.user,
      details: 'Transaction initiated'
    },
    {
      timestamp: transaction.timestamp,
      event: 'Smart Contract Execution',
      actor: 'System',
      details: `Contract ${transaction.smartContractId} executed`
    },
    {
      timestamp: transaction.timestamp,
      event: 'Blockchain Confirmation',
      actor: 'Network',
      details: `Block #${transaction.blockNumber}`
    }
  ];

  // Mock audit trail data (in a real app, this would come from the backend)
  const auditTrail = [
    {
      timestamp: transaction.timestamp,
      action: 'Created',
      actor: transaction.user,
      details: 'Transaction record created'
    },
    {
      timestamp: transaction.timestamp,
      action: 'Validated',
      actor: 'System',
      details: 'Data validation completed'
    },
    {
      timestamp: transaction.timestamp,
      action: 'Verified',
      actor: 'Blockchain',
      details: 'Transaction verified on blockchain'
    }
  ];

  return (
    <Dialog
      open={!!transaction}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Transaction Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Left Column */}
          <Box sx={{ flex: 2 }}>
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
                      {transaction.transactionHash}
                    </Typography>
                    <Link
                      href={`https://example.com/explorer/tx/${transaction.transactionHash}`}
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
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Basic Details */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
                  {formatDate(transaction.timestamp)}
                </Typography>
              </Paper>

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
                  <Activity size={16} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                </Box>
                <Chip
                  label={transaction.status}
                  color={getStatusColor(transaction.status)}
                  size="small"
                />
              </Paper>
            </Box>

            {/* Product Details */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                bgcolor: alpha(colors.background.paper, 0.5),
                border: `1px solid ${alpha(colors.primary, 0.1)}`,
                borderRadius: 1
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Product Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Product Name</Typography>
                  <Typography variant="body1">{transaction.productName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Product ID</Typography>
                  <Typography variant="body1">{transaction.productId}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Batch/Lot Number</Typography>
                  <Typography variant="body1">{transaction.batchLotNumber}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Quantity</Typography>
                  <Typography variant="body1">{transaction.quantity}</Typography>
                </Box>
              </Box>
            </Paper>

            {/* Environmental Data */}
            {(transaction.temperature || transaction.humidity) && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: alpha(colors.background.paper, 0.5),
                  border: `1px solid ${alpha(colors.primary, 0.1)}`,
                  borderRadius: 1
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Environmental Data
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  {transaction.temperature && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Temperature</Typography>
                      <Typography variant="body1">
                        Min: {transaction.temperature.min}°C / 
                        Max: {transaction.temperature.max}°C / 
                        Avg: {transaction.temperature.avg}°C
                      </Typography>
                    </Box>
                  )}
                  {transaction.humidity && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Humidity</Typography>
                      <Typography variant="body1">
                        Min: {transaction.humidity.min}% / 
                        Max: {transaction.humidity.max}% / 
                        Avg: {transaction.humidity.avg}%
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            )}

            {/* Documents */}
            {transaction.documents && transaction.documents.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: alpha(colors.background.paper, 0.5),
                  border: `1px solid ${alpha(colors.primary, 0.1)}`,
                  borderRadius: 1
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Associated Documents
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {transaction.documents.map((doc, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: alpha(colors.primary, 0.05)
                      }}
                    >
                      {getDocumentIcon(doc.name)}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{doc.name}</Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                        >
                          {doc.hash.substring(0, 10)}...
                        </Typography>
                      </Box>
                      <Link
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Document
                      </Link>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Event Details */}
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
                Event Details
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Event Summary</Typography>
                  <Typography variant="body1">{transaction.eventSummary}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">From</Typography>
                  <Typography variant="body1">{transaction.fromName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">To</Typography>
                  <Typography variant="body1">{transaction.toName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">User</Typography>
                  <Typography variant="body1">{transaction.user}</Typography>
                </Box>
                {transaction.reason && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Reason</Typography>
                    <Typography variant="body1" color="error.main">{transaction.reason}</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Right Column */}
          <Box sx={{ flex: 1 }}>
            {/* Digital Twin Visualization */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                bgcolor: alpha(colors.background.paper, 0.5),
                border: `1px solid ${alpha(colors.primary, 0.1)}`,
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Package size={16} />
                <Typography variant="subtitle2" color="text.secondary">
                  Digital Twin
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 200,
                  bgcolor: alpha(colors.primary, 0.05),
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <BoxIcon size={48} color={colors.primary} />
                <Typography variant="body2" color="text.secondary">
                  Digital Twin Visualization
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {transaction.digitalTwinId}
                </Typography>
              </Box>
            </Paper>

            {/* Event Log */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                bgcolor: alpha(colors.background.paper, 0.5),
                border: `1px solid ${alpha(colors.primary, 0.1)}`,
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Activity size={16} />
                <Typography variant="subtitle2" color="text.secondary">
                  Event Log
                </Typography>
              </Box>
              <Timeline>
                {eventLog.map((event, index) => (
                  <TimelineItem key={index}>
                    <TimelineOppositeContent color="text.secondary">
                      {formatDate(event.timestamp)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="primary" variant="outlined" />
                      {index < eventLog.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body2">{event.event}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.actor} - {event.details}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Paper>

            {/* Audit Trail */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: alpha(colors.background.paper, 0.5),
                border: `1px solid ${alpha(colors.primary, 0.1)}`,
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <History size={16} />
                <Typography variant="subtitle2" color="text.secondary">
                  Audit Trail
                </Typography>
              </Box>
              <Timeline>
                {auditTrail.map((entry, index) => (
                  <TimelineItem key={index}>
                    <TimelineOppositeContent color="text.secondary">
                      {formatDate(entry.timestamp)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="primary" variant="outlined" />
                      {index < auditTrail.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body2">{entry.action}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.actor} - {entry.details}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Paper>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;
