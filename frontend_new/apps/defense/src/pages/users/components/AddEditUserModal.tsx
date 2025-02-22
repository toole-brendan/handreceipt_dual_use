import { FC, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';

interface User {
  id: string;
  name: string;
  rank: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Pending';
  lastActive: string;
  email: string;
}

interface AddEditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const RANKS = ['LT', 'CPT', 'MAJ', 'SGT', 'SSG', 'SFC', 'MSG', 'PVT', 'SPC'];
const ROLES = ['Commander', 'Logistics Officer', 'Supply Sergeant', 'Soldier'];
const STATUSES = ['Active', 'Inactive', 'Pending'];

export const AddEditUserModal: FC<AddEditUserModalProps> = ({
  open,
  onClose,
  user
}) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    rank: '',
    role: '',
    email: '',
    status: 'Active',
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        rank: user.rank,
        role: user.role,
        email: user.email,
        status: user.status,
      });
    } else {
      setFormData({
        name: '',
        rank: '',
        role: '',
        email: '',
        status: 'Active',
      });
      // Generate random password for new users
      const randomPassword = Math.random().toString(36).slice(-8);
      setGeneratedPassword(randomPassword);
    }
  }, [user]);

  const handleChange = (field: keyof User) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Clear error when field is edited
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    if (!formData.rank) {
      newErrors.rank = 'Rank is required';
    }
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // TODO: Implement user creation/update with blockchain
      console.log('Saving user:', {
        ...formData,
        ...(user ? {} : { password: generatedPassword }),
      });
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#4A5D23', color: 'white' }}>
        {user ? 'Edit User' : 'Add New User'}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={handleChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
          />

          <TextField
            select
            label="Rank"
            value={formData.rank}
            onChange={handleChange('rank')}
            error={!!errors.rank}
            helperText={errors.rank}
            fullWidth
          >
            {RANKS.map((rank) => (
              <MenuItem key={rank} value={rank}>
                {rank}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Role"
            value={formData.role}
            onChange={handleChange('role')}
            error={!!errors.role}
            helperText={errors.role}
            fullWidth
          >
            {ROLES.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Email"
            value={formData.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
          />

          {!user && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Generated Password
              </Typography>
              <TextField
                value={generatedPassword}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleCopyPassword}
                        edge="end"
                        size="small"
                      >
                        <CopyIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
                size="small"
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Please copy and securely share this password with the user
              </Typography>
            </Box>
          )}

          {user && (
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={handleChange('status')}
              fullWidth
            >
              {STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: '#4A5D23',
            '&:hover': { backgroundColor: '#3A4D13' },
          }}
        >
          {user ? 'Save Changes' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 