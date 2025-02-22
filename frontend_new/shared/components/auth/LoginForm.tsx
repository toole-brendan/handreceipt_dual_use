import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  styled,
  alpha,
  CircularProgress
} from '@mui/material';
import { login } from '@shared/store/slices/auth/slice';
import type { AppDispatch, BaseState } from '@shared/store/createStore';
import type { AuthCredentials } from '@shared/store/slices/auth/types';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#000000',
  padding: '48px',
  maxWidth: '400px',
  width: '90%',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 0,
  position: 'relative',
}));

interface LocationState {
  redirectTo?: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch<BaseState>>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { redirectTo = '/' } = (location.state as LocationState) || {};

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const credentials: AuthCredentials = {
      email: formData.get('email') as string,
      password: formData.get('password') as string
    };

    try {
      const result = await dispatch(login(credentials)).unwrap();
      navigate(redirectTo);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
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
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            name="email"
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: alpha('#fff', 0.23),
                },
                '&:hover fieldset': {
                  borderColor: alpha('#fff', 0.4),
                },
              },
              '& .MuiInputLabel-root': {
                color: alpha('#fff', 0.7),
              },
            }}
          />
          
          <TextField
            name="password"
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: alpha('#fff', 0.23),
                },
                '&:hover fieldset': {
                  borderColor: alpha('#fff', 0.4),
                },
              },
              '& .MuiInputLabel-root': {
                color: alpha('#fff', 0.7),
              },
            }}
          />

          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              mt: 3,
              mb: 2,
              height: 48,
              backgroundColor: '#fff',
              color: '#000',
              '&:hover': {
                backgroundColor: alpha('#fff', 0.9),
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>
      </StyledPaper>
    </Box>
  );
};

export default LoginForm; 