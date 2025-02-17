import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';

export interface ReportColumn {
  id: string;
  label: string;
  format?: (value: any) => React.ReactNode;
}

interface ReportTableProps {
  columns: ReportColumn[];
  data: any[];
  title?: string;
  subtitle?: string;
}

const ReportTable: React.FC<ReportTableProps> = ({
  columns,
  data,
  title,
  subtitle
}) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No data available for the selected criteria
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {(title || subtitle) && (
        <Box sx={{ p: 2 }}>
          {title && (
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align="left"
                  sx={{ fontWeight: 'bold' }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow hover key={index}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {column.format ? column.format(row[column.id]) : row[column.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ReportTable;
