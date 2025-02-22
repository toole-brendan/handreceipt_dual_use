import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import { History, Package, Truck, Microscope, Archive, Check } from 'lucide-react';
import { ProvenanceEvent } from '@/mocks/api/blockchain-data.mock';

interface TimelineViewProps {
  events: ProvenanceEvent[];
}

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'manufactured':
      return <Package size={20} />;
    case 'shipped':
      return <Truck size={20} />;
    case 'inspected':
      return <Microscope size={20} />;
    case 'stored':
      return <Archive size={20} />;
    case 'delivered':
      return <Check size={20} />;
    default:
      return <History size={20} />;
  }
};

const getEventColor = (eventType: string) => {
  switch (eventType) {
    case 'manufactured':
      return '#4caf50';
    case 'shipped':
      return '#f44336';
    case 'inspected':
      return '#ff9800';
    case 'stored':
      return '#9c27b0';
    case 'delivered':
      return '#4caf50';
    default:
      return '#2196f3';
  }
};

const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  return (
    <Box>
      {events.map((event, index) => (
        <Box
          key={event.id}
          sx={{
            display: 'flex',
            mb: index < events.length - 1 ? 4 : 0,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: '24px',
              top: '40px',
              bottom: '-32px',
              width: '2px',
              bgcolor: index < events.length - 1 ? 'divider' : 'transparent'
            }
          }}
        >
          {/* Event Icon */}
          <Box
            sx={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: getEventColor(event.eventType),
              color: 'white',
              flexShrink: 0,
              zIndex: 1
            }}
          >
            {getEventIcon(event.eventType)}
          </Box>

          {/* Event Content */}
          <Box sx={{ ml: 3, flex: 1 }}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Stack spacing={1}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle1">
                    {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(event.timestamp).toLocaleString()}
                  </Typography>
                </Box>

                {/* Location and Handler */}
                <Box>
                  <Typography>Location: {event.location.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Handler: {event.handler.role} ({event.handler.organization})
                  </Typography>
                </Box>

                {/* Environmental Data */}
                {(event.data.temperature || event.data.humidity) && (
                  <Box>
                    {event.data.temperature && (
                      <Typography variant="body2">
                        Temperature: {event.data.temperature}°C
                      </Typography>
                    )}
                    {event.data.humidity && (
                      <Typography variant="body2">
                        Humidity: {event.data.humidity}%
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Notes */}
                {event.data.notes && (
                  <Typography variant="body2" color="text.secondary">
                    {event.data.notes}
                  </Typography>
                )}

                {/* Blockchain Info */}
                <Stack direction="row" spacing={1}>
                  <Chip
                    size="small"
                    label={`Block #${event.blockchainRef.blockNumber}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={event.complianceStatus}
                    color={
                      event.complianceStatus === 'compliant'
                        ? 'success'
                        : event.complianceStatus === 'non-compliant'
                        ? 'error'
                        : 'warning'
                    }
                    variant="outlined"
                  />
                </Stack>

                {/* Documents */}
                {event.data.documentRefs && event.data.documentRefs.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {event.data.documentRefs.map((ref, i) => (
                      <Chip
                        key={i}
                        size="small"
                        label={ref}
                        onClick={() => window.open(`https://example.com/docs/${ref}`, '_blank')}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default TimelineView;
