import React, { useState } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, Paper, styled, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#000000',
  padding: '48px',
  maxWidth: '600px',
  width: '90%',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 0,
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    border: '1px solid rgba(255, 255, 255, 0.05)',
    pointerEvents: 'none',
  }
}));

type Version = 'civilian' | 'defense';

const ServerSelector: React.FC = () => {
  const navigate = useNavigate();
  const [version, setVersion] = useState<Version>();

  const handleVersionSelect = (
    _event: React.MouseEvent<HTMLElement>,
    newVersion: Version | null,
  ) => {
    if (newVersion) {
      setVersion(newVersion);
      // Store the version in localStorage for persistence
      localStorage.setItem('selectedVersion', newVersion);
      // Navigate to the login page with the intended destination
      navigate(`/${newVersion}/login`, {
        state: { redirectTo: `/${newVersion}/dashboard` }
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <StyledPaper>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 500,
              letterSpacing: '0.02em',
              textTransform: 'none',
              fontFamily: 'serif',
              border: '2px solid white',
              display: 'inline-block',
              padding: '16px 32px',
            }}
          >
            HandReceipt
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: alpha('#fff', 0.7),
              mt: 2,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            SELECT VERSION
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={version}
            exclusive
            onChange={handleVersionSelect}
            aria-label="version selection"
            sx={{
              backgroundColor: alpha('#000000', 0.4),
              padding: '16px',
              borderRadius: 0,
              '& .MuiToggleButton-root': {
                minWidth: 160,
                padding: '16px 32px',
                color: alpha('#fff', 0.7),
                borderColor: alpha('#fff', 0.23),
                fontSize: '1.1rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                '&.Mui-selected': {
                  color: '#fff',
                  backgroundColor: alpha('#fff', 0.1),
                  borderColor: '#fff',
                },
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.05),
                },
                '&:not(:first-of-type)': {
                  marginLeft: '16px',
                },
              },
            }}
          >
            <ToggleButton value="civilian">
              CIVILIAN
            </ToggleButton>
            <ToggleButton value="defense">
              DEFENSE
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </StyledPaper>
    </Box>
  );
};

export default ServerSelector; 