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
  Box,
  Chip,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import { Edit, Block, CheckCircle } from '@mui/icons-material';
import { CivilianUser, UserRole, UserStatus } from '../../types/users';
import { getRoleName } from '../../constants/roles';

interface BaseColumn {
  id: keyof CivilianUser | 'actions';
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
}

interface DataColumn extends BaseColumn {
  id: keyof CivilianUser;
  format?: (value: any) => React.ReactNode;
  sortable?: boolean;
}

interface ActionColumn extends BaseColumn {
  id: 'actions';
  sortable?: never;
  format?: never;
}

type Column = DataColumn | ActionColumn;

const isDataColumn = (column: Column): column is DataColumn => {
  return column.id !== 'actions';
};

const columns: Column[] = [
  { 
    id: 'username', 
    label: 'Username', 
    minWidth: 130,
    sortable: true 
  },
  { 
    id: 'email', 
    label: 'Email', 
    minWidth: 170,
    sortable: true 
  },
  { 
    id: 'fullName', 
    label: 'Full Name', 
    minWidth: 170,
    sortable: true 
  },
  { 
    id: 'role', 
    label: 'Role', 
    minWidth: 130,
    format: (value: UserRole) => getRoleName(value),
    sortable: true 
  },
  { 
    id: 'status', 
    label: 'Status', 
    minWidth: 100,
    align: 'center',
    format: (value: UserStatus) => (
      <Chip
        label={value.charAt(0) + value.slice(1).toLowerCase()}
        color={
          value === 'ACTIVE' ? 'success' :
          value === 'PENDING' ? 'warning' :
          'error'
        }
        size="small"
      />
    ),
    sortable: true
  },
  { 
    id: 'blockchainCredentials', 
    label: 'Blockchain ID', 
    minWidth: 130,
    format: (value: any) => value?.publicKey ? (
      <Tooltip title={value.publicKey}>
        <span>{value.publicKey.substring(0, 6)}...{value.publicKey.substring(value.publicKey.length - 4)}</span>
      </Tooltip>
    ) : '-'
  },
  { 
    id: 'lastLogin', 
    label: 'Last Login', 
    minWidth: 130,
    format: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    sortable: true
  },
  { 
    id: 'actions', 
    label: 'Actions', 
    minWidth: 100,
    align: 'right' 
  },
];

interface UserTableProps {
  users: CivilianUser[];
  onEdit: (user: CivilianUser) => void;
  onStatusChange: (userId: string, newStatus: UserStatus) => void;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  sortBy?: keyof CivilianUser;
  sortDirection?: 'asc' | 'desc';
  onSort?: (property: keyof CivilianUser) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onStatusChange,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  sortBy,
  sortDirection,
  onSort,
}) => {
  const handlePageChange = (_: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
    onPageChange(0);
  };

  const createSortHandler = (property: keyof CivilianUser) => () => {
    onSort?.(property);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {isDataColumn(column) && column.sortable && onSort ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={createSortHandler(column.id as keyof CivilianUser)}
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
            {users.map((user) => (
              <TableRow hover key={user.id}>
                {columns.map((column) => {
                  if (column.id === 'actions') {
                    return (
                      <TableCell key={column.id} align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="Edit user">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(user)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.status === 'ACTIVE' ? 'Deactivate user' : 'Activate user'}>
                            <IconButton
                              size="small"
                              color={user.status === 'ACTIVE' ? 'error' : 'success'}
                              onClick={() => onStatusChange(
                                user.id,
                                user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                              )}
                            >
                              {user.status === 'ACTIVE' ? <Block /> : <CheckCircle />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    );
                  }
  if (isDataColumn(column)) {
    const value = user[column.id];
    return (
      <TableCell key={column.id} align={column.align}>
        {column.format ? column.format(value) : (
          typeof value === 'object' ? JSON.stringify(value) : value
        )}
      </TableCell>
    );
  }
  return null;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Paper>
  );
};
