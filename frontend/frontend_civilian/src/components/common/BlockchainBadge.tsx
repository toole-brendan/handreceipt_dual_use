import React from 'react';
import { Box, Typography, Tooltip, alpha } from '@mui/material';
import { Link2 } from 'lucide-react';
import { colors } from '../../styles/theme/colors';

interface BlockchainBadgeProps {
  transactionHash?: string;
  explorerUrl?: string;
  timestamp?: string;
  size?: 'small' | 'medium' | 'large';
  status?: string;
  showTooltip?: boolean;
  onClick?: () => void;
}

const BlockchainBadge: React.FC<BlockchainBadgeProps> = ({
  transactionHash,
  explorerUrl,
  timestamp,
  size = 'medium',
  status,
  showTooltip = true,
  onClick
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 24,
          fontSize: '0.75rem',
          iconSize: 14,
          px: 1
        };
      case 'large':
        return {
          height: 36,
          fontSize: '0.875rem',
          iconSize: 18,
          px: 2
        };
      default:
        return {
          height: 32,
          fontSize: '0.8125rem',
          iconSize: 16,
          px: 1.5
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const getTooltipContent = () => {
    if (status && !transactionHash) {
      return (
        <Box sx={{ p: 1 }}>
          <Typography variant="body2">
            {status}
          </Typography>
        </Box>
      );
    }

    if (!transactionHash) {
      return null;
    }

    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
          Transaction Hash:
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: timestamp ? 1 : 0 }}>
          {transactionHash}
        </Typography>
        {timestamp && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Recorded: {new Date(timestamp).toLocaleString()}
          </Typography>
        )}
      </Box>
    );
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else if (explorerUrl) {
      window.open(explorerUrl, '_blank');
    }
  };

  const badge = (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        height: sizeStyles.height,
        bgcolor: alpha(colors.primary, 0.1),
        color: colors.primary,
        borderRadius: 1,
        px: sizeStyles.px,
        cursor: (onClick || explorerUrl) ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': (onClick || explorerUrl) ? {
          bgcolor: alpha(colors.primary, 0.15),
          transform: 'translateY(-1px)'
        } : undefined
      }}
      onClick={handleClick}
    >
      <Link2 size={sizeStyles.iconSize} style={{ marginRight: 6 }} />
      <Typography
        variant="caption"
        sx={{
          fontSize: sizeStyles.fontSize,
          fontWeight: 500,
          letterSpacing: '0.02em'
        }}
      >
        {status || 'Blockchain Verified'}
      </Typography>
    </Box>
  );

  const tooltipContent = getTooltipContent();

  if (!showTooltip || !tooltipContent) {
    return badge;
  }

  return (
    <Tooltip title={tooltipContent} arrow>
      {badge}
    </Tooltip>
  );
};

export default BlockchainBadge;
