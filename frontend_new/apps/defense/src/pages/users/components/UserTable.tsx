import { FC, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Button,
  Typography,
  Tooltip,
  TablePagination,
} from '@mui/material';
import {
  Edit as EditIcon,
  PowerSettingsNew as PowerIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { AddEditUserModal } from './AddEditUserModal';

const darkTheme = {
  background: '#1a1a1a',
  paper: '#2a2a2a',
  paperDark: '#333333',
  text: {
    primary: '#ffffff',
    secondary: '#999999',
  },
  accent: '#00ff00',
  error: '#ff4444',
  border: '#404040',
  success: '#00cc00',
  hover: 'rgba(255, 255, 255, 0.1)',
};

interface User {
  id: string;
  name: string;
  rank: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Pending';
  lastActive: string;
  email: string;
}

interface UserTableProps {
  searchQuery: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'LT Smith',
    rank: 'LT',
    role: 'Logistics Officer',
    status: 'Active',
    lastActive: '10/02/2024',
    email: 'smith@fco.mil',
  },
  {
    id: '2',
    name: 'SGT Jones',
    rank: 'SGT',
    role: 'Soldier',
    status: 'Active',
    lastActive: '10/01/2024',
    email: 'jones@fco.mil',
  },
];

export const UserTable: FC<UserTableProps> = ({ searchQuery }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(mockUsers.map(user => user.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id: string) => {
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
        selected.slice(selectedIndex + 1),
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

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDeactivate = (userId: string) => {
    // TODO: Implement user deactivation with blockchain
    console.log('Deactivating user:', userId);
  };

  const handleDeactivateSelected = () => {
    // TODO: Implement bulk deactivation with blockchain
    console.log('Deactivating selected users:', selected);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'Active':
        return darkTheme.accent;
      case 'Inactive':
        return darkTheme.error;
      case 'Pending':
        return '#FFA500';
      default:
        return darkTheme.text.secondary;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          {selected.length > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={handleDeactivateSelected}
              sx={{
                mr: 2,
                backgroundColor: darkTheme.error,
                '&:hover': {
                  backgroundColor: '#ff6666',
                },
              }}
            >
              Deactivate Selected ({selected.length})
            </Button>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
          sx={{
            backgroundColor: darkTheme.accent,
            color: '#000000',
            '&:hover': {
              backgroundColor: darkTheme.success,
            },
          }}
        >
          Add New User
        </Button>
      </Box>

      <TableContainer 
        component={Paper}
        sx={{
          backgroundColor: darkTheme.paper,
          borderRadius: 2,
          '& .MuiTableCell-root': {
            borderColor: darkTheme.border,
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < mockUsers.length}
                  checked={selected.length === mockUsers.length}
                  onChange={handleSelectAll}
                  sx={{
                    color: darkTheme.text.secondary,
                    '&.Mui-checked': {
                      color: darkTheme.accent,
                    },
                  }}
                />
              </TableCell>
              <TableCell sx={{ color: darkTheme.text.primary }}>Name</TableCell>
              <TableCell sx={{ color: darkTheme.text.primary }}>Rank</TableCell>
              <TableCell sx={{ color: darkTheme.text.primary }}>Role</TableCell>
              <TableCell sx={{ color: darkTheme.text.primary }}>Status</TableCell>
              <TableCell sx={{ color: darkTheme.text.primary }}>Last Active</TableCell>
              <TableCell sx={{ color: darkTheme.text.primary }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockUsers
              .filter(user => 
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.rank.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.role.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  selected={selected.indexOf(user.id) !== -1}
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: darkTheme.paperDark },
                    '&.Mui-selected': {
                      backgroundColor: `${darkTheme.accent}22`,
                    },
                    '&.Mui-selected:hover': {
                      backgroundColor: `${darkTheme.accent}33`,
                    },
                    '&:hover': {
                      backgroundColor: darkTheme.hover,
                    },
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.indexOf(user.id) !== -1}
                      onChange={() => handleSelect(user.id)}
                      sx={{
                        color: darkTheme.text.secondary,
                        '&.Mui-checked': {
                          color: darkTheme.accent,
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={`Email: ${user.email}`}>
                      <Typography sx={{ color: darkTheme.text.primary }}>
                        {user.name}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ color: darkTheme.text.primary }}>{user.rank}</TableCell>
                  <TableCell sx={{ color: darkTheme.text.primary }}>{user.role}</TableCell>
                  <TableCell>
                    <Typography sx={{ color: getStatusColor(user.status) }}>
                      {user.status}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: darkTheme.text.primary }}>{user.lastActive}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(user)}
                      sx={{ 
                        color: darkTheme.accent,
                        '&:hover': {
                          backgroundColor: `${darkTheme.accent}22`,
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeactivate(user.id)}
                      sx={{ 
                        color: darkTheme.error,
                        '&:hover': {
                          backgroundColor: `${darkTheme.error}22`,
                        },
                      }}
                    >
                      <PowerIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={mockUsers.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        sx={{
          color: darkTheme.text.primary,
          '& .MuiSelect-icon': { color: darkTheme.text.primary },
          '& .MuiTablePagination-select': { color: darkTheme.text.primary },
          '& .MuiTablePagination-selectLabel': { color: darkTheme.text.secondary },
          '& .MuiTablePagination-displayedRows': { color: darkTheme.text.secondary },
        }}
      />

      <AddEditUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={editingUser}
      />
    </Box>
  );
}; 