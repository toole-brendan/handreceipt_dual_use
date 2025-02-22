import React from 'react';
import { Box, styled, Typography, IconButton, Stack } from '@mui/material';
import { Warning as WarningIcon, Close as CloseIcon } from '@mui/icons-material';

export interface Alert {
  id: string;
  message: string;
  type: 'error' | 'warning';
  timestamp: string;
}

interface CriticalAlertsBannerProps {
  alerts: Alert[];
  onDismiss?: (alertId: string) => void;
}

const BannerContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar + 1,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  backdropFilter: 'blur(8px)',
  color: theme.palette.error.main,
  padding: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.error.main}`,
  transition: 'all 0.3s ease',
}));

const AlertItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(255, 0, 0, 0.1)',
  '&:not(:last-child)': {
    marginBottom: theme.spacing(1),
  },
}));

const CriticalAlertsBanner: React.FC<CriticalAlertsBannerProps> = ({ alerts, onDismiss }) => {
  if (!alerts.length) return null;

  return (
    <BannerContainer>
      <Stack spacing={1}>
        {alerts.map((alert) => (
          <AlertItem key={alert.id}>
            <WarningIcon
              sx={{
                color: alert.type === 'error' ? 'error.main' : 'warning.main',
                fontSize: '1.2rem',
              }}
            />
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                fontWeight: 500,
                color: alert.type === 'error' ? 'error.main' : 'warning.main',
              }}
            >
              {alert.message}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', mr: 1 }}
            >
              {alert.timestamp}
            </Typography>
            {onDismiss && (
              <IconButton
                size="small"
                onClick={() => onDismiss(alert.id)}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'text.primary',
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </AlertItem>
        ))}
      </Stack>
    </BannerContainer>
  );
};

export default CriticalAlertsBanner;
