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
} from '@mui/material';
import {
  Edit,
  Trash2,
  History,
  QrCode,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { Transfer } from '../../types';

interface TransfersTableProps {
  transfers: Transfer[];
  onApprove?: (transfer: Transfer) => void;
  onReject?: (transfer: Transfer) => void;
  onConfirm?: (transfer: Transfer) => void;
  onCancel?: (transfer: Transfer) => void;
  onViewDetails?: (transfer: Transfer) => void;
  onViewBlockchain?: (transfer: Transfer) => void;
  isHistory?: boolean;
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

export const TransfersTable: React.FC<TransfersTableProps> = ({
  transfers,
  onApprove,
  onReject,
  onConfirm,
  onCancel,
  onViewDetails,
  onViewBlockchain,
  isHistory,
}) => {
  return (
    <StyledTableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>Item</StyledTableCell>
            <StyledTableCell>From</StyledTableCell>
            <StyledTableCell>To</StyledTableCell>
            <StyledTableCell>Date</StyledTableCell>
            <StyledTableCell>Status</StyledTableCell>
            <StyledTableCell align="right">Actions</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transfers.map((transfer) => (
            <TableRow key={transfer.id}>
              <StyledTableCell>
                <Typography variant="body2">
                  {transfer.itemName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {transfer.serialNumber}
                </Typography>
              </StyledTableCell>
              <StyledTableCell>
                {`${transfer.otherParty.rank} ${transfer.otherParty.name}`}
              </StyledTableCell>
              <StyledTableCell>
                {`${transfer.otherParty.rank} ${transfer.otherParty.name}`}
              </StyledTableCell>
              <StyledTableCell>
                {new Date(transfer.dateRequested).toLocaleDateString()}
              </StyledTableCell>
              <StyledTableCell>
                {transfer.status}
              </StyledTableCell>
              <StyledTableCell align="right">
                {!isHistory && (
                  <>
                    {onApprove && (
                      <Tooltip title="Approve">
                        <ActionButton
                          size="small"
                          onClick={() => onApprove(transfer)}
                          color="success"
                        >
                          <CheckCircle size={18} />
                        </ActionButton>
                      </Tooltip>
                    )}
                    {onReject && (
                      <Tooltip title="Reject">
                        <ActionButton
                          size="small"
                          onClick={() => onReject(transfer)}
                          color="error"
                        >
                          <XCircle size={18} />
                        </ActionButton>
                      </Tooltip>
                    )}
                    {onConfirm && (
                      <Tooltip title="Confirm">
                        <ActionButton
                          size="small"
                          onClick={() => onConfirm(transfer)}
                          color="success"
                        >
                          <CheckCircle size={18} />
                        </ActionButton>
                      </Tooltip>
                    )}
                    {onCancel && (
                      <Tooltip title="Cancel">
                        <ActionButton
                          size="small"
                          onClick={() => onCancel(transfer)}
                          color="error"
                        >
                          <Trash2 size={18} />
                        </ActionButton>
                      </Tooltip>
                    )}
                  </>
                )}
                <Tooltip title="View Details">
                  <ActionButton
                    size="small"
                    onClick={() => onViewDetails?.(transfer)}
                  >
                    <Edit size={18} />
                  </ActionButton>
                </Tooltip>
                {transfer.blockchainTxId && (
                  <Tooltip title="View Blockchain Record">
                    <ActionButton
                      size="small"
                      onClick={() => onViewBlockchain?.(transfer)}
                    >
                      <History size={18} />
                    </ActionButton>
                  </Tooltip>
                )}
                <Tooltip title="Generate QR Code">
                  <ActionButton size="small">
                    <QrCode size={18} />
                  </ActionButton>
                </Tooltip>
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
}; 