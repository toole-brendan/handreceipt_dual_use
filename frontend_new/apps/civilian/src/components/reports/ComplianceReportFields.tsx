import { ReportField } from './ReportCustomization';
import { ReactNode } from 'react';
import { Typography } from '@mui/material';

export const COMPLIANCE_REPORT_FIELDS: ReportField[] = [
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
  
  // Compliance Status
  {
    id: 'ruleId',
    label: 'Rule ID',
    category: 'Compliance',
    defaultSelected: true
  },
  {
    id: 'ruleName',
    label: 'Rule Name',
    category: 'Compliance',
    defaultSelected: true
  },
  {
    id: 'ruleCategory',
    label: 'Rule Category',
    category: 'Compliance',
    defaultSelected: true
  },
  {
    id: 'severity',
    label: 'Severity',
    category: 'Compliance',
    defaultSelected: true
  },
  {
    id: 'status',
    label: 'Compliance Status',
    category: 'Compliance',
    defaultSelected: true
  },
  {
    id: 'details',
    label: 'Details',
    category: 'Compliance',
    defaultSelected: true
  },
  {
    id: 'timestamp',
    label: 'Timestamp',
    category: 'Compliance',
    defaultSelected: true
  },

  // Evidence
  {
    id: 'documentUrls',
    label: 'Documents',
    category: 'Evidence',
    defaultSelected: false
  },
  {
    id: 'signatures',
    label: 'Signatures',
    category: 'Evidence',
    defaultSelected: false
  },
  {
    id: 'sensorData',
    label: 'Sensor Data',
    category: 'Evidence',
    defaultSelected: false
  },

  // Blockchain Data
  {
    id: 'blockchainRef.transactionHash',
    label: 'Transaction Hash',
    category: 'Blockchain',
    defaultSelected: false
  },
  {
    id: 'blockchainRef.blockNumber',
    label: 'Block Number',
    category: 'Blockchain',
    defaultSelected: false
  },

  // Location
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
    defaultSelected: false
  },
  {
    id: 'location.coordinates',
    label: 'Coordinates',
    category: 'Location',
    defaultSelected: false
  },

  // Handler
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
  }
];

// Field formatters for compliance-specific data
export const complianceFieldFormatters = {
  status: (value: string): ReactNode => {
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
  severity: (value: string): ReactNode => {
    const colors = {
      critical: '#f44336',
      major: '#ff9800',
      minor: '#4caf50'
    };
    return (
      <Typography style={{ color: colors[value as keyof typeof colors] || '#000' }}>
        {value}
      </Typography>
    );
  },
  documentUrls: (urls: string[]): ReactNode => (
    <Typography>{urls.join(', ')}</Typography>
  ),
  signatures: (signatures: string[]): ReactNode => (
    <Typography>{signatures.join(', ')}</Typography>
  ),
  sensorData: (data: Record<string, any>): ReactNode => (
    <Typography>
      {Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')}
    </Typography>
  ),
  coordinates: (coords: { latitude: number; longitude: number }): ReactNode => (
    <Typography>{`${coords.latitude}, ${coords.longitude}`}</Typography>
  )
};
