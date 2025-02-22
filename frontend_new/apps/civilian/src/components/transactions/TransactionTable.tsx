import React from 'react';
import { Box, Typography, Tooltip, Link, Chip } from '@mui/material';
import { DataTable, Column } from '@/shared/components/data-table';
import BlockchainBadge from '@/components/common/BlockchainBadge';
import { formatDate } from '@/utils/dateUtils';
import { 
  FileText, 
  FileCheck, 
  FileSpreadsheet, 
  FileBarChart, 
  AlertTriangle 
} from 'lucide-react';

export interface Transaction {
  transactionHash: string;
  blockNumber: number;
  timestamp: string;
  type: string;
  status: 'Completed' | 'Pending' | 'Failed';
  productId: string;
  productName: string;
  batchLotNumber: string;
  quantity: number;
  from: string;
  fromName?: string;
  to: string;
  toName?: string;
  user: string;
  digitalTwinId: string;
  temperature?: {
    min: number;
    max: number;
    avg: number;
  };
  humidity?: {
    min: number;
    max: number;
    avg: number;
  };
  gpsCoordinates?: Array<{
    latitude: number;
    longitude: number;
  }>;
  documents?: Array<{
    name: string;
    hash: string;
    url: string;
  }>;
  smartContractId: string;
  reason?: string;
  eventSummary: string;
  details?: {
    action: string;
    location: string;
    actor: string;
    data: Record<string, any>;
  };
}

interface TransactionTableProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onTransactionClick
}) => {
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

  const columns: Column<Transaction>[] = [
    {
      id: 'transactionHash',
      label: 'Transaction Hash',
      format: (value: string) => (
        <Tooltip title={value}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            {value.substring(0, 16)}...
          </Typography>
        </Tooltip>
      )
    },
    {
      id: 'timestamp',
      label: 'Timestamp',
      format: (value: string) => formatDate(value),
      sortable: true
    },
    {
      id: 'type',
      label: 'Type',
      sortable: true
    },
    {
      id: 'status',
      label: 'Status',
      format: (value: Transaction['status']) => (
        <Chip
          label={value}
          color={getStatusColor(value)}
          size="small"
        />
      ),
      sortable: true
    },
    {
      id: 'productName',
      label: 'Product',
      format: (value: string, row?: Transaction) => (
        <Box>
          <Link
            href={`/products/${row?.productId}`}
            sx={{ textDecoration: 'none' }}
          >
            {value}
          </Link>
          <Typography variant="caption" display="block" color="text.secondary">
            {row?.batchLotNumber}
          </Typography>
        </Box>
      ),
      sortable: true
    },
    {
      id: 'quantity',
      label: 'Quantity',
      sortable: true
    },
    {
      id: 'fromName',
      label: 'From',
      format: (value: string, row?: Transaction) => (
        <Link
          href={`/locations/${row?.from}`}
          sx={{ textDecoration: 'none' }}
        >
          {value}
        </Link>
      ),
      sortable: true
    },
    {
      id: 'toName',
      label: 'To',
      format: (value: string, row?: Transaction) => (
        <Link
          href={`/locations/${row?.to}`}
          sx={{ textDecoration: 'none' }}
        >
          {value}
        </Link>
      ),
      sortable: true
    },
    {
      id: 'temperature',
      label: 'Temperature',
      format: (temp?: Transaction['temperature']) => {
        if (!temp) return <span>-</span>;
        const hasExcursion = temp.max > 8 || temp.min < 2; // Example threshold
        return (
          <Tooltip title={`Min: ${temp.min}°C, Max: ${temp.max}°C, Avg: ${temp.avg}°C`}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="body2"
                color={hasExcursion ? 'error' : 'text.primary'}
              >
                {temp.avg}°C
              </Typography>
              {hasExcursion && <AlertTriangle size={16} color="#f44336" />}
            </Box>
          </Tooltip>
        );
      }
    },
    {
      id: 'humidity',
      label: 'Humidity',
      format: (humidity?: Transaction['humidity']) => {
        if (!humidity) return <span>-</span>;
        return (
          <Tooltip title={`Min: ${humidity.min}%, Max: ${humidity.max}%, Avg: ${humidity.avg}%`}>
            <Typography variant="body2">
              {humidity.avg}%
            </Typography>
          </Tooltip>
        );
      }
    },
    {
      id: 'user',
      label: 'User',
      sortable: true
    },
    {
      id: 'documents',
      label: 'Documents',
      format: (docs?: Transaction['documents']) => {
        if (!docs?.length) return <span>-</span>;
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {docs.map((doc, index) => (
              <Tooltip key={index} title={doc.name}>
                <Link href={doc.url} target="_blank" rel="noopener">
                  {getDocumentIcon(doc.name)}
                </Link>
              </Tooltip>
            ))}
          </Box>
        );
      }
    },
    {
      id: 'verification',
      label: 'Verification',
      format: (value: any, row?: Transaction) => {
        if (!row) return <span />;
        return (
          <BlockchainBadge
            transactionHash={row.transactionHash}
            timestamp={row.timestamp}
            size="small"
          />
        );
      }
    }
  ];

  return (
    <DataTable<Transaction>
      columns={columns}
      rows={transactions}
      onRowClick={onTransactionClick}
      selectable={false}
      getRowId={(row) => row.transactionHash}
    />
  );
};

export default TransactionTable;
