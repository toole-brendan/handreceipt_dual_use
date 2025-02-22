import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, alpha, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { StyledPaper } from './LoginPage.styles';
import { AuthService } from '../../services/auth/authService';
import { appConfig } from '../../config/app.config';

type Version = 'civilian' | 'defense';

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [version, setVersion] = useState<Version>(AuthService.getVersion());

  const handleVersionChange = (
    _event: React.MouseEvent<HTMLElement>,
    newVersion: Version | null,
  ) => {
    if (newVersion !== null) {
      setVersion(newVersion);
      AuthService.setVersion(newVersion);
      
      // Do a full redirect to the appropriate server and landing page
      if (newVersion === 'civilian') {
        window.location.href = 'http://localhost:3001/civilian/dashboard';
      } else {
        window.location.href = 'http://localhost:3002/defense/property';
      }
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
      <StyledPaper elevation={0}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box
            sx={{
              border: '2px solid white',
              display: 'inline-block',
              padding: '20px 40px',
              marginBottom: 1,
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                color: 'white',
                fontFamily: 'Georgia, serif',
                fontWeight: 500,
                letterSpacing: '0.05em',
                margin: 0,
              }}
            >
              HandReceipt
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: alpha('#fff', 0.7),
              letterSpacing: '0.1em',
              fontWeight: 300,
              textTransform: 'uppercase',
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}
          >
            Select Version
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={version}
            exclusive
            onChange={handleVersionChange}
            aria-label="version selection"
            sx={{
              backgroundColor: alpha('#000000', 0.4),
              padding: theme.spacing(2),
              borderRadius: theme.shape.borderRadius,
              '& .MuiToggleButton-root': {
                minWidth: 120,
                padding: theme.spacing(2),
                color: alpha('#fff', 0.7),
                borderColor: alpha('#fff', 0.23),
                fontSize: '1.1rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  borderColor: theme.palette.primary.main,
                },
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.05),
                },
                '&:not(:first-of-type)': {
                  marginLeft: theme.spacing(2),
                },
              },
            }}
          >
            <ToggleButton value="civilian">
              Civilian
            </ToggleButton>
            <ToggleButton value="defense">
              Defense
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </StyledPaper>
    </Box>
  );
};

export default LoginPage;
