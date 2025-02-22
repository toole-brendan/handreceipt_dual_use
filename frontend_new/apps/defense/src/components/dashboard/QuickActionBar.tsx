import React from 'react';
import { Box, styled, Button, Stack, Tooltip } from '@mui/material';
import {
  SwapHoriz as TransferIcon,
  QrCode as QrCodeIcon,
  ReportProblem as ReportIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';

const ActionBarContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(8px)',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 120,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1),
  },
}));

interface QuickActionBarProps {
  onInitiateTransfer?: () => void;
  onScanQrCode?: () => void;
  onReportDamage?: () => void;
  onGenerateForm?: () => void;
}

const QuickActionBar: React.FC<QuickActionBarProps> = ({
  onInitiateTransfer,
  onScanQrCode,
  onReportDamage,
  onGenerateForm,
}) => {
  const actions = [
    {
      label: 'Initiate Transfer',
      icon: <TransferIcon />,
      onClick: onInitiateTransfer,
      tooltip: 'Start a new property transfer',
    },
    {
      label: 'Scan QR Code',
      icon: <QrCodeIcon />,
      onClick: onScanQrCode,
      tooltip: 'Scan item QR code for quick access',
    },
    {
      label: 'Report Damage',
      icon: <ReportIcon />,
      onClick: onReportDamage,
      tooltip: 'Report damaged or unserviceable equipment',
    },
    {
      label: 'Generate DA 2062',
      icon: <DocumentIcon />,
      onClick: onGenerateForm,
      tooltip: 'Generate Hand Receipt form DA 2062',
    },
  ];

  return (
    <ActionBarContainer>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
      >
        {actions.map((action) => (
          <Tooltip key={action.label} title={action.tooltip} arrow>
            <ActionButton
              variant="contained"
              startIcon={action.icon}
              onClick={action.onClick}
              fullWidth
            >
              {action.label}
            </ActionButton>
          </Tooltip>
        ))}
      </Stack>
    </ActionBarContainer>
  );
};

export default QuickActionBar;
