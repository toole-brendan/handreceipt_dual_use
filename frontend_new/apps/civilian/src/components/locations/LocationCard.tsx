import React from 'react';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Thermometer,
  Droplets,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  WrenchIcon,
  XCircle,
  MapPin,
  Edit,
} from 'lucide-react';
import { PharmaceuticalLocation } from '@/mocks/api/pharmaceuticals-locations.mock';
import DashboardCard from '@/components/common/DashboardCard';
import { alpha, useTheme } from '@mui/material/styles';

interface LocationCardProps {
  location: PharmaceuticalLocation;
  onEdit?: (location: PharmaceuticalLocation) => void;
  onClick?: (location: PharmaceuticalLocation) => void;
}

const getStatusColor = (status: PharmaceuticalLocation['status']) => {
  switch (status) {
    case 'Operational':
      return 'success';
    case 'Maintenance':
      return 'warning';
    case 'Shutdown':
      return 'error';
    case 'Alert':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: PharmaceuticalLocation['status']) => {
  switch (status) {
    case 'Operational':
      return <CheckCircle size={16} />;
    case 'Maintenance':
      return <WrenchIcon size={16} />;
    case 'Shutdown':
      return <XCircle size={16} />;
    case 'Alert':
      return <AlertTriangle size={16} />;
    default:
      return null;
  }
};

const getSecurityLevelColor = (level: PharmaceuticalLocation['securityLevel']) => {
  switch (level) {
    case 'High':
      return 'error';
    case 'Medium':
      return 'warning';
    case 'Standard':
      return 'info';
    default:
      return 'default';
  }
};

const LocationCard: React.FC<LocationCardProps> = ({ location, onEdit, onClick }) => {
  const theme = useTheme();
  const capacityPercentage = (location.capacity.used / location.capacity.total) * 100;
  const isTemperatureInRange = 
    location.temperature.current >= location.temperature.min && 
    location.temperature.current <= location.temperature.max;
  const isHumidityInRange = 
    location.humidity.current >= location.humidity.min && 
    location.humidity.current <= location.humidity.max;

  const handleClick = () => {
    if (onClick) {
      onClick(location);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(location);
    }
  };

  return (
    <DashboardCard
      title={location.name}
      action={
        onEdit && (
          <IconButton onClick={handleEdit} size="small">
            <Edit size={16} />
          </IconButton>
        )
      }
      onClick={onClick ? handleClick : undefined}
      variant={onClick ? 'outlined' : 'default'}
    >
      <Box sx={{ p: 2 }}>
        {/* Status and Type */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            icon={<Box component="span">{getStatusIcon(location.status)}</Box>}
            label={location.status}
            color={getStatusColor(location.status)}
            size="small"
          />
          <Chip
            label={location.type}
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Address */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <MapPin size={16} />
          <Typography variant="body2" color="text.secondary">
            {location.address}
          </Typography>
        </Box>

        {/* Capacity */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Capacity Usage
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {location.capacity.used} / {location.capacity.total} {location.capacity.unit}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={capacityPercentage}
            color={capacityPercentage > 90 ? 'error' : capacityPercentage > 75 ? 'warning' : 'primary'}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>

        {/* Environmental Conditions */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: alpha(
                  isTemperatureInRange ? theme.palette.success.main : theme.palette.error.main,
                  0.1
                ),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Thermometer size={16} />
                <Typography variant="body2">Temperature</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Current: {location.temperature.current}°{location.temperature.unit}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Range: {location.temperature.min}° - {location.temperature.max}°{location.temperature.unit}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: alpha(
                  isHumidityInRange ? theme.palette.success.main : theme.palette.error.main,
                  0.1
                ),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Droplets size={16} />
                <Typography variant="body2">Humidity</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Current: {location.humidity.current}{location.humidity.unit}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Range: {location.humidity.min} - {location.humidity.max}{location.humidity.unit}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Footer Info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar size={16} />
            <Typography variant="body2" color="text.secondary">
              Last Inspection: {new Date(location.lastInspectionDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Shield size={16} />
            <Chip
              label={`Security: ${location.securityLevel}`}
              color={getSecurityLevelColor(location.securityLevel)}
              size="small"
            />
          </Box>
        </Box>

        {/* Certifications */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Certifications
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {location.certifications.map((cert, index) => (
              <Chip
                key={index}
                label={cert}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default LocationCard;
