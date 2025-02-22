import React from 'react';
import { Box, Typography, Paper, alpha, useTheme } from '@mui/material';
import { Package, Truck, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { colors } from '../../styles/theme/colors';
import BlockchainBadge from '../common/BlockchainBadge';

export type ProvenanceEventType = 'manufacture' | 'quality_check' | 'ship' | 'receive' | 'store';
export type ProvenanceEventStatus = 'success' | 'warning' | 'error';

export interface ProvenanceEvent {
  id: string;
  type: ProvenanceEventType;
  status: ProvenanceEventStatus;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  transactionHash?: string;
  metadata?: Record<string, any>;
}

interface ProvenanceTimelineProps {
  events: ProvenanceEvent[];
  onEventClick?: (event: ProvenanceEvent) => void;
}

const ProvenanceTimeline: React.FC<ProvenanceTimelineProps> = ({
  events,
  onEventClick
}) => {
  const theme = useTheme();

  const getEventIcon = (type: ProvenanceEvent['type']) => {
    switch (type) {
      case 'manufacture':
        return <Package size={20} />;
      case 'ship':
        return <Truck size={20} />;
      case 'receive':
        return <CheckCircle size={20} />;
      case 'quality_check':
        return <AlertTriangle size={20} />;
      case 'store':
        return <MapPin size={20} />;
      default:
        return <Package size={20} />;
    }
  };

  const getEventColor = (status: ProvenanceEvent['status']) => {
    switch (status) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      {events.map((event, index) => (
        <Box
          key={event.id}
          sx={{
            display: 'flex',
            position: 'relative',
            mb: index < events.length - 1 ? 4 : 0
          }}
        >
          {/* Vertical line connecting events */}
          {index < events.length - 1 && (
            <Box
              sx={{
                position: 'absolute',
                left: 20,
                top: 40,
                bottom: -40,
                width: 2,
                bgcolor: alpha(colors.primary, 0.2),
                zIndex: 0
              }}
            />
          )}

          {/* Event icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(getEventColor(event.status), 0.1),
              color: getEventColor(event.status),
              mr: 2,
              flexShrink: 0,
              zIndex: 1
            }}
          >
            {getEventIcon(event.type)}
          </Box>

          {/* Event content */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 2,
              bgcolor: alpha(colors.background.paper, 0.5),
              border: `1px solid ${alpha(colors.primary, 0.1)}`,
              borderRadius: 1,
              cursor: onEventClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease-in-out',
              '&:hover': onEventClick ? {
                transform: 'translateX(4px)',
                bgcolor: alpha(colors.background.paper, 0.8),
                boxShadow: theme.shadows[2]
              } : undefined
            }}
            onClick={() => onEventClick?.(event)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {event.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {event.location}
                </Typography>
              </Box>
              {event.transactionHash && (
                <BlockchainBadge
                  transactionHash={event.transactionHash}
                  timestamp={event.timestamp}
                  size="small"
                />
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {event.description}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {new Date(event.timestamp).toLocaleString()}
            </Typography>

            {event.metadata && (
              <Box sx={{ mt: 2 }}>
                {Object.entries(event.metadata).map(([key, value]) => (
                  <Typography
                    key={key}
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'text.secondary',
                      '&:not(:last-child)': { mb: 0.5 }
                    }}
                  >
                    <strong>{key}:</strong> {String(value)}
                  </Typography>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default ProvenanceTimeline;
