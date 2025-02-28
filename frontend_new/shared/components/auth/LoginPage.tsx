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
      
      // Navigate to the appropriate landing page using appConfig
      const config = newVersion === 'civilian' ? appConfig.civilian : appConfig.defense;
      window.location.href = `${window.location.origin}${config.landingPage}`;
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

export default LoginPage;
