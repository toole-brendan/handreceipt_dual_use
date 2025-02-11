import React from 'react';
import {
  Box,
  LinearProgress,
  CircularProgress,
  Typography,
  LinearProgressProps,
  CircularProgressProps,
  styled
} from '@mui/material';

interface BaseProgressIndicatorProps {
  label?: string;
  showValue?: boolean;
  value: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

interface LinearProgressIndicatorProps extends BaseProgressIndicatorProps {
  variant: 'linear';
  progressProps?: Omit<LinearProgressProps, 'value' | 'color' | 'variant'>;
}

interface CircularProgressIndicatorProps extends BaseProgressIndicatorProps {
  variant: 'circular';
  progressProps?: Omit<CircularProgressProps, 'value' | 'color' | 'variant'>;
}

type ProgressIndicatorProps = LinearProgressIndicatorProps | CircularProgressIndicatorProps;

const ProgressWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1)
}));

const LabelContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  variant,
  label,
  showValue = false,
  value,
  color = 'primary',
  progressProps = {}
}) => {
  const progressValue = Math.min(Math.max(value, 0), 100);

  return (
    <ProgressWrapper>
      {(label || showValue) && (
        <LabelContainer>
          {label && (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          )}
          {showValue && (
            <Typography variant="body2" color="text.secondary">
              {Math.round(progressValue)}%
            </Typography>
          )}
        </LabelContainer>
      )}
      {variant === 'linear' ? (
        <LinearProgress
          {...progressProps}
          variant="determinate"
          value={progressValue}
          color={color}
        />
      ) : (
        <CircularProgress
          {...progressProps}
          variant="determinate"
          value={progressValue}
          color={color}
        />
      )}
    </ProgressWrapper>
  );
};
