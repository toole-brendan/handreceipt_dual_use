import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableCellProps
} from '@mui/material';

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: TableCellProps['align'];
  format?: (value: any) => string;
}

export interface DataTableProps {
  columns: Column[];
  rows: Record<string, any>[];
  loading?: boolean;
  onRowClick?: (row: Record<string, any>) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  loading = false,
  onRowClick
}) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <TableContainer component={Paper}>
      <Table stickyHeader aria-label="data table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{ minWidth: column.minWidth }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              hover
              key={index}
              onClick={() => onRowClick?.(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column) => {
                const value = row[column.id];
                return (
                  <TableCell key={column.id} align={column.align}>
                    {column.format ? column.format(value) : value}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
