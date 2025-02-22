import React from 'react';
import { styled } from '@mui/material/styles';
import { AlertCircle } from 'lucide-react';
import type { TransferType, TransferPriority, TransferStatus } from '../../types';

const Badge = styled('span')<{ color: string; backgroundColor: string }>(({ color, backgroundColor }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: color,
  backgroundColor: backgroundColor,
  border: `1px solid ${color}`,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  gap: '4px',
}));

interface BadgeProps {
  type: TransferType;
}

interface PriorityBadgeProps {
  priority: TransferPriority;
}

interface StatusBadgeProps {
  status: TransferStatus;
}

interface BadgeConfig {
  color: string;
  backgroundColor: string;
  label: string;
  icon?: React.ReactNode;
}

export const TypeBadge: React.FC<BadgeProps> = ({ type }) => {
  const config: Record<TransferType, BadgeConfig> = {
    incoming: {
      color: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      label: 'Incoming'
    },
    outgoing: {
      color: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      label: 'Outgoing'
    }
  };

  const { color, backgroundColor, label } = config[type];

  return (
    <Badge color={color} backgroundColor={backgroundColor}>
      {label}
    </Badge>
  );
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config: Record<TransferPriority, BadgeConfig> = {
    high: {
      color: '#FF3B3B',
      backgroundColor: 'rgba(255, 59, 59, 0.1)',
      label: 'High',
      icon: <AlertCircle size={14} />
    },
    medium: {
      color: '#FFD700',
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
      label: 'Medium'
    },
    low: {
      color: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      label: 'Low'
    }
  };

  const { color, backgroundColor, label, icon } = config[priority];

  return (
    <Badge color={color} backgroundColor={backgroundColor}>
      {icon}
      {label}
    </Badge>
  );
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config: Record<TransferStatus, BadgeConfig> = {
    needs_approval: {
      color: '#FFD700',
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
      label: 'Needs Approval'
    },
    pending_other: {
      color: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      label: 'Pending'
    },
    completed: {
      color: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      label: 'Completed'
    }
  };

  const { color, backgroundColor, label } = config[status];

  return (
    <Badge color={color} backgroundColor={backgroundColor}>
      {label}
    </Badge>
  );
};
