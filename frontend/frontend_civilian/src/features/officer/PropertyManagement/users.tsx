import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';

interface User {
  id: string;
  name: string;
  role: string;
  unit: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // TODO: Implement actual user fetching
    setLoading(false);
    setUsers([
      {
        id: '1',
        name: 'John Doe',
        role: 'Property Manager',
        unit: 'Alpha Company',
        lastActive: '2024-02-09',
        status: 'active'
      }
    ]);
  }, []);

  const handleEdit = (userId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit user:', userId);
  };

  const handleDelete = (userId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete user:', userId);
  };

  const handleAddUser = () => {
    // TODO: Implement add user functionality
    console.log('Add new user');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Last Active</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.unit}</TableCell>
                <TableCell>{user.lastActive}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: user.status === 'active' ? 'success.light' : 'error.light',
                      color: user.status === 'active' ? 'success.dark' : 'error.dark',
                    }}
                  >
                    {user.status}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit user">
                    <IconButton onClick={() => handleEdit(user.id)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete user">
                    <IconButton onClick={() => handleDelete(user.id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserManagement;
