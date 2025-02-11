import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  styled,
  alpha,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { PropertyItem } from './PropertyCard';
import { StatusChip } from '../../../components/common/mui/StatusChip';

interface PropertyListProps {
  items: PropertyItem[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewHistory?: (id: string) => void;
  onGenerateQR?: (id: string) => void;
}

const StyledTableContainer = styled(Paper)(() => ({
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 0,
  overflow: 'auto',
}));

const StyledTable = styled(Table)(() => ({
  backgroundColor: 'transparent',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#FFFFFF',
  padding: theme.spacing(2),
  '&.MuiTableCell-head': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontFamily: 'Inter, sans-serif',
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  borderRadius: 0,
  padding: theme.spacing(1),
  transition: theme.transitions.create(['background-color', 'transform', 'color'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-1px)',
  },
}));

const getStatusColor = (status: PropertyItem['status']): 'verified' | 'pending' | 'sensitive' | 'inactive' => {
  switch (status) {
    case 'serviceable':
      return 'verified';
    case 'unserviceable':
      return 'inactive';
    case 'damaged':
      return 'pending';
    case 'missing':
      return 'sensitive';
    default:
      return 'inactive';
  }
};

export const PropertyList: React.FC<PropertyListProps> = ({
  items,
  onEdit,
  onDelete,
  onViewHistory,
  onGenerateQR,
}) => {
  return (
    <StyledTableContainer elevation={0}>
      <TableContainer>
        <StyledTable>
          <TableHead>
            <TableRow>
              <StyledTableCell>Property Name/Description</StyledTableCell>
              <StyledTableCell>QR Code ID</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Type/Category</StyledTableCell>
              <StyledTableCell>Location</StyledTableCell>
              <StyledTableCell>Date Assigned</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <StyledTableCell>
                  {item.name}
                  <br />
                  <span style={{ 
                    color: 'rgba(255, 255, 255, 0.5)', 
                    fontSize: '0.75rem',
                    fontFamily: 'Inter, sans-serif' 
                  }}>
                    NSN: {item.nsn}
                  </span>
                </StyledTableCell>
                <StyledTableCell>{item.serialNumber}</StyledTableCell>
                <StyledTableCell>
                  <StatusChip
                    status={getStatusColor(item.status)}
                    label={item.status.toUpperCase()}
                    variant={item.status === 'missing' ? 'filled' : 'outlined'}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  {item.category}
                  {item.subCategory && ` / ${item.subCategory}`}
                </StyledTableCell>
                <StyledTableCell>
                  {item.assignedTo || 'Not Set'}
                </StyledTableCell>
                <StyledTableCell>
                  {item.lastInventory 
                    ? new Date(item.lastInventory).toLocaleDateString()
                    : 'Not Set'
                  }
                </StyledTableCell>
                <StyledTableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="View History" arrow>
                    <ActionButton size="small" onClick={() => onViewHistory?.(item.id)}>
                      <HistoryIcon fontSize="small" />
                    </ActionButton>
                  </Tooltip>
                  <Tooltip title="Generate QR Code" arrow>
                    <ActionButton size="small" onClick={() => onGenerateQR?.(item.id)}>
                      <QrCodeIcon fontSize="small" />
                    </ActionButton>
                  </Tooltip>
                  <Tooltip title="Edit" arrow>
                    <ActionButton size="small" onClick={() => onEdit?.(item.id)}>
                      <EditIcon fontSize="small" />
                    </ActionButton>
                  </Tooltip>
                  <Tooltip title="Delete" arrow>
                    <ActionButton 
                      size="small" 
                      onClick={() => onDelete?.(item.id)}
                      sx={{
                        '&:hover': {
                          backgroundColor: theme => alpha(theme.palette.error.main, 0.15),
                          color: theme => theme.palette.error.main,
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </ActionButton>
                  </Tooltip>
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </TableContainer>
    </StyledTableContainer>
  );
};
