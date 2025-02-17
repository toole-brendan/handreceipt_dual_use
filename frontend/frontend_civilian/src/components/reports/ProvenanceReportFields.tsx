import { ReportField } from './ReportCustomization';
import { ReactNode } from 'react';
import { Typography, Link, Stack, Chip } from '@mui/material';

export const PROVENANCE_REPORT_FIELDS: ReportField[] = [
  // Product Information
  {
    id: 'productId',
    label: 'Product ID',
    category: 'Product Information',
    defaultSelected: true
  },
  {
    id: 'productName',
    label: 'Product Name',
    category: 'Product Information',
    defaultSelected: true
  },
  {
    id: 'batchNumber',
    label: 'Batch Number',
    category: 'Product Information',
    defaultSelected: true
  },
  
  // Event Information
  {
    id: 'eventType',
    label: 'Event Type',
    category: 'Event',
    defaultSelected: true
  },
  {
    id: 'timestamp',
    label: 'Timestamp',
    category: 'Event',
    defaultSelected: true
  },
  {
    id: 'data.temperature',
    label: 'Temperature',
    category: 'Event',
    defaultSelected: false
  },
  {
    id: 'data.humidity',
    label: 'Humidity',
    category: 'Event',
    defaultSelected: false
  },
  {
    id: 'data.notes',
    label: 'Notes',
    category: 'Event',
    defaultSelected: false
  },

  // Location Information
  {
    id: 'location.name',
    label: 'Location',
    category: 'Location',
    defaultSelected: true
  },
  {
    id: 'location.type',
    label: 'Location Type',
    category: 'Location',
    defaultSelected: true
  },
  {
    id: 'location.coordinates',
    label: 'Coordinates',
    category: 'Location',
    defaultSelected: false
  },

  // Handler Information
  {
    id: 'handler.id',
    label: 'Handler ID',
    category: 'Handler',
    defaultSelected: false
  },
  {
    id: 'handler.role',
    label: 'Handler Role',
    category: 'Handler',
    defaultSelected: true
  },
  {
    id: 'handler.organization',
    label: 'Organization',
    category: 'Handler',
    defaultSelected: true
  },

  // Blockchain Information
  {
    id: 'blockchainRef.transactionHash',
    label: 'Transaction Hash',
    category: 'Blockchain',
    defaultSelected: true
  },
  {
    id: 'blockchainRef.blockNumber',
    label: 'Block Number',
    category: 'Blockchain',
    defaultSelected: true
  },
  {
    id: 'complianceStatus',
    label: 'Compliance Status',
    category: 'Blockchain',
    defaultSelected: true
  },

  // Documents
  {
    id: 'data.documentRefs',
    label: 'Documents',
    category: 'Documentation',
    defaultSelected: false
  }
];

// Field formatters for provenance-specific data
export const provenanceFieldFormatters = {
  eventType: (value: string): ReactNode => {
    const colors = {
      manufactured: '#4caf50',
      received: '#2196f3',
      inspected: '#ff9800',
      stored: '#9c27b0',
      shipped: '#f44336',
      delivered: '#4caf50'
    };
    return (
      <Typography style={{ color: colors[value as keyof typeof colors] || '#000' }}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Typography>
    );
  },
  complianceStatus: (value: string): ReactNode => {
    const colors = {
      compliant: '#4caf50',
      'non-compliant': '#f44336',
      pending: '#ff9800'
    };
    return (
      <Typography style={{ color: colors[value as keyof typeof colors] || '#000' }}>
        {value}
      </Typography>
    );
  },
  'blockchainRef.transactionHash': (value: string): ReactNode => (
    <Link
      href={`https://example.com/explorer/tx/${value}`}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ 
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' }
      }}
    >
      {`${value.substring(0, 6)}...${value.substring(value.length - 4)}`}
    </Link>
  ),
  'blockchainRef.blockNumber': (value: number): ReactNode => (
    <Link
      href={`https://example.com/explorer/block/${value}`}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ 
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' }
      }}
    >
      {value}
    </Link>
  ),
  'data.documentRefs': (refs: string[]): ReactNode => (
    <Stack direction="row" spacing={1}>
      {refs.map((ref, index) => (
        <Chip
          key={index}
          label={ref}
          size="small"
          variant="outlined"
          onClick={() => window.open(`https://example.com/docs/${ref}`, '_blank')}
          sx={{ cursor: 'pointer' }}
        />
      ))}
    </Stack>
  ),
  'location.coordinates': (coords: { latitude: number; longitude: number }): ReactNode => (
    <Link
      href={`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ 
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' }
      }}
    >
      {`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`}
    </Link>
  ),
  'data.temperature': (value: number): ReactNode => (
    <Typography>{`${value.toFixed(1)}°C`}</Typography>
  ),
  'data.humidity': (value: number): ReactNode => (
    <Typography>{`${value.toFixed(1)}%`}</Typography>
  )
};
