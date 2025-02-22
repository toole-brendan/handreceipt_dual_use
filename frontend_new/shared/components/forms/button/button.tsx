import React from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
  styled,
} from '@mui/material';
import { useThemeStyles } from '../../../contexts/ThemeContext';

export interface ButtonProps extends Omit<MuiButtonProps, 'startIcon' | 'endIcon'> {
  isLoading?: boolean;
  isIcon?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const StyledButton = styled(MuiButton)(({ theme }) => {
  const customTheme = useThemeStyles();
  const buttonTheme = customTheme.components.button;

  return {
    borderRadius: buttonTheme.borderRadius,
    fontFamily: customTheme.typography.button.fontFamily,
    fontWeight: customTheme.typography.button.fontWeight,
    textTransform: customTheme.typography.button.textTransform,
    letterSpacing: customTheme.typography.button.letterSpacing,
    transition: 'all 0.2s ease-in-out',

    '& .MuiButton-startIcon, & .MuiButton-endIcon': {
      margin: theme.spacing(0, 0.5),
    },

    '& .button-spinner': {
      marginRight: theme.spacing(1),
      color: 'inherit',
    },

    // Variant styles
    ...(theme.palette.mode === 'dark' && {
      '&.MuiButton-contained': {
        backgroundColor: buttonTheme.variants.contained.background,
        color: buttonTheme.variants.contained.color,
        '&:hover': {
          backgroundColor: buttonTheme.variants.contained.hover,
        },
        '&:active': {
          backgroundColor: buttonTheme.variants.contained.active,
        },
        '&.Mui-disabled': {
          backgroundColor: buttonTheme.variants.contained.disabled,
        },
      },
      '&.MuiButton-outlined': {
        border: buttonTheme.variants.outlined.border,
        color: buttonTheme.variants.outlined.color,
        '&:hover': {
          backgroundColor: buttonTheme.variants.outlined.hover,
        },
        '&:active': {
          backgroundColor: buttonTheme.variants.outlined.active,
        },
        '&.Mui-disabled': {
          borderColor: buttonTheme.variants.outlined.disabled,
        },
      },
      '&.MuiButton-text': {
        color: buttonTheme.variants.text.color,
        '&:hover': {
          backgroundColor: buttonTheme.variants.text.hover,
        },
        '&:active': {
          backgroundColor: buttonTheme.variants.text.active,
        },
        '&.Mui-disabled': {
          color: buttonTheme.variants.text.disabled,
        },
      },
    }),

    // Size styles
    '&.MuiButton-sizeLarge': buttonTheme.sizes.large,
    '&.MuiButton-sizeMedium': buttonTheme.sizes.medium,
    '&.MuiButton-sizeSmall': buttonTheme.sizes.small,
  };
});

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'contained',
  size = 'medium',
  isLoading = false,
  isIcon = false,
  iconLeft,
  iconRight,
  disabled,
  children,
  ...props
}, ref) => {
  return (
    <StyledButton
      ref={ref}
      className={className}
      variant={variant}
      size={size}
      disabled={isLoading || disabled}
      startIcon={!isLoading && iconLeft ? iconLeft : undefined}
      endIcon={!isLoading && iconRight ? iconRight : undefined}
      {...props}
    >
      {isLoading && (
        <CircularProgress
          size={20}
          className="button-spinner"
        />
      )}
      {children}
    </StyledButton>
  );
});

Button.displayName = 'Button';
