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
  Typography,
  styled,
  alpha,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { TypeBadge, StatusBadge } from "../TransferBadges";
import type { Transfer } from '../../types';

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

// Mock data
const MOCK_TRANSFERS: Transfer[] = [
  {
    id: '1',
    itemName: 'M4A1 Carbine',
    serialNumber: 'W123456',
    type: 'outgoing',
    priority: 'high',
    category: 'weapons',
    status: 'needs_approval',
    dateRequested: '2024-01-28T10:00:00Z',
    dateNeeded: '2024-02-01T00:00:00Z',
    notes: 'Immediate transfer required for deployment',
    otherParty: {
      name: 'John Smith',
      rank: 'SGT',
      unit: '1st Battalion, 75th Ranger Regiment'
    },
    createdAt: '2024-01-28T10:00:00Z',
    updatedAt: '2024-01-28T10:00:00Z'
  },
  // ... (rest of the mock data remains the same)
];

interface TransfersTableProps {
  transfers?: Transfer[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewHistory?: (id: string) => void;
  onGenerateQR?: (id: string) => void;
}

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const TransfersTable: React.FC<TransfersTableProps> = ({ 
  transfers = MOCK_TRANSFERS,
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
              <StyledTableCell>ITEM DETAILS</StyledTableCell>
              <StyledTableCell>TYPE</StyledTableCell>
              <StyledTableCell>OTHER PARTY</StyledTableCell>
              <StyledTableCell>TIMELINE</StyledTableCell>
              <StyledTableCell>STATUS</StyledTableCell>
              <StyledTableCell align="right">ACTIONS</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers.map((transfer) => (
              <TableRow
                key={transfer.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <StyledTableCell>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {transfer.itemName}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)', 
                      fontSize: '0.75rem',
                      fontFamily: 'Inter, sans-serif' 
                    }}
                  >
                    {transfer.serialNumber}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <TypeBadge type={transfer.type} />
                </StyledTableCell>
                <StyledTableCell>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {transfer.otherParty.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)', 
                      fontSize: '0.75rem',
                      fontFamily: 'Inter, sans-serif' 
                    }}
                  >
                    {transfer.otherParty.rank} • {transfer.otherParty.unit}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Requested: {formatDate(transfer.dateRequested)}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)', 
                      fontSize: '0.75rem',
                      fontFamily: 'Inter, sans-serif' 
                    }}
                  >
                    Needed by: {formatDate(transfer.dateNeeded)}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <StatusBadge status={transfer.status} />
                </StyledTableCell>
                <StyledTableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="View History" arrow>
                    <ActionButton size="small" onClick={() => onViewHistory?.(transfer.id)}>
                      <HistoryIcon fontSize="small" />
                    </ActionButton>
                  </Tooltip>
                  <Tooltip title="Generate QR Code" arrow>
                    <ActionButton size="small" onClick={() => onGenerateQR?.(transfer.id)}>
                      <QrCodeIcon fontSize="small" />
                    </ActionButton>
                  </Tooltip>
                  <Tooltip title="Edit" arrow>
                    <ActionButton size="small" onClick={() => onEdit?.(transfer.id)}>
                      <EditIcon fontSize="small" />
                    </ActionButton>
                  </Tooltip>
                  <Tooltip title="Delete" arrow>
                    <ActionButton 
                      size="small" 
                      onClick={() => onDelete?.(transfer.id)}
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
