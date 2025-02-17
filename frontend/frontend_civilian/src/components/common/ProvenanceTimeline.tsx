import React, { useState } from 'react';
import { Box, Typography, Paper, Divider, IconButton, Collapse, Tooltip, alpha } from '@mui/material';
import { ChevronDown, ChevronUp, ChevronRight, MapPin, Package, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { colors } from '../../styles/theme/colors';
import BlockchainBadge from './BlockchainBadge';

export interface ProvenanceEvent {
  id: string;
  timestamp: string;
  location: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  action: 'Production' | 'Quality Check' | 'Shipped' | 'Received' | 'Stored' | 'Sold';
  actor: {
    name: string;
    role: string;
  };
  data?: {
    [key: string]: any;
  };
  documents?: Array<{
    name: string;
    hash: string;
    url?: string;
  }>;
  blockchainData: {
    transactionHash: string;
    timestamp: string;
    verified: boolean;
  };
}

interface ProvenanceTimelineProps {
  events: ProvenanceEvent[];
  onEventClick?: (event: ProvenanceEvent) => void;
  onLocationClick?: (location: ProvenanceEvent['location']) => void;
  onDocumentClick?: (document: NonNullable<ProvenanceEvent['documents']>[number]) => void;
}

const ProvenanceTimeline: React.FC<ProvenanceTimelineProps> = ({
  events,
  onEventClick,
  onLocationClick,
  onDocumentClick
}) => {
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);

  const toggleEvent = (eventId: string) => {
    setExpandedEvents(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const getActionIcon = (action: ProvenanceEvent['action']) => {
    switch (action) {
      case 'Production':
        return <Package size={20} />;
      case 'Shipped':
      case 'Received':
        return <Truck size={20} />;
      case 'Quality Check':
        return <CheckCircle size={20} />;
      case 'Stored':
        return <MapPin size={20} />;
      case 'Sold':
        return <AlertCircle size={20} />;
      default:
        return <Package size={20} />;
    }
  };

  const getActionColor = (action: ProvenanceEvent['action']) => {
    switch (action) {
      case 'Production':
        return colors.success;
      case 'Quality Check':
        return colors.info;
      case 'Shipped':
        return colors.warning;
      case 'Received':
        return colors.success;
      case 'Stored':
        return colors.primary;
      case 'Sold':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {events.map((event, index) => (
        <Box
          key={event.id}
          sx={{
            position: 'relative',
            pl: 4,
            pb: index === events.length - 1 ? 0 : 3,
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 15,
              top: 28,
              bottom: 0,
              width: 2,
              bgcolor: index === events.length - 1 ? 'transparent' : alpha(colors.primary, 0.2),
            }
          }}
        >
          {/* Event Dot */}
          <Box
            sx={{
              position: 'absolute',
              left: 8,
              top: 8,
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: getActionColor(event.action),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `3px solid ${alpha(getActionColor(event.action), 0.2)}`,
            }}
          />

          {/* Event Card */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(colors.background.paper, 0.5),
              border: `1px solid ${alpha(colors.primary, 0.1)}`,
              borderRadius: 1,
              cursor: onEventClick ? 'pointer' : 'default',
              '&:hover': onEventClick ? {
                bgcolor: alpha(colors.background.paper, 0.8),
              } : undefined,
            }}
            onClick={() => onEventClick?.(event)}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(getActionColor(event.action), 0.1),
                    color: getActionColor(event.action),
                  }}
                >
                  {getActionIcon(event.action)}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {event.action}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(event.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <BlockchainBadge
                transactionHash={event.blockchainData.transactionHash}
                timestamp={event.blockchainData.timestamp}
                size="small"
              />
            </Box>

            {/* Location */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
                cursor: onLocationClick ? 'pointer' : 'default',
                '&:hover': onLocationClick ? {
                  color: 'primary.main'
                } : undefined
              }}
              onClick={(e) => {
                e.stopPropagation();
                onLocationClick?.(event.location);
              }}
            >
              <MapPin size={16} />
              <Typography variant="body2">
                {event.location.name}
              </Typography>
            </Box>

            {/* Actor */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              By {event.actor.name} ({event.actor.role})
            </Typography>

            {/* Expand/Collapse Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEvent(event.id);
                }}
              >
                {expandedEvents.includes(event.id) ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </IconButton>
            </Box>

            {/* Expanded Content */}
            <Collapse in={expandedEvents.includes(event.id)}>
              <Divider sx={{ my: 2 }} />
              
              {/* Additional Data */}
              {event.data && Object.entries(event.data).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Additional Data
                  </Typography>
                  {Object.entries(event.data).map(([key, value]) => (
                    <Typography
                      key={key}
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      <strong>{key}:</strong> {String(value)}
                    </Typography>
                  ))}
                </Box>
              )}

              {/* Documents */}
              {event.documents && event.documents.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Documents
                  </Typography>
                  {event.documents.map((doc) => (
                    <Box
                      key={doc.hash}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5,
                        cursor: onDocumentClick ? 'pointer' : 'default',
                        '&:hover': onDocumentClick ? {
                          color: 'primary.main'
                        } : undefined
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDocumentClick?.(doc);
                      }}
                    >
                      <Typography variant="body2">
                        {doc.name}
                      </Typography>
                      <Tooltip title="View Document">
                        <IconButton size="small">
                          <ChevronRight size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              )}
            </Collapse>
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default ProvenanceTimeline;
