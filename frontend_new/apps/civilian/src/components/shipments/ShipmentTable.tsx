import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Chip } from '@mui/material';
import { DataTable } from '@/shared/components/data-table';
import BlockchainBadge from '@/components/common/BlockchainBadge';
import { formatDate } from '@/utils/dateUtils';
import type { PharmaceuticalShipment } from '@/mocks/api/pharmaceuticals-shipments.mock';
import type { BulkAction } from '@/components/common/BulkActions';
import {
  Archive,
  CheckCircle,
  Download,
  Edit,
  Share2,
  Tag,
  Trash2,
  XCircle,
  AlertTriangle,
  Truck,
} from 'lucide-react';

const getStatusColor = (status: PharmaceuticalShipment['status']) => {
  switch (status) {
    case 'Delivered':
      return 'success';
    case 'In Transit':
      return 'info';
    case 'Preparing':
      return 'warning';
    case 'Delayed':
      return 'error';
    case 'Cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority: PharmaceuticalShipment['priority']) => {
  switch (priority) {
    case 'Critical':
      return 'error';
    case 'Express':
      return 'warning';
    case 'Standard':
      return 'info';
    default:
      return 'default';
  }
};

interface ShipmentTableProps {
  shipments: PharmaceuticalShipment[];
  loading?: boolean;
  onDelete?: (ids: string[]) => void;
  onEdit?: (ids: string[]) => void;
  onExport?: (ids: string[]) => void;
  onShare?: (ids: string[]) => void;
  onArchive?: (ids: string[]) => void;
  onTag?: (ids: string[]) => void;
  onMarkDelivered?: (ids: string[]) => void;
  onMarkDelayed?: (ids: string[]) => void;
  onCancel?: (ids: string[]) => void;
  onTrack?: (ids: string[]) => void;
}

const ShipmentTable: React.FC<ShipmentTableProps> = ({
  shipments,
  loading = false,
  onDelete,
  onEdit,
  onExport,
  onShare,
  onArchive,
  onTag,
  onMarkDelivered,
  onMarkDelayed,
  onCancel,
  onTrack,
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      id: 'referenceNumber',
      label: 'Reference',
      minWidth: 120,
    },
    {
      id: 'type',
      label: 'Type',
      minWidth: 120,
    },
    {
      id: 'priority',
      label: 'Priority',
      minWidth: 100,
      format: (value: PharmaceuticalShipment['priority']) => (
        <Chip
          label={value}
          size="small"
          color={getPriorityColor(value)}
          sx={{ minWidth: 85 }}
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: PharmaceuticalShipment['status']) => (
        <Chip
          label={value}
          size="small"
          color={getStatusColor(value)}
          sx={{ minWidth: 85 }}
        />
      ),
    },
    {
      id: 'carrier',
      label: 'Carrier',
      minWidth: 150,
      format: (value: PharmaceuticalShipment['carrier']) => value.name,
    },
    {
      id: 'expectedDeparture',
      label: 'Departure',
      minWidth: 120,
      format: (value: string) => formatDate(value),
    },
    {
      id: 'expectedArrival',
      label: 'Arrival',
      minWidth: 120,
      format: (value: string) => formatDate(value),
    },
    {
      id: 'temperature',
      label: 'Temperature Range',
      minWidth: 150,
      format: (value: PharmaceuticalShipment['temperature']) => 
        `${value.min}°${value.unit} - ${value.max}°${value.unit}`,
    },
    {
      id: 'blockchainData',
      label: 'Blockchain',
      minWidth: 100,
      format: (value: PharmaceuticalShipment['blockchainData']) => (
        <BlockchainBadge
          status={value.verified ? 'verified' : 'pending'}
          showTooltip
        />
      ),
    },
  ];

  const bulkActions: BulkAction[] = [
    onDelete && {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={18} />,
      onClick: onDelete,
      color: 'error',
      requiresConfirmation: true,
      tooltip: 'Delete selected shipments',
    },
    onEdit && {
      id: 'edit',
      label: 'Edit',
      icon: <Edit size={18} />,
      onClick: onEdit,
      tooltip: 'Edit selected shipments',
    },
    onExport && {
      id: 'export',
      label: 'Export',
      icon: <Download size={18} />,
      onClick: onExport,
      tooltip: 'Export selected shipments',
    },
    onShare && {
      id: 'share',
      label: 'Share',
      icon: <Share2 size={18} />,
      onClick: onShare,
      tooltip: 'Share selected shipments',
    },
    onArchive && {
      id: 'archive',
      label: 'Archive',
      icon: <Archive size={18} />,
      onClick: onArchive,
      divider: true,
      tooltip: 'Archive selected shipments',
    },
    onTag && {
      id: 'tag',
      label: 'Add Tags',
      icon: <Tag size={18} />,
      onClick: onTag,
      tooltip: 'Add tags to selected shipments',
    },
    onMarkDelivered && {
      id: 'delivered',
      label: 'Mark Delivered',
      icon: <CheckCircle size={18} />,
      onClick: onMarkDelivered,
      color: 'success',
      tooltip: 'Mark selected shipments as delivered',
    },
    onMarkDelayed && {
      id: 'delayed',
      label: 'Mark Delayed',
      icon: <AlertTriangle size={18} />,
      onClick: onMarkDelayed,
      color: 'warning',
      tooltip: 'Mark selected shipments as delayed',
    },
    onCancel && {
      id: 'cancel',
      label: 'Cancel',
      icon: <XCircle size={18} />,
      onClick: onCancel,
      color: 'error',
      tooltip: 'Cancel selected shipments',
    },
    onTrack && {
      id: 'track',
      label: 'Track',
      icon: <Truck size={18} />,
      onClick: onTrack,
      color: 'info',
      tooltip: 'Track selected shipments',
    },
  ].filter(Boolean) as BulkAction[];

  const handleRowClick = (row: Record<string, any>) => {
    navigate(`/shipments/${row.id}`);
  };

  return (
    <DataTable
      columns={columns}
      rows={shipments}
      loading={loading}
      onRowClick={handleRowClick}
      getRowId={(row) => row.id}
      bulkActions={bulkActions}
      selectable={bulkActions.length > 0}
    />
  );
};

export default ShipmentTable;
