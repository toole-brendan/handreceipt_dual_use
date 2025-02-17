import React from 'react';
import '../../../../styles/components/personnel/equipment-table.css';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Equipment } from '../../types';

interface EquipmentTableProps {
  equipment: Equipment[];
  onSelect?: (equipment: Equipment) => void;
}

export const EquipmentTable: React.FC<EquipmentTableProps> = ({ equipment, onSelect }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Serial Number</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Condition</TableCell>
            <TableCell>Assigned Date</TableCell>
            <TableCell>Last Verified</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {equipment.map((item) => (
            <TableRow 
              key={item.id}
              onClick={() => onSelect?.(item)}
              sx={{ cursor: onSelect ? 'pointer' : 'default' }}
              hover={!!onSelect}
            >
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.serialNumber}</TableCell>
              <TableCell>
                <span className={`status-badge status-${item.status}`}>
                  {item.status}
                </span>
              </TableCell>
              <TableCell>
                <span className={`condition-badge condition-${item.condition}`}>
                  {item.condition}
                </span>
              </TableCell>
              <TableCell>{new Date(item.assignedDate).toLocaleDateString()}</TableCell>
              <TableCell>
                {item.lastVerified 
                  ? new Date(item.lastVerified).toLocaleDateString()
                  : 'Not verified'
                }
              </TableCell>
            </TableRow>
          ))}
          {equipment.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No equipment assigned
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
