import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import { SensitiveItem } from '@/types/property';

interface SensitiveItemsTableProps {
  items: SensitiveItem[];
  onItemClick?: (item: SensitiveItem) => void;
}

export const SensitiveItemsTable: React.FC<SensitiveItemsTableProps> = ({
  items,
  onItemClick
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Serial Number</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Verified</TableCell>
            <TableCell>Next Verification</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography align="center">No sensitive items found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow 
                key={item.id}
                onClick={() => onItemClick?.(item)}
                sx={{ cursor: onItemClick ? 'pointer' : 'default' }}
              >
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.serialNumber}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{item.verificationStatus}</TableCell>
                <TableCell>{item.verificationSchedule.lastVerification}</TableCell>
                <TableCell>{item.verificationSchedule.nextVerification}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SensitiveItemsTable;
