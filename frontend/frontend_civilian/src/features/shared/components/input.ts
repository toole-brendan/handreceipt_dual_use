import { Input as MuiInput, InputProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Input = styled(MuiInput)<InputProps>(({ theme }) => ({
  '&.MuiInput-root': {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    fontSize: 16,
    padding: '10px 12px',
    transition: theme.transitions.create([
      'border-color',
      'background-color',
      'box-shadow',
    ]),
    '&:focus': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
    },
  },
}));

export type { InputProps };
