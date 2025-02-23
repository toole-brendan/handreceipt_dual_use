import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Checkbox,
  TablePagination,
  Menu,
  MenuItem,
  Button,
  Chip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Share as ShareIcon,
  Label as LabelIcon,
  LocalShipping as LocalShippingIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import type { Shipment } from '@shared/types/shipments';

interface ShipmentTableProps {
  shipments: Shipment[];
  loading: boolean;
  onDelete: (ids: string[]) => void;
  onEdit: (ids: string[]) => void;
  onExport: (ids: string[]) => void;
  onShare: (ids: string[]) => void;
  onArchive: (ids: string[]) => void;
  onTag: (ids: string[]) => void;
  onMarkDelivered: (ids: string[]) => void;
  onMarkDelayed: (ids: string[]) => void;
  onCancel: (ids: string[]) => void;
  onTrack: (ids: string[]) => void;
  onViewDetails: (shipment: Shipment) => void;
}

const ShipmentTable: React.FC<ShipmentTableProps> = ({
  shipments,
  loading,
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
  onViewDetails,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [actionShipment, setActionShipment] = useState<Shipment | null>(null);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(shipments.map((s) => s.id));
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, shipment: Shipment) => {
    setAnchorEl(event.currentTarget);
    setActionShipment(shipment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActionShipment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT':
        return 'info';
      case 'DELIVERED':
        return 'success';
      case 'DELAYED':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  return (
    <Box>
      {selected.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(selected)}
            sx={{ mr: 1 }}
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => onExport(selected)}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArchiveIcon />}
            onClick={() => onArchive(selected)}
            sx={{ mr: 1 }}
          >
            Archive
          </Button>
          <Button
            variant="outlined"
            startIcon={<LabelIcon />}
            onClick={() => onTag(selected)}
          >
            Tag
          </Button>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < shipments.length}
                  checked={shipments.length > 0 && selected.length === shipments.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>Shipment ID</TableCell>
              <TableCell>Order Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Customer/Supplier</TableCell>
              <TableCell>Shipment Date</TableCell>
              <TableCell>Expected Delivery</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Blockchain Status</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shipments
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((shipment) => {
                const isItemSelected = isSelected(shipment.id);

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={shipment.id}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => handleClick(shipment.id)}
                      />
                    </TableCell>
                    <TableCell>{shipment.id}</TableCell>
                    <TableCell>{shipment.orderId}</TableCell>
                    <TableCell>{shipment.type}</TableCell>
                    <TableCell>
                      {shipment.type === 'OUTBOUND'
                        ? shipment.customer.name
                        : shipment.supplier.name}
                    </TableCell>
                    <TableCell>
                      {new Date(shipment.shipmentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(shipment.expectedDeliveryDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={shipment.status.replace('_', ' ')}
                        color={getStatusColor(shipment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={shipment.blockchain.status}
                        color={shipment.blockchain.status === 'VERIFIED' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={shipment.payment.status.replace('_', ' ')}
                        color={
                          shipment.payment.status === 'PAYMENT_RELEASED'
                            ? 'success'
                            : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => onViewDetails(shipment)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuOpen(event, shipment)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={shipments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            if (actionShipment) onEdit([actionShipment.id]);
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            if (actionShipment) onShare([actionShipment.id]);
          }}
        >
          <ShareIcon fontSize="small" sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            if (actionShipment) onMarkDelivered([actionShipment.id]);
          }}
        >
          <LocalShippingIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Delivered
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            if (actionShipment) onMarkDelayed([actionShipment.id]);
          }}
        >
          <WarningIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Delayed
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            if (actionShipment) onCancel([actionShipment.id]);
          }}
        >
          <CancelIcon fontSize="small" sx={{ mr: 1 }} />
          Cancel Shipment
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            if (actionShipment) onTrack([actionShipment.id]);
          }}
        >
          <LocalShippingIcon fontSize="small" sx={{ mr: 1 }} />
          Track Shipment
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ShipmentTable;
