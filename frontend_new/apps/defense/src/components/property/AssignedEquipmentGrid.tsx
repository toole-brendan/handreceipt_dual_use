import React from 'react';
import {
  Box,
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Typography,
  Paper,
} from '@mui/material';
import { ViewModule as GridViewIcon, ViewList as TableViewIcon } from '@mui/icons-material';
import { StatusChip } from '@shared/components/common/mui/StatusChip';
import { mapPropertyStatusToChipStatus, getStatusLabel } from '../../utils/statusMapping';
import { Button } from '@shared/components/base/Button';
import { useProperty } from '../../hooks/useProperty';
import type { PropertyItem } from '../../types/property';

export const AssignedEquipmentGrid: React.FC = () => {
  const {
    equipmentList,
    view,
    toggleView,
    loadItemDetails,
  } = useProperty();

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: 'card' | 'table') => {
    if (newView !== null) {
      toggleView(newView);
    }
  };

  const handleItemClick = (itemId: string) => {
    loadItemDetails(itemId);
  };

  const renderCardView = () => (
    <Grid container spacing={2}>
      {equipmentList.map((item: PropertyItem) => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <Card sx={{ p: 2 }}>
            <Stack spacing={2}>
              {/* Image */}
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  borderRadius: 1,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  typography: 'body2',
                }}
              >
                {item.nomenclature}
              </Box>

              {/* Item Details */}
              <Stack spacing={1}>
                <Typography variant="h6">{item.nomenclature}</Typography>
                <Typography variant="body2" color="text.secondary">
                  NSN: {item.nsn}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Serial: {item.serialNumber}
                </Typography>
                <StatusChip 
                  status={mapPropertyStatusToChipStatus(item.status)} 
                  label={getStatusLabel(item.status)} 
                />
              </Stack>

              {/* Actions */}
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleItemClick(item.id)}
                >
                  View Details
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  Transfer
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderTableView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>NSN/Nomenclature</TableCell>
            <TableCell>Serial Number</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Inspection</TableCell>
            <TableCell>Next Due</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {equipmentList.map((item: PropertyItem) => (
            <TableRow key={item.id}>
              <TableCell>
                <Stack>
                  <Typography variant="body1">{item.nomenclature}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.nsn}</Typography>
                </Stack>
              </TableCell>
              <TableCell>{item.serialNumber}</TableCell>
              <TableCell>
                <StatusChip 
                  status={mapPropertyStatusToChipStatus(item.status)} 
                  label={getStatusLabel(item.status)} 
                />
              </TableCell>
              <TableCell>{item.lastInspection}</TableCell>
              <TableCell>{item.nextInspectionDue}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleItemClick(item.id)}
                  >
                    View
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                  >
                    Transfer
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Stack spacing={2}>
      {/* View Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode"
        >
          <ToggleButton value="card" aria-label="card view">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <TableViewIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Equipment List */}
      {view === 'card' ? renderCardView() : renderTableView()}
    </Stack>
  );
};
