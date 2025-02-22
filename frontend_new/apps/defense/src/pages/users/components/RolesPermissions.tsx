import { FC, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const AVAILABLE_PERMISSIONS = [
  'Manage Users',
  'Approve Transfers',
  'View Inventory',
  'Edit Inventory',
  'Generate Reports',
  'Access Sensitive Items',
  'Manage Roles',
  'View Audit Logs',
  'Manage Blockchain Records',
  'Approve Hand Receipts',
];

const INITIAL_ROLES: Role[] = [
  {
    id: '1',
    name: 'Commander',
    description: 'Full access to all features and approval authority',
    permissions: AVAILABLE_PERMISSIONS,
  },
  {
    id: '2',
    name: 'Logistics Officer',
    description: 'Manages property and supply operations',
    permissions: [
      'View Inventory',
      'Edit Inventory',
      'Generate Reports',
      'View Audit Logs',
      'Approve Hand Receipts',
    ],
  },
  {
    id: '3',
    name: 'Supply Sergeant',
    description: 'Handles day-to-day inventory management',
    permissions: [
      'View Inventory',
      'Edit Inventory',
      'Generate Reports',
      'View Audit Logs',
    ],
  },
  {
    id: '4',
    name: 'Soldier',
    description: 'Basic access for property accountability',
    permissions: ['View Inventory', 'View Audit Logs'],
  },
];

export const RolesPermissions: FC = () => {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setSelectedPermissions([...role.permissions]);
    setModalOpen(true);
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setSelectedPermissions([]);
    setModalOpen(true);
  };

  const handlePermissionChange = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSaveRole = () => {
    if (editingRole) {
      // Update existing role
      setRoles((prev) =>
        prev.map((role) =>
          role.id === editingRole.id
            ? { ...role, permissions: selectedPermissions }
            : role
        )
      );
    } else {
      // Create new role
      const newRole: Role = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'New Role', // TODO: Add name input field
        description: 'New role description', // TODO: Add description input field
        permissions: selectedPermissions,
      };
      setRoles((prev) => [...prev, newRole]);
    }
    setModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateRole}
          sx={{
            backgroundColor: '#4A5D23',
            '&:hover': { backgroundColor: '#3A4D13' },
          }}
        >
          Create New Role
        </Button>
      </Box>

      <Grid container spacing={3}>
        {roles.map((role) => (
          <Grid item xs={12} sm={6} md={4} key={role.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {role.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {role.description}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Permissions:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                  {role.permissions.map((permission) => (
                    <Typography
                      component="li"
                      variant="body2"
                      key={permission}
                      sx={{ mb: 0.5 }}
                    >
                      {permission}
                    </Typography>
                  ))}
                </Box>
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => handleEditRole(role)}
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    color: '#4A5D23',
                  }}
                >
                  Edit Permissions
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#4A5D23', color: 'white' }}>
          {editingRole ? 'Edit Role Permissions' : 'Create New Role'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Select Permissions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {AVAILABLE_PERMISSIONS.map((permission) => (
              <FormControlLabel
                key={permission}
                control={
                  <Checkbox
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => handlePermissionChange(permission)}
                  />
                }
                label={permission}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSaveRole}
            variant="contained"
            sx={{
              backgroundColor: '#4A5D23',
              '&:hover': { backgroundColor: '#3A4D13' },
            }}
          >
            {editingRole ? 'Save Changes' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 