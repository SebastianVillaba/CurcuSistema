import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  Paper,
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import SaveIcon from '@mui/icons-material/Save';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { distribucionService } from '../../services/distribucion.service';
import { deliveryService } from '../../services/delivery.service';

// Coordenadas por defecto (Asunción, Paraguay)
const DEFAULT_POSITION: [number, number] = [-27.334077, -55.865307];

interface Zona {
  idZonaEntrega?: number;
  nombre: string;
  descripcion?: string;
  color: string;
  limites: [number, number][];
  costoEnvio: number;
  idDeliveryDefecto?: number;
  nombreDeliveryDefecto?: string;
}

interface DeliveryDriver {
  idDelivery: number;
  nombreDelivery: string; // Adaptado al SP sp_listarZonasEntrega / v_delivery
}

const ZonasEntrega: React.FC = () => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryDriver[]>([]);
  
  // Estado para el formulario de nueva zona
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [color, setColor] = useState('#3f51b5');
  const [costoEnvio, setCostoEnvio] = useState<number>(0);
  const [idDeliveryDefecto, setIdDeliveryDefecto] = useState<number | ''>('');
  const [limites, setLimites] = useState<[number, number][]>([]);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  
  const idUsuario = 1; // Temporal, de autenticación

  // Refs para Vanilla Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const zonasLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const dibujoLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Guardar ref mutable del estado de dibujo para el callback del mapa
  const isDrawingRef = useRef(isDrawing);
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  useEffect(() => {
    cargarZonas();
    cargarDeliveries();
  }, []);

  // Inicializar el mapa de forma nativa
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView(DEFAULT_POSITION, 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // Crear grupos de capas para organizar las zonas y el dibujo activo
      zonasLayerGroupRef.current = L.layerGroup().addTo(map);
      dibujoLayerGroupRef.current = L.layerGroup().addTo(map);

      // Listener nativo de clics para dibujar
      map.on('click', (e) => {
        if (isDrawingRef.current) {
          const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
          setLimites(prev => [...prev, newPoint]);
        }
      });

      mapRef.current = map;

      // Invalida el tamaño del mapa para asegurar un renderizado correcto al montar la página
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        zonasLayerGroupRef.current = null;
        dibujoLayerGroupRef.current = null;
      }
    };
  }, []);

  // Sincronizar zonas guardadas en el mapa
  useEffect(() => {
    if (zonasLayerGroupRef.current) {
      zonasLayerGroupRef.current.clearLayers();
      
      zonas.forEach(zona => {
        if (zona.limites && zona.limites.length > 0) {
          const polygon = L.polygon(zona.limites, {
            color: zona.color,
            fillColor: zona.color,
            fillOpacity: 0.25
          });
          
          polygon.bindPopup(`
            <strong>${zona.nombre}</strong><br/>
            Costo Envío: ${zona.costoEnvio.toLocaleString('es-PY')} ₲<br/>
            Repartidor: ${zona.nombreDeliveryDefecto || 'Ninguno'}
          `);
          
          zonasLayerGroupRef.current?.addLayer(polygon);
        }
      });
    }
  }, [zonas]);

  // Sincronizar estado de dibujo activo en el mapa
  useEffect(() => {
    if (dibujoLayerGroupRef.current) {
      dibujoLayerGroupRef.current.clearLayers();

      if (limites.length > 0) {
        // Dibujar polígono en progreso
        if (limites.length >= 2) {
          const poly = L.polygon(limites, {
            color: color,
            fillColor: color,
            fillOpacity: 0.4,
            dashArray: '5, 5'
          });
          dibujoLayerGroupRef.current.addLayer(poly);
        }

        // Dibujar pequeños pins en los vértices
        limites.forEach(point => {
          const circleMarker = L.circleMarker(point, {
            radius: 5,
            color: color,
            fillColor: '#fff',
            fillOpacity: 1,
            weight: 2
          });
          dibujoLayerGroupRef.current?.addLayer(circleMarker);
        });
      }
    }
  }, [limites, color]);

  const cargarZonas = async () => {
    try {
      const res = await distribucionService.getZonas();
      if (res.success) {
        setZonas(res.result);
      }
    } catch (err: any) {
      setError('Error al cargar las zonas de entrega.');
    }
  };

  const cargarDeliveries = async () => {
    try {
      const data = await deliveryService.getDeliveryActivo();
      setDeliveries(data);
    } catch (err: any) {
      console.error('Error al cargar repartidores:', err);
    }
  };

  const handleIniciarDibujo = () => {
    setIsDrawing(true);
    setLimites([]);
    setNotification('Haga clics en el mapa para marcar los límites de la zona. Se requiere un mínimo de 3 puntos.');
  };

  const handleLimpiarDibujo = () => {
    setLimites([]);
    setIsDrawing(false);
    setNotification('');
  };

  const handleGuardarZona = async () => {
    if (!nombre.trim()) {
      setError('El nombre de la zona es obligatorio.');
      return;
    }
    if (limites.length < 3) {
      setError('Debe dibujar un polígono de al menos 3 vértices en el mapa.');
      return;
    }

    try {
      const res = await distribucionService.guardarZona({
        nombre,
        descripcion: descripcion || undefined,
        color,
        limites,
        costoEnvio,
        idDeliveryDefecto: idDeliveryDefecto || undefined,
        idUsuario
      });

      if (res.success) {
        setNotification('Zona de entrega guardada exitosamente.');
        setNombre('');
        setDescripcion('');
        setColor('#3f51b5');
        setCostoEnvio(0);
        setIdDeliveryDefecto('');
        setLimites([]);
        setIsDrawing(false);
        cargarZonas();
      }
    } catch (err: any) {
      setError('Error al guardar la zona de entrega.');
    }
  };

  const handleEliminarZona = async (idZona: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta zona de entrega?')) {
      try {
        const res = await distribucionService.eliminarZona(idZona, idUsuario);
        if (res.success) {
          setNotification('Zona de entrega de baja.');
          cargarZonas();
        }
      } catch (err: any) {
        setError('Error al eliminar la zona.');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Zonas de Entrega
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Defina los límites geográficos de sus zonas de reparto para calcular costos de envío y asignar repartidores automáticamente.
      </Typography>

      <Grid container spacing={4}>
        {/* Panel Formulario */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3} sx={{ borderRadius: '12px' }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                Nueva Zona de Reparto
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <TextField
                  label="Nombre de la Zona"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Descripción (Opcional)"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  size="small"
                  multiline
                  rows={2}
                  fullWidth
                />
                <TextField
                  label="Costo de Envío"
                  type="number"
                  value={costoEnvio}
                  onChange={(e) => setCostoEnvio(Number(e.target.value))}
                  size="small"
                  fullWidth
                />
                <FormControl size="small" fullWidth>
                  <InputLabel>Repartidor por Defecto</InputLabel>
                  <Select
                    value={idDeliveryDefecto}
                    onChange={(e) => setIdDeliveryDefecto(e.target.value as number)}
                    label="Repartidor por Defecto"
                  >
                    <MenuItem value="">-- Ninguno --</MenuItem>
                    {deliveries.map((d) => (
                      <MenuItem key={d.idDelivery} value={d.idDelivery}>
                        {d.nombreDelivery}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* Selector de color */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Color en el mapa:
                  </Typography>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{
                      border: 'none',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}
                  />
                </Box>

                <Divider />

                {/* Acciones de dibujo */}
                {!isDrawing ? (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddLocationIcon />}
                    onClick={handleIniciarDibujo}
                    fullWidth
                  >
                    Dibujar Límites
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<LayersClearIcon />}
                      onClick={handleLimpiarDibujo}
                      fullWidth
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<SaveIcon />}
                      onClick={() => setIsDrawing(false)}
                      disabled={limites.length < 3}
                      fullWidth
                    >
                      Listo
                    </Button>
                  </Stack>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleGuardarZona}
                  disabled={isDrawing || limites.length < 3}
                  fullWidth
                >
                  Guardar Zona
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Lista de Zonas Existentes */}
          <Paper elevation={2} sx={{ mt: 3, p: 2, borderRadius: '12px' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Zonas Registradas ({zonas.length})
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <List dense sx={{ maxHeight: '200px', overflow: 'auto' }}>
              {zonas.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                  No hay zonas registradas.
                </Typography>
              ) : (
                zonas.map((z) => (
                  <ListItem
                    key={z.idZonaEntrega}
                    secondaryAction={
                      <IconButton edge="end" color="error" onClick={() => handleEliminarZona(z.idZonaEntrega!)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: z.color,
                        mr: 1.5,
                        flexShrink: 0
                      }}
                    />
                    <ListItemText
                      primary={z.nombre}
                      secondary={`Costo: ${z.costoEnvio.toLocaleString('es-PY')} ₲`}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Panel Mapa */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={3} sx={{ p: 1, borderRadius: '12px', height: '550px', overflow: 'hidden' }}>
            <div ref={mapContainerRef} style={{ width: '100%', height: '532px', borderRadius: '12px' }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Alertas y Notificaciones */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setNotification('')} severity="info" sx={{ width: '100%' }}>
          {notification}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ZonasEntrega;
