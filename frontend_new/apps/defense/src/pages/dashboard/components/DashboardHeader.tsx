import React from 'react';
import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';

const UnitLogo = styled('img')({
  width: 50,
  height: 50,
  objectFit: 'contain',
});

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const CommanderInfo = styled(Box)({
  flex: 1,
  textAlign: 'center',
});

export const DashboardHeader: React.FC = () => {
  return (
    <HeaderContainer>
      <UnitLogo
        src="/assets/images/101st-airborne-logo.png"
        alt="101st Airborne Division"
      />
      
      <CommanderInfo>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
          Captain John Doe
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Company Commander, F CO - 2-506, 3BCT, 101st Airborne Division
        </Typography>
      </CommanderInfo>

      <TextField
        placeholder="Search items, personnel, or transfers..."
        size="small"
        sx={{ width: 300 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </HeaderContainer>
  );
}; 