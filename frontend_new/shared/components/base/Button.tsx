import React from 'react';
import styled from '@emotion/styled';
import { useThemeStyles } from '../../contexts/ThemeContext';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  cursor: ${props => (props.disabled || props.loading ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease-in-out;
  opacity: ${props => (props.disabled || props.loading ? 0.6 : 1)};
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  gap: 8px;
  border: none;
  outline: none;

  ${props => {
    const theme = props.theme;
    const buttonTheme = theme.components.button;
    const variantStyles = buttonTheme.variants[props.variant || 'contained'];
    const sizeStyles = buttonTheme.sizes[props.size || 'medium'];

    return `
      border-radius: ${buttonTheme.borderRadius};
      font-family: ${theme.typography.button.fontFamily};
      font-weight: ${theme.typography.button.fontWeight};
      text-transform: ${theme.typography.button.textTransform};
      letter-spacing: ${theme.typography.button.letterSpacing};
      padding: ${sizeStyles.padding};
      font-size: ${sizeStyles.fontSize};
      background-color: ${variantStyles.background};
      color: ${variantStyles.color};
      border: ${variantStyles.border || 'none'};

      &:hover:not(:disabled) {
        background-color: ${variantStyles.hover};
      }

      &:active:not(:disabled) {
        background-color: ${variantStyles.active};
      }
    `;
  }}
`;

const LoadingSpinner = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const ContentWrapper = styled.span<{ loading?: boolean }>`
  visibility: ${props => (props.loading ? 'hidden' : 'visible')};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'contained',
      size = 'medium',
      fullWidth = false,
      loading = false,
      startIcon,
      endIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const theme = useThemeStyles();

    return (
      <StyledButton
        ref={ref}
        disabled={disabled || loading}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        loading={loading}
        theme={theme}
        {...props}
      >
        {loading && <LoadingSpinner>Loading...</LoadingSpinner>}
        <ContentWrapper loading={loading}>
          {startIcon}
          {children}
          {endIcon}
        </ContentWrapper>
      </StyledButton>
    );
  }
);

