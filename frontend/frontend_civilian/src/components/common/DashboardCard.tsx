import React from 'react';
import { Paper, Box, Typography, CircularProgress, alpha, useTheme } from '@mui/material';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  minHeight?: number | string;
  action?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outlined' | 'alert';
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  children,
  loading = false,
  minHeight = 200,
  action,
  onClick,
  variant = 'default'
}) => {
  const theme = useTheme();

  // Determine border color based on variant
  const getBorderColor = () => {
    switch (variant) {
      case 'alert':
        return alpha(theme.palette.error.main, 0.5); // Red for alerts
      case 'outlined':
        return alpha(theme.palette.primary.main, 0.2); // More visible white
      default:
        return alpha(theme.palette.primary.main, 0.1); // Default subtle white
    }
  };

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${getBorderColor()}`,
        borderRadius: 1,
        p: 3,
        minWidth: 200,
        minHeight,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          borderColor: alpha(theme.palette.primary.main, 0.3),
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
        } : undefined
      }}
    >
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography 
            variant="subtitle2" 
            color="text.secondary"
            sx={{ 
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 500
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ display: 'block', mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Box sx={{ ml: 2 }}>
            {action}
          </Box>
        )}
      </Box>

      {/* Content Section */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative'
      }}>
        {loading ? (
          <CircularProgress size={24} sx={{ color: theme.palette.secondary.main }} />
        ) : (
          children
        )}
      </Box>
    </Paper>
  );
};

export default DashboardCard;
