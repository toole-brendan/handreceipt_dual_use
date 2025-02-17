import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormHelperText,
  Alert,
} from '@mui/material';
import { CivilianUser, UserRole, UserStatus, UserCreateData, UserUpdateData } from '../../types/users';
import { USER_ROLES, requiresBlockchain } from '../../constants/roles';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserCreateData | (UserUpdateData & { id: string })) => void;
  user?: CivilianUser;
  mode: 'create' | 'edit';
  error?: string | null;
}

export const UserForm: React.FC<UserFormProps> = ({
  open,
  onClose,
  onSubmit,
  user,
  mode,
  error,
}) => {
  const [formData, setFormData] = React.useState<Partial<UserCreateData & { id?: string }>>(() => {
    if (mode === 'edit' && user) {
      const { id, createdAt, updatedAt, lastLogin, ...rest } = user;
      return rest;
    }
    return {
      username: '',
      email: '',
      fullName: '',
      company: '',
      department: '',
      role: 'VIEWER',
      status: 'PENDING',
      permissions: [],
      preferences: {
        theme: 'system',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: 'MM/DD/YYYY',
        notifications: {
          email: true,
          push: true,
          transferRequests: true,
          securityAlerts: true,
          systemUpdates: true,
          assetChanges: true,
        },
      },
    };
  });

  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  const handleChange = (field: keyof UserCreateData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear blockchain credentials if role doesn't require them
      if (field === 'role' && !requiresBlockchain(value as UserRole)) {
        delete newData.blockchainCredentials;
      }
      
      return newData;
    });
    
    // Clear validation error when field is changed
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username?.trim()) {
      errors.username = 'Username is required';
    }
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!formData.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!formData.company?.trim()) {
      errors.company = 'Company is required';
    }
    if (!formData.department?.trim()) {
      errors.department = 'Department is required';
    }
    if (requiresBlockchain(formData.role as UserRole) && !formData.blockchainCredentials?.publicKey) {
      errors.blockchainCredentials = 'Blockchain ID is required for this role';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (mode === 'edit' && user) {
      onSubmit({
        id: user.id,
        ...formData,
      });
    } else {
      // For create operation, add a temporary password
      // In a real app, you might want to generate this or have the user set it
      onSubmit({
        ...formData,
        password: 'TemporaryPassword123!', // This would be handled differently in production
      } as UserCreateData);
    }
  };

  const showBlockchainField = formData.role && requiresBlockchain(formData.role as UserRole);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'create' ? 'Add New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Username"
              value={formData.username || ''}
              onChange={(e) => handleChange('username', e.target.value)}
              error={!!validationErrors.username}
              helperText={validationErrors.username}
              disabled={mode === 'edit'}
              fullWidth
              required
            />

            <TextField
              label="Email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              fullWidth
              required
            />

            <TextField
              label="Full Name"
              value={formData.fullName || ''}
              onChange={(e) => handleChange('fullName', e.target.value)}
              error={!!validationErrors.fullName}
              helperText={validationErrors.fullName}
              fullWidth
              required
            />

            <TextField
              label="Company"
              value={formData.company || ''}
              onChange={(e) => handleChange('company', e.target.value)}
              error={!!validationErrors.company}
              helperText={validationErrors.company}
              fullWidth
              required
            />

            <TextField
              label="Department"
              value={formData.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
              error={!!validationErrors.department}
              helperText={validationErrors.department}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role || ''}
                onChange={(e) => handleChange('role', e.target.value)}
                label="Role"
              >
                {Object.entries(USER_ROLES).map(([role, label]) => (
                  <MenuItem key={role} value={role}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {mode === 'edit' && (
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || ''}
                  onChange={(e) => handleChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                </Select>
              </FormControl>
            )}

            {showBlockchainField && (
              <Box>
                <TextField
                  label="Blockchain ID"
                  value={formData.blockchainCredentials?.publicKey || ''}
                  onChange={(e) => handleChange('blockchainCredentials', {
                    publicKey: e.target.value,
                    lastTransaction: null,
                    transactionCount: 0
                  })}
                  error={!!validationErrors.blockchainCredentials}
                  helperText={validationErrors.blockchainCredentials}
                  fullWidth
                  required
                />
                <FormHelperText>
                  Required for blockchain-enabled roles. Enter the user's public key.
                </FormHelperText>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {mode === 'create' ? 'Create User' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
