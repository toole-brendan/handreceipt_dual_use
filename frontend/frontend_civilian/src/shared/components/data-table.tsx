import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableCellProps,
  Checkbox,
  Box,
  TableSortLabel,
} from '@mui/material';
import BulkActions, { BulkAction } from '@/components/common/BulkActions';

export interface Column<T = Record<string, any>> {
  id: string;
  label: string;
  minWidth?: number;
  align?: TableCellProps['align'];
  format?: (value: any, row?: T) => string | JSX.Element;
  sortable?: boolean;
}

type Order = 'asc' | 'desc';

export interface DataTableProps<T = Record<string, any>> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  getRowId?: (row: T) => string;
  bulkActions?: BulkAction[];
  selectable?: boolean;
}

export const DataTable = <T extends Record<string, any> = Record<string, any>>({
  columns,
  rows,
  loading = false,
  onRowClick,
  getRowId = (row: T) => row.id,
  bulkActions,
  selectable = true,
}: DataTableProps<T>): JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<Order>('asc');

  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const sortedRows = React.useMemo(() => {
    if (!orderBy) return rows;

    return [...rows].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = 
        typeof aValue === 'string'
          ? aValue.localeCompare(bValue)
          : aValue - bValue;

      return order === 'desc' ? -comparison : comparison;
    });
  }, [rows, orderBy, order]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelectedIds = rows.map(getRowId);
      setSelectedIds(newSelectedIds);
      return;
    }
    setSelectedIds([]);
  };

  const handleSelectOne = (id: string) => {
    const selectedIndex = selectedIds.indexOf(id);
    let newSelectedIds: string[] = [];

    if (selectedIndex === -1) {
      newSelectedIds = newSelectedIds.concat(selectedIds, id);
    } else if (selectedIndex === 0) {
      newSelectedIds = newSelectedIds.concat(selectedIds.slice(1));
    } else if (selectedIndex === selectedIds.length - 1) {
      newSelectedIds = newSelectedIds.concat(selectedIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelectedIds = newSelectedIds.concat(
        selectedIds.slice(0, selectedIndex),
        selectedIds.slice(selectedIndex + 1)
      );
    }

    setSelectedIds(newSelectedIds);
  };

  const handleRowClick = (event: React.MouseEvent, row: T) => {
    // If the click was on a checkbox or if there's no onRowClick handler, return
    if (
      (event.target as HTMLElement).closest('.MuiCheckbox-root') ||
      !onRowClick
    ) {
      return;
    }

    onRowClick(row);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="data table">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedIds.length > 0 && selectedIds.length < rows.length
                    }
                    checked={
                      rows.length > 0 && selectedIds.length === rows.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column: Column<T>) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows.map((row: T) => {
              const id = getRowId(row);
              const isSelected = selectedIds.indexOf(id) !== -1;

              return (
                <TableRow
                  hover
                  key={id}
                  onClick={(event) => handleRowClick(event, row)}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={-1}
                  selected={isSelected}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectOne(id)}
                        className="MuiCheckbox-root"
                      />
                    </TableCell>
                  )}
                  {columns.map((column: Column<T>) => {
                    const value = row[column.id];
                    return (
                      <TableCell 
                        key={`${id}-${column.id}`} 
                        align={column.align}
                      >
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {selectable && bulkActions && (
        <BulkActions
          selectedIds={selectedIds}
          actions={bulkActions}
          totalCount={rows.length}
        />
      )}
    </Box>
  );
};
