import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  width: '100%',
  maxWidth: 500,
  backgroundColor: alpha('#000000', 0.85),
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)',
  },
}));
