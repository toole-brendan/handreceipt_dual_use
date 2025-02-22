import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataTable, Column } from '@/shared/components/data-table';
import { PharmaceuticalProduct } from '@/mocks/api/pharmaceuticals-products.mock';
import { colors } from '@/styles/theme/colors';
import BlockchainBadge from '@/components/common/BlockchainBadge';
import { BulkAction as BaseBulkAction } from '@/components/common/BulkActions';

interface BulkAction extends Omit<BaseBulkAction, 'id'> {
  id?: string; // Make id optional since we'll generate it
}

interface ProductTableProps {
  products: PharmaceuticalProduct[];
  loading?: boolean;
  onRowClick?: (product: PharmaceuticalProduct) => void;
  bulkActions?: BulkAction[];
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  onRowClick,
  bulkActions,
  selectable = true,
  onSelectionChange
}) => {
  const getStatusColor = (status: PharmaceuticalProduct['status']) => {
    switch (status) {
      case 'In Stock':
        return colors.success;
      case 'Low Stock':
        return colors.warning;
      case 'Quarantined':
      case 'Rejected':
      case 'Recalled':
        return colors.error;
      case 'Expired':
        return colors.error;
      default:
        return colors.info;
    }
  };

  const columns: Column[] = [
    {
      id: 'name',
      label: 'Product Name',
      minWidth: 200,
      sortable: true,
      format: (value: any, row?: Record<string, any>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {value}
          </Typography>
          {(row as PharmaceuticalProduct)?.blockchainData.verified && (
            <BlockchainBadge
              size="small"
              transactionHash={(row as PharmaceuticalProduct).blockchainData.transactionHash}
              timestamp={(row as PharmaceuticalProduct).blockchainData.timestamp}
            />
          )}
        </Box>
      )
    },
    {
      id: 'sku',
      label: 'SKU',
      minWidth: 120,
      sortable: true,
    },
    {
      id: 'category',
      label: 'Category',
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'quantity',
      label: 'Quantity',
      minWidth: 100,
      align: 'right',
      sortable: true,
      format: (value: any, row?: Record<string, any>) => (
        <Typography variant="body2">
          {value.toLocaleString()} {(row as PharmaceuticalProduct)?.unitOfMeasure}
        </Typography>
      )
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      sortable: true,
      format: (value: any) => (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            bgcolor: alpha(getStatusColor(value as PharmaceuticalProduct['status']), 0.1),
            color: getStatusColor(value as PharmaceuticalProduct['status'])
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {value}
          </Typography>
        </Box>
      )
    },
    {
      id: 'location',
      label: 'Location',
      minWidth: 200,
      sortable: true,
    }
  ];

  const formattedBulkActions = bulkActions?.map((action, index) => ({
    ...action,
    id: action.id || `bulk-action-${index}`
  }));

  const handleRowClick = (row: Record<string, any>) => {
    if (onRowClick) {
      onRowClick(row as PharmaceuticalProduct);
    }
  };

  return (
    <DataTable
      columns={columns}
      rows={products}
      loading={loading}
      onRowClick={handleRowClick}
      getRowId={(row) => row.id}
      bulkActions={formattedBulkActions}
      selectable={selectable}
    />
  );
};

export default ProductTable;
