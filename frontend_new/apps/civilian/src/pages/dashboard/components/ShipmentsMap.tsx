import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Shipment } from '../types';

interface ShipmentsMapProps {
  shipments: Shipment[];
  type: 'inbound' | 'outbound';
  onTypeChange: (type: 'inbound' | 'outbound') => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 39.8283,
  lng: -98.5795,
};

const getMarkerColor = (status: Shipment['status']) => {
  switch (status) {
    case 'delivered':
      return '#388E3C';
    case 'in_transit':
      return '#FBC02D';
    case 'delayed':
      return '#D32F2F';
    default:
      return '#1976D2';
  }
};

export const ShipmentsMap: React.FC<ShipmentsMapProps> = ({
  shipments,
  type,
  onTypeChange,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Recent Shipments</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              label="Type"
              onChange={(e) => onTypeChange(e.target.value as 'inbound' | 'outbound')}
            >
              <MenuItem value="inbound">Inbound</MenuItem>
              <MenuItem value="outbound">Outbound</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={4}
            options={{
              styles: [
                {
                  featureType: 'all',
                  elementType: 'all',
                  stylers: [{ saturation: -100 }],
                },
              ],
            }}
          >
            {shipments.map((shipment) => (
              <Marker
                key={shipment.id}
                position={shipment.coordinates}
                title={`${shipment.destination}: ${shipment.details}`}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: getMarkerColor(shipment.status),
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: '#FFFFFF',
                  scale: 8,
                }}
              />
            ))}
          </GoogleMap>
        ) : (
          <Box
            sx={{
              height: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography>Loading map...</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}; 