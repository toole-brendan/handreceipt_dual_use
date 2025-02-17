import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Map, { MapRef, Marker, Popup } from 'react-map-gl';
import type { MapboxEvent, ViewState } from 'react-map-gl';
import { MapPin, Package, Flag } from 'lucide-react';
import { colors } from '@/styles/theme/colors';
import { PharmaceuticalShipment, getShipmentById } from '@/mocks/api/pharmaceuticals-shipments.mock';
import { PharmaceuticalLocation, getLocationById } from '@/mocks/api/pharmaceuticals-locations.mock';
import 'mapbox-gl/dist/mapbox-gl.css';

// For development, we'll use a public token. In production, this should come from environment variables
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGxxN2VwdzQwMTJ3M2ZvYzFjYWZkdGp4In0.3DXfR5E1nnBJ8ZgsnJ7N1g';

interface LocationWithCoords {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'origin' | 'destination' | 'current';
}

interface ShipmentMapProps {
  shipments: PharmaceuticalShipment[];
}

const ShipmentMap: React.FC<ShipmentMapProps> = ({ shipments }) => {
  const theme = useTheme();
  const [popupInfo, setPopupInfo] = useState<PharmaceuticalShipment | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const activeShipments = shipments.filter(s => s.status === 'In Transit');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<MapRef>(null);
  const [viewState, setViewState] = useState<Partial<ViewState>>({
    latitude: 0,
    longitude: 0,
    zoom: 1,
    bearing: 0,
    pitch: 0
  });

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Get all locations for active shipments
  const locations = useMemo(() => {
    const allLocations: LocationWithCoords[] = [];

    activeShipments.forEach(shipment => {
      // Get origin location
      const originLocation = getLocationById(shipment.fromLocationId);
      if (originLocation) {
        allLocations.push({
          id: originLocation.id,
          name: originLocation.name,
          latitude: 35.7796, // Mock coordinates for example area
          longitude: -78.6382,
          type: 'origin'
        });
      }

      // Get destination location
      const destinationLocation = getLocationById(shipment.toLocationId);
      if (destinationLocation) {
        allLocations.push({
          id: destinationLocation.id,
          name: destinationLocation.name,
          latitude: 35.8283, // Mock coordinates for example area
          longitude: -78.6421,
          type: 'destination'
        });
      }

      // Get current location from conditions
      const currentLocation = shipment.conditions[shipment.conditions.length - 1]?.location;
      if (currentLocation) {
        allLocations.push({
          id: `current-${shipment.id}`,
          name: 'Current Location',
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          type: 'current'
        });
      }
    });

    return allLocations;
  }, [activeShipments]);

  // Calculate and set initial view state based on locations
  useEffect(() => {
    if (locations.length === 0) {
      setViewState({
        latitude: 0,
        longitude: 0,
        zoom: 1,
        bearing: 0,
        pitch: 0
      });
      return;
    }

    const points = locations.map(loc => [loc.longitude, loc.latitude]);
    const bounds = points.reduce(
      (bounds, coord) => {
        bounds.minLng = Math.min(bounds.minLng, coord[0]);
        bounds.maxLng = Math.max(bounds.maxLng, coord[0]);
        bounds.minLat = Math.min(bounds.minLat, coord[1]);
        bounds.maxLat = Math.max(bounds.maxLat, coord[1]);
        return bounds;
      },
      { minLng: 180, maxLng: -180, minLat: 90, maxLat: -90 }
    );

    setViewState({
      longitude: (bounds.minLng + bounds.maxLng) / 2,
      latitude: (bounds.minLat + bounds.maxLat) / 2,
      zoom: 8,
      bearing: 0,
      pitch: 0
    });
  }, [locations]);

  const handleMarkerClick = useCallback((shipment: PharmaceuticalShipment) => {
    setPopupInfo(shipment);
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        width: '100%',
        minHeight: 400,
        position: 'relative',
        '& .mapboxgl-map': {
          borderRadius: 1,
        }
      }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          style={{ width: dimensions.width, height: dimensions.height }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          {locations.map(location => (
            <Marker
              key={`${location.id}-${location.type}`}
              longitude={location.longitude}
              latitude={location.latitude}
            >
              <Box
                sx={{
                  color: location.type === 'origin' ? colors.success :
                         location.type === 'destination' ? colors.primary :
                         colors.warning,
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.2)' }
                }}
                onClick={() => {
                  const shipment = activeShipments.find(s => 
                    s.fromLocationId === location.id || 
                    s.toLocationId === location.id || 
                    (location.type === 'current' && location.id.startsWith(`current-${s.id}`))
                  );
                  if (shipment) {
                    handleMarkerClick(shipment);
                  }
                }}
              >
                {location.type === 'origin' ? <Package size={24} /> :
                 location.type === 'destination' ? <Flag size={24} /> :
                 <MapPin size={24} />}
              </Box>
            </Marker>
          ))}

          {popupInfo && (() => {
            const latestCondition = popupInfo.conditions[popupInfo.conditions.length - 1];
            const location = latestCondition?.location;
            
            if (!location) return null;
            
            return (
              <Popup
                longitude={location.longitude}
                latitude={location.latitude}
                closeButton={true}
                closeOnClick={false}
                onClose={() => setPopupInfo(null)}
              >
                <Paper sx={{ p: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {popupInfo.referenceNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {popupInfo.carrier.name}
                    {popupInfo.carrier.trackingNumber && ` - ${popupInfo.carrier.trackingNumber}`}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {latestCondition && (
                      <>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Temperature: {latestCondition.temperature}°{popupInfo.temperature.unit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Humidity: {latestCondition.humidity}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Status: {latestCondition.status}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Paper>
              </Popup>
            );
          })()}
        </Map>
      )}

      {activeShipments.length === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No active shipments to display
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ShipmentMap;
