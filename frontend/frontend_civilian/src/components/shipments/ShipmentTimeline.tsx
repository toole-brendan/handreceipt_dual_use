import React, { useState } from 'react';
import { Box, Typography, Paper, Divider, IconButton, Collapse, Tooltip, alpha } from '@mui/material';
import { ChevronDown, ChevronUp, ChevronRight, MapPin, Package, Truck, AlertTriangle, CheckCircle, ThermometerIcon } from 'lucide-react';
import { colors } from '../../styles/theme/colors';
import BlockchainBadge from '../common/BlockchainBadge';
import { ShipmentCondition } from '@/mocks/api/pharmaceuticals-shipments.mock';

export interface ShipmentEvent {
  id: string;
  timestamp: string;
  type: 'Departure' | 'Arrival' | 'Condition Update' | 'Status Change' | 'Document Added';
  location?: {
    name: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  status?: 'Normal' | 'Warning' | 'Critical';
  data?: {
    temperature?: number;
    humidity?: number;
    condition?: ShipmentCondition;
    newStatus?: string;
    document?: {
      id: string;
      type: string;
      name: string;
      url: string;
      verified: boolean;
    };
  };
  blockchainData: {
    transactionHash: string;
    timestamp: string;
    verified: boolean;
  };
}

interface ShipmentTimelineProps {
  events: ShipmentEvent[];
  onEventClick?: (event: ShipmentEvent) => void;
  onLocationClick?: (location: NonNullable<ShipmentEvent['location']>) => void;
  onDocumentClick?: (document: NonNullable<ShipmentEvent['data']>['document']) => void;
}

const ShipmentTimeline: React.FC<ShipmentTimelineProps> = ({
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

  const getEventIcon = (event: ShipmentEvent) => {
    switch (event.type) {
      case 'Departure':
        return <Truck size={20} />;
      case 'Arrival':
        return <MapPin size={20} />;
      case 'Condition Update':
        return event.status === 'Warning' || event.status === 'Critical' 
          ? <AlertTriangle size={20} />
          : <ThermometerIcon size={20} />;
      case 'Status Change':
        return <CheckCircle size={20} />;
      case 'Document Added':
        return <Package size={20} />;
      default:
        return <Truck size={20} />;
    }
  };

  const getEventColor = (event: ShipmentEvent) => {
    if (event.status === 'Warning') return colors.warning;
    if (event.status === 'Critical') return colors.error;
    
    switch (event.type) {
      case 'Departure':
        return colors.info;
      case 'Arrival':
        return colors.success;
      case 'Condition Update':
        return colors.primary;
      case 'Status Change':
        return colors.warning;
      case 'Document Added':
        return colors.info;
      default:
        return colors.primary;
    }
  };

  const getEventTitle = (event: ShipmentEvent) => {
    switch (event.type) {
      case 'Departure':
        return 'Shipment Departed';
      case 'Arrival':
        return 'Shipment Arrived';
      case 'Condition Update':
        return `Condition Update - ${event.status}`;
      case 'Status Change':
        return `Status Changed to ${event.data?.newStatus}`;
      case 'Document Added':
        return `Document Added - ${event.data?.document?.type}`;
      default:
        return event.type;
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
              bgcolor: getEventColor(event),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `3px solid ${alpha(getEventColor(event), 0.2)}`,
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
                    bgcolor: alpha(getEventColor(event), 0.1),
                    color: getEventColor(event),
                  }}
                >
                  {getEventIcon(event)}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {getEventTitle(event)}
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
            {event.location && (
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
                  if (event.location) {
                    onLocationClick?.(event.location);
                  }
                }}
              >
                <MapPin size={16} />
                <Typography variant="body2">
                  {event.location.name}
                </Typography>
              </Box>
            )}

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
              
              {/* Condition Data */}
              {event.type === 'Condition Update' && event.data?.condition && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Condition Details
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Temperature:</strong> {event.data.condition.temperature}°C
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Humidity:</strong> {event.data.condition.humidity}%
                    </Typography>
                  </Box>
                  {event.data.condition.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Notes:</strong> {event.data.condition.notes}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Document */}
              {event.type === 'Document Added' && event.data?.document && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Document Details
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: onDocumentClick ? 'pointer' : 'default',
                      '&:hover': onDocumentClick ? {
                        color: 'primary.main'
                      } : undefined
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (event.data?.document) {
                        onDocumentClick?.(event.data.document);
                      }
                    }}
                  >
                    <Typography variant="body2">
                      {event.data.document.name}
                    </Typography>
                    <Tooltip title="View Document">
                      <IconButton size="small">
                        <ChevronRight size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )}
            </Collapse>
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default ShipmentTimeline;
