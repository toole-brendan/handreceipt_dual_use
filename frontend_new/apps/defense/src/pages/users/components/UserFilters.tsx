import { FC, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
} from '@mui/material';

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

const ROLES = ['All', 'Commander', 'Logistics Officer', 'Supply Sergeant', 'Soldier'];
const STATUSES = ['All', 'Active', 'Inactive', 'Pending'];
const RANKS = ['All', 'LT', 'CPT', 'MAJ', 'SGT', 'SSG', 'SFC', 'MSG', 'PVT', 'SPC'];

export const UserFilters: FC = () => {
  const [filters, setFilters] = useState({
    role: 'All',
    status: 'All',
    rank: 'All',
  });

  const handleFilterChange = (field: string) => (event: SelectChangeEvent) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
  };

  const handleApplyFilters = () => {
    // TODO: Implement filter application
    console.log('Applying filters:', filters);
  };

  const handleResetFilters = () => {
    setFilters({
      role: 'All',
      status: 'All',
      rank: 'All',
    });
  };

  const selectStyles = {
    color: darkTheme.text.primary,
    '.MuiOutlinedInput-notchedOutline': {
      borderColor: darkTheme.border,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: darkTheme.accent,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: darkTheme.accent,
    },
    '.MuiSvgIcon-root': {
      color: darkTheme.text.primary,
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        p: 2,
        backgroundColor: darkTheme.paperDark,
        borderRadius: 2,
      }}
    >
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel sx={{ color: darkTheme.text.secondary }}>Role</InputLabel>
        <Select
          value={filters.role}
          label="Role"
          onChange={handleFilterChange('role')}
          size="small"
          sx={selectStyles}
        >
          {ROLES.map((role) => (
            <MenuItem 
              key={role} 
              value={role}
              sx={{
                color: darkTheme.text.primary,
                '&:hover': {
                  backgroundColor: darkTheme.hover,
                },
                '&.Mui-selected': {
                  backgroundColor: `${darkTheme.accent}22`,
                  '&:hover': {
                    backgroundColor: `${darkTheme.accent}33`,
                  },
                },
              }}
            >
              {role}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel sx={{ color: darkTheme.text.secondary }}>Status</InputLabel>
        <Select
          value={filters.status}
          label="Status"
          onChange={handleFilterChange('status')}
          size="small"
          sx={selectStyles}
        >
          {STATUSES.map((status) => (
            <MenuItem 
              key={status} 
              value={status}
              sx={{
                color: darkTheme.text.primary,
                '&:hover': {
                  backgroundColor: darkTheme.hover,
                },
                '&.Mui-selected': {
                  backgroundColor: `${darkTheme.accent}22`,
                  '&:hover': {
                    backgroundColor: `${darkTheme.accent}33`,
                  },
                },
              }}
            >
              {status}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel sx={{ color: darkTheme.text.secondary }}>Rank</InputLabel>
        <Select
          value={filters.rank}
          label="Rank"
          onChange={handleFilterChange('rank')}
          size="small"
          sx={selectStyles}
        >
          {RANKS.map((rank) => (
            <MenuItem 
              key={rank} 
              value={rank}
              sx={{
                color: darkTheme.text.primary,
                '&:hover': {
                  backgroundColor: darkTheme.hover,
                },
                '&.Mui-selected': {
                  backgroundColor: `${darkTheme.accent}22`,
                  '&:hover': {
                    backgroundColor: `${darkTheme.accent}33`,
                  },
                },
              }}
            >
              {rank}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Button
          variant="contained"
          onClick={handleApplyFilters}
          sx={{
            backgroundColor: darkTheme.accent,
            color: '#000000',
            '&:hover': {
              backgroundColor: darkTheme.success,
            },
          }}
        >
          Apply Filters
        </Button>
        <Button
          variant="outlined"
          onClick={handleResetFilters}
          sx={{
            color: darkTheme.text.primary,
            borderColor: darkTheme.border,
            '&:hover': {
              borderColor: darkTheme.text.primary,
              backgroundColor: darkTheme.hover,
            },
          }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
}; 