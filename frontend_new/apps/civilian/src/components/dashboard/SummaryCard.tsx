import React from 'react';
import { Box, Card, Typography, styled } from '@mui/material';

interface SummaryCardProps {
  title: string;
  icon: React.ReactNode;
  value: string | number;
  subtitle?: string;
  status?: 'success' | 'warning' | 'error';
}

const StyledCard = styled(Card)(({ theme }) => ({
  minWidth: 280,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(8px)',
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  icon,
  value,
  subtitle,
  status = 'success',
}) => (
  <StyledCard>
    <CardHeader>
      <Box sx={{ color: `${status}.main` }}>{icon}</Box>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
    </CardHeader>
    <Typography variant="h4" component="div">
      {value}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </StyledCard>
);
