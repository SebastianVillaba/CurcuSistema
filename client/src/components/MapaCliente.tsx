import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography } from '@mui/material';

// Importar imágenes de Leaflet directamente para solucionar el error de Vite/Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Aplicar el fix de iconos por defecto de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const DEFAULT_POSITION: [number, number] = [-27.334077, -55.865307];

interface MapaClienteProps {
  latitud?: number;
  longitud?: number;
  onChange: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

const MapaCliente: React.FC<MapaClienteProps> = ({
  latitud,
  longitud,
  onChange,
  readOnly = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Inicializar el mapa una sola vez
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const initialLat = latitud !== undefined && latitud !== null && !isNaN(latitud) ? latitud : DEFAULT_POSITION[0];
      const initialLng = longitud !== undefined && longitud !== null && !isNaN(longitud) ? longitud : DEFAULT_POSITION[1];

      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      const marker = L.marker([initialLat, initialLng], {
        draggable: !readOnly
      }).addTo(map);

      if (!readOnly) {
        marker.on('dragend', () => {
          const latLng = marker.getLatLng();
          onChange(latLng.lat, latLng.lng);
        });
      }

      mapRef.current = map;
      markerRef.current = marker;

      // Invalida el tamaño del mapa para asegurar un renderizado correcto en diálogos/modales
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    // Cleanup al desmontar
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Sincronizar coordenadas cuando cambian externamente
  useEffect(() => {
    if (
      mapRef.current && 
      markerRef.current && 
      latitud !== undefined && 
      longitud !== undefined && 
      latitud !== null && 
      longitud !== null && 
      !isNaN(latitud) && 
      !isNaN(longitud)
    ) {
      const currentLatLng = markerRef.current.getLatLng();
      if (currentLatLng.lat !== latitud || currentLatLng.lng !== longitud) {
        markerRef.current.setLatLng([latitud, longitud]);
        mapRef.current.setView([latitud, longitud], 16);
      }
    }
  }, [latitud, longitud]);

  return (
    <Box sx={{ width: '100%', height: '300px', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '300px', borderRadius: '8px' }} />
      {!readOnly && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          * Arrastre el marcador azul para definir la ubicación exacta de entrega del cliente.
        </Typography>
      )}
    </Box>
  );
};

export default MapaCliente;
