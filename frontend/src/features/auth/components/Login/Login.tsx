import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { AnyAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { login, clearError, setVersion, setError } from '@/store/slices/auth/authSlice';
import { AppVersion } from '@/types/auth';
import { 
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link as MuiLink,
  IconButton,
  InputAdornment,
  Alert,
  useTheme,
  alpha,
  Select,
  SelectChangeEvent,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Visibility, 
  VisibilityOff,
} from '@mui/icons-material';

const StyledContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.spacing(3),
  background: '#000000',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  border: '2px solid #FFFFFF',
  padding: theme.spacing(2, 4),
  marginBottom: theme.spacing(6),
}));

const LogoText = styled(Typography)(() => ({
  color: '#FFFFFF',
  fontFamily: 'serif',
  fontSize: '2.5rem',
  fontWeight: 400,
  letterSpacing: '0.05em',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '400px',
  padding: theme.spacing(4),
  backgroundColor: 'transparent',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    '& fieldset': {
      borderColor: alpha('#FFFFFF', 0.3),
    },
    '&:hover fieldset': {
      borderColor: alpha('#FFFFFF', 0.5),
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFFFFF',
    },
  },
  '& .MuiInputLabel-root': {
    color: alpha('#FFFFFF', 0.7),
  },
  '& .MuiInputBase-input': {
    color: '#FFFFFF',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  backgroundColor: '#1A1A1A',
  color: '#FFFFFF',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: '#2A2A2A',
  },
  '& .MuiButton-label': {
    textTransform: 'none',
    fontSize: '1rem',
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    color: '#FFFFFF',
    '& fieldset': {
      borderColor: alpha('#FFFFFF', 0.3),
    },
    '&:hover fieldset': {
      borderColor: alpha('#FFFFFF', 0.5),
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFFFFF',
    },
  },
  '& .MuiInputLabel-root': {
    color: alpha('#FFFFFF', 0.7),
  },
  '& .MuiSelect-icon': {
    color: alpha('#FFFFFF', 0.7),
  },
}));

const StyledLink = styled(MuiLink)(() => ({
  color: alpha('#FFFFFF', 0.7),
  textDecoration: 'none',
  fontSize: '0.875rem',
  '&:hover': {
    color: '#FFFFFF',
  },
}));

const HelpText = styled(Typography)(({ theme }) => ({
  color: alpha('#FFFFFF', 0.5),
  fontSize: '0.875rem',
  textAlign: 'center',
  marginTop: theme.spacing(4),
}));

const DevModeText = styled(Typography)(({ theme }) => ({
  color: '#FFD700',
  fontSize: '0.875rem',
  textAlign: 'center',
  marginTop: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: alpha('#FFD700', 0.1),
  borderRadius: theme.shape.borderRadius,
}));

const Login: React.FC = () => {
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const navigate = useNavigate();
  const theme = useTheme();
  const version = useSelector((state: RootState) => state.auth.version);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isDevelopment = true; // Force development mode for testing

  useEffect(() => {
    // Set default version to Defense
    if (!version) {
      dispatch(setVersion('Defense' as AppVersion));
    }
  }, [dispatch, version]);

  const handleVersionChange = (event: SelectChangeEvent) => {
    dispatch(setVersion(event.target.value as AppVersion));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setLocalError(null);
    dispatch(clearError());

    try {
      const result = await dispatch(login({
        email: 'test@example.com',
        password: 'test123'
      })).unwrap();

      // Navigate based on version
      const basePath = version === 'Defense' ? '/defense' : '/civilian';
      const defaultPath = version === 'Defense' ? '/property' : '/dashboard';
      navigate(`${basePath}${defaultPath}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setLocalError(message);
      dispatch(setError(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledContainer maxWidth={false}>
      <LogoContainer>
        <LogoText>HandReceipt</LogoText>
      </LogoContainer>

      <StyledPaper elevation={0}>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                backgroundColor: 'transparent',
                color: theme.palette.error.main,
                border: `1px solid ${theme.palette.error.main}`,
              }}
            >
              {error}
            </Alert>
          )}

          {isDevelopment && (
            <StyledFormControl>
              <InputLabel id="version-select-label">Select Dual-Use Version</InputLabel>
              <Select
                labelId="version-select-label"
                id="version-select"
                value={version || 'Defense'}
                label="Select Dual-Use Version"
                onChange={handleVersionChange}
                sx={{
                  color: '#FFFFFF',
                  '& .MuiSelect-icon': {
                    color: '#FFFFFF',
                  },
                }}
              >
                <MenuItem value="Defense">Defense Version</MenuItem>
                <MenuItem value="Civilian">Civilian Version</MenuItem>
              </Select>
            </StyledFormControl>
          )}

          <StyledButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Signing in...' : isDevelopment ? 'Dev Login' : 'Sign In'}
          </StyledButton>
        </Box>

        {isDevelopment && (
          <DevModeText>
            Development Mode: Click "Dev Login" to sign in with the selected version
          </DevModeText>
        )}

        <HelpText>
          For assistance, contact your unit's S6 or system administrator
        </HelpText>
      </StyledPaper>
    </StyledContainer>
  );
};

export default Login;
