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
  Chip,
  ListItemAvatar,
  Avatar,
  Stack
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { distribucionService } from '../../services/distribucion.service';
import { deliveryService } from '../../services/delivery.service';

// Coordenadas por defecto (Asunción, Paraguay)
const DEFAULT_POSITION: [number, number] = [-27.334077, -55.865307];

interface Order {
  idPedido: number;
  nroPedido: string;
  fecha: string;
  fechaEntrega: string;
  total: number;
  totalPedido: number;
  direccionPedido: string;
  idCliente: number;
  idPersona: number;
  nombreCliente: string;
  apellidoCliente?: string;
  telefono?: string;
  celular?: string;
  latitud?: number;
  longitud?: number;
  idDelivery?: number;
  observacion?: string;
  
  // Propiedades calculadas en frontend
  zonaCalculada?: string;
  colorZona?: string;
}

interface Zona {
  idZonaEntrega: number;
  nombre: string;
  color: string;
  limites: [number, number][];
  costoEnvio: number;
  idDeliveryDefecto?: number;
}

interface DeliveryDriver {
  idDelivery: number;
  nombreDelivery: string; // v_delivery
}

// Algoritmo Ray-Casting para comprobar si un punto está dentro de un polígono
const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const DespachoPedidos: React.FC = () => {
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [pedidosPendientes, setPedidosPendientes] = useState<Order[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryDriver[]>([]);
  
  // Estado para la hoja de ruta en creación
  const [idDelivery, setIdDelivery] = useState<number | ''>('');
  const [observacion, setObservacion] = useState('');
  const [pedidosAsignados, setPedidosAsignados] = useState<Order[]>([]);
  
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(false);
  
  const idUsuario = 1; // Temporal

  // Refs para Vanilla Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const zonasLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const pedidosLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Refs mutables para callbacks de Leaflet (evitar cierres obsoletos de react)
  const handlersRef = useRef({
    agregar: (pedido: Order) => {},
    quitar: (id: number) => {},
    asignados: [] as Order[],
    pedidosPendientes: [] as Order[]
  });

  useEffect(() => {
    handlersRef.current.agregar = handleAgregarPedido;
    handlersRef.current.quitar = handleQuitarPedido;
    handlersRef.current.asignados = pedidosAsignados;
    handlersRef.current.pedidosPendientes = pedidosPendientes;
  }, [pedidosAsignados, pedidosPendientes]);

  useEffect(() => {
    cargarZonasYDeliveries();
  }, []);

  useEffect(() => {
    if (fecha) {
      cargarPedidos();
    }
  }, [fecha, zonas]);

  // Inicializar mapa nativo
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView(DEFAULT_POSITION, 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      zonasLayerGroupRef.current = L.layerGroup().addTo(map);
      pedidosLayerGroupRef.current = L.layerGroup().addTo(map);

      // Vincular eventos nativos de popups dinámicos
      map.on('popupopen', (e) => {
        const popup = e.popup;
        const container = popup.getElement();
        if (container) {
          const btnAdd = container.querySelector('.btn-popup-add') as HTMLButtonElement;
          const btnRemove = container.querySelector('.btn-popup-remove') as HTMLButtonElement;
          
          if (btnAdd) {
            const pedidoId = parseInt(btnAdd.getAttribute('data-id') || '0', 10);
            const pedido = handlersRef.current.pedidosPendientes.find(p => p.idPedido === pedidoId);
            if (pedido) {
              btnAdd.onclick = () => {
                handlersRef.current.agregar(pedido);
                map.closePopup();
              };
            }
          }
          
          if (btnRemove) {
            const pedidoId = parseInt(btnRemove.getAttribute('data-id') || '0', 10);
            btnRemove.onclick = () => {
              handlersRef.current.quitar(pedidoId);
              map.closePopup();
            };
          }
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
        pedidosLayerGroupRef.current = null;
      }
    };
  }, []); // Solo se inicializa una vez para evitar parpadeos y pérdida de estado

  // Sincronizar zonas en el mapa
  useEffect(() => {
    if (zonasLayerGroupRef.current) {
      zonasLayerGroupRef.current.clearLayers();
      zonas.forEach(zona => {
        if (zona.limites && zona.limites.length > 0) {
          const poly = L.polygon(zona.limites, {
            color: zona.color,
            fillColor: zona.color,
            fillOpacity: 0.15
          });
          zonasLayerGroupRef.current?.addLayer(poly);
        }
      });
    }
  }, [zonas]);

  // Sincronizar marcadores de pedidos en el mapa
  useEffect(() => {
    if (pedidosLayerGroupRef.current && mapRef.current) {
      pedidosLayerGroupRef.current.clearLayers();

      pedidosPendientes.forEach(p => {
        if (p.latitud && p.longitud) {
          const pos: [number, number] = [Number(p.latitud), Number(p.longitud)];
          const estaAsignado = pedidosAsignados.some(pa => pa.idPedido === p.idPedido);
          
          const colorMarker = estaAsignado ? '#3f51b5' : p.colorZona;
          
          const markerIcon = L.divIcon({
            className: 'custom-order-icon',
            html: `
              <div style="
                background-color: ${colorMarker};
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.4);
                display: flex;
                justify-content: center;
                align-items: center;
                color: white;
                font-size: 9px;
                font-weight: bold;
              ">
                ${estaAsignado ? '✓' : '•'}
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker(pos, { icon: markerIcon });

          const popupContent = `
            <div style="font-family: Roboto, Helvetica, Arial, sans-serif; min-width: 180px; padding: 4px;">
              <strong style="font-size: 13px; display: block; margin-bottom: 2px;">
                ${p.nroPedido || `Pedido #${p.idPedido}`}
              </strong>
              <span style="font-weight: bold; color: #1976d2; font-size: 12px; display: block; margin-bottom: 4px;">
                Total: ${Number(p.totalPedido || p.total || 0).toLocaleString('es-PY')} ₲
              </span>
              <span style="font-size: 11px; color: #555; display: block;">
                Cliente: ${p.nombreCliente}${p.apellidoCliente ? ' ' + p.apellidoCliente : ''}
              </span>
              <span style="font-size: 11px; color: #555; display: block; margin-bottom: 6px;">
                Dirección: ${p.direccionPedido}
              </span>
              <span style="font-size: 10px; color: #777; display: block; margin-bottom: 8px;">
                Zona: ${p.zonaCalculada}
              </span>
              ${estaAsignado 
                ? `<button class="btn-popup-remove" data-id="${p.idPedido}" style="width: 100%; border: none; background-color: #d32f2f; color: white; padding: 6px; border-radius: 4px; font-weight: bold; cursor: pointer;">Quitar de Ruta</button>`
                : `<button class="btn-popup-add" data-id="${p.idPedido}" style="width: 100%; border: none; background-color: #2e7d32; color: white; padding: 6px; border-radius: 4px; font-weight: bold; cursor: pointer;">Asignar a Ruta</button>`
              }
            </div>
          `;

          marker.bindPopup(popupContent);
          pedidosLayerGroupRef.current?.addLayer(marker);
        }
      });
    }
  }, [pedidosPendientes, pedidosAsignados]);

  const cargarZonasYDeliveries = async () => {
    try {
      const resZonas = await distribucionService.getZonas();
      if (resZonas.success) {
        setZonas(resZonas.result);
      }
      const dataDeliveries = await deliveryService.getDeliveryActivo();
      setDeliveries(dataDeliveries);
    } catch (err: any) {
      console.error('Error al inicializar datos:', err);
    }
  };

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const res = await distribucionService.getPedidosPendientes(fecha);
      if (res.success) {
        const pedidosConZonas = res.result.map((p: Order) => {
          if (p.latitud && p.longitud) {
            const lat = Number(p.latitud);
            const lng = Number(p.longitud);
            const zonaEncontrada = zonas.find(z => isPointInPolygon([lat, lng], z.limites));
            
            if (zonaEncontrada) {
              return {
                ...p,
                zonaCalculada: zonaEncontrada.nombre,
                colorZona: zonaEncontrada.color
              };
            }
          }
          return {
            ...p,
            zonaCalculada: 'Sin Zona / Fuera de límite',
            colorZona: '#9e9e9e'
          };
        });
        setPedidosPendientes(pedidosConZonas);
      }
    } catch (err: any) {
      setError('Error al cargar pedidos pendientes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryChange = (deliveryId: number) => {
    setIdDelivery(deliveryId);
    
    const zonaDelRepartidor = zonas.find(z => z.idDeliveryDefecto === deliveryId);
    if (zonaDelRepartidor) {
      const pedidosSugeridos = pedidosPendientes.filter(p => 
        p.zonaCalculada === zonaDelRepartidor.nombre && 
        !pedidosAsignados.some(pa => pa.idPedido === p.idPedido)
      );
      
      if (pedidosSugeridos.length > 0) {
        setNotification(`Se detectaron ${pedidosSugeridos.length} pedidos en la zona de este repartidor. Agregados a la Hoja de Ruta.`);
        setPedidosAsignados(prev => [...prev, ...pedidosSugeridos]);
      }
    }
  };

  const handleAgregarPedido = (pedido: Order) => {
    setPedidosAsignados(prev => {
      if (prev.some(p => p.idPedido === pedido.idPedido)) return prev;
      return [...prev, pedido];
    });
  };

  const handleQuitarPedido = (idPedido: number) => {
    setPedidosAsignados(prev => prev.filter(p => p.idPedido !== idPedido));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(pedidosAsignados);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setPedidosAsignados(items);
  };

  const handleGuardarHojaRuta = async () => {
    if (!idDelivery) {
      setError('Debe seleccionar un repartidor para la Hoja de Ruta.');
      return;
    }
    if (pedidosAsignados.length === 0) {
      setError('Debe asignar al menos un pedido a la Hoja de Ruta.');
      return;
    }

    try {
      const payload = {
        idDelivery: Number(idDelivery),
        fechaRuta: fecha,
        observacion: observacion || undefined,
        idUsuario,
        pedidos: pedidosAsignados.map((p, index) => ({
          idPedido: p.idPedido,
          orden: index + 1
        }))
      };

      const res = await distribucionService.guardarHojaRuta(payload);
      
      if (res.success) {
        setNotification(`Hoja de Ruta ${res.result.nroHojaRuta} creada exitosamente. Iniciando descarga del PDF...`);
        
        distribucionService.imprimirHojaRuta(res.result.idHojaRuta);
        
        setIdDelivery('');
        setObservacion('');
        setPedidosAsignados([]);
        
        cargarPedidos();
      }
    } catch (err: any) {
      setError('Error al guardar la Hoja de Ruta.');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Despacho de Pedidos
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Planifique las entregas diarias, asigne pedidos a repartidores en un mapa interactivo y ordene las secuencias de entrega mediante drag-and-drop.
      </Typography>

      <Grid container spacing={3}>
        {/* Panel Izquierdo: Lista de Pedidos Pendientes */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', height: '650px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }} color="primary">
              Pedidos del Día
            </Typography>
            
            <TextField
              label="Fecha de Entrega"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {loading ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
                  Cargando pedidos...
                </Typography>
              ) : pedidosPendientes.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
                  No hay pedidos pendientes para la fecha seleccionada.
                </Typography>
              ) : (
                <List dense>
                  {pedidosPendientes.map((p) => {
                    const estaAsignado = pedidosAsignados.some(pa => pa.idPedido === p.idPedido);
                    return (
                      <ListItem
                        key={p.idPedido}
                        sx={{
                          mb: 1,
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0',
                          bgcolor: estaAsignado ? 'rgba(0, 0, 0, 0.04)' : 'background.paper',
                          opacity: estaAsignado ? 0.6 : 1
                        }}
                        secondaryAction={
                          estaAsignado ? (
                            <IconButton edge="end" color="error" size="small" onClick={() => handleQuitarPedido(p.idPedido)}>
                              <RemoveIcon />
                            </IconButton>
                          ) : (
                            <IconButton edge="end" color="success" size="small" onClick={() => handleAgregarPedido(p)}>
                              <AddIcon />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {p.nroPedido || `Pedido #${p.idPedido}`}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                {Number(p.totalPedido || p.total || 0).toLocaleString('es-PY')} ₲
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="caption" display="block" color="text.primary" sx={{ noWrap: true }}>
                                {p.nombreCliente}{p.apellidoCliente ? ' ' + p.apellidoCliente : ''}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {p.direccionPedido || 'Sin dirección'}
                              </Typography>
                              <Chip
                                label={p.zonaCalculada}
                                size="small"
                                sx={{
                                  mt: 0.5,
                                  height: '18px',
                                  fontSize: '9px',
                                  backgroundColor: p.colorZona + '22',
                                  color: p.colorZona,
                                  border: `1px solid ${p.colorZona}`
                                }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Panel Central: Mapa de Entregas */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={3} sx={{ p: 1, borderRadius: '12px', height: '650px', overflow: 'hidden' }}>
            <div ref={mapContainerRef} style={{ width: '100%', height: '632px', borderRadius: '12px' }} />
          </Paper>
        </Grid>

        {/* Panel Derecho: Planificación de la Hoja de Ruta */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', height: '650px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }} color="primary">
              Armar Hoja de Ruta
            </Typography>

            <Stack spacing={2} sx={{ mb: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Asignar Repartidor</InputLabel>
                <Select
                  value={idDelivery}
                  onChange={(e) => handleDeliveryChange(e.target.value as number)}
                  label="Asignar Repartidor"
                >
                  {deliveries.map((d) => (
                    <MenuItem key={d.idDelivery} value={d.idDelivery}>
                      {d.nombreDelivery}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Observaciones de la Ruta (Opcional)"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                size="small"
                fullWidth
              />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Paradas de Entrega ({pedidosAsignados.length})
            </Typography>

            {/* Drag and Drop List */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
              {pedidosAsignados.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', border: '2px dashed #ccc', borderRadius: '8px', p: 3 }}>
                  <LocalShippingIcon sx={{ fontSize: '48px', color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" align="center">
                    Seleccione pedidos del mapa o del listado izquierdo para armar la hoja de ruta.
                  </Typography>
                </Box>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="pedidos-ruta">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {pedidosAsignados.map((p, index) => (
                          <Draggable key={p.idPedido.toString()} draggableId={p.idPedido.toString()} index={index}>
                            {(provided) => (
                              <ListItem
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{
                                  mb: 1,
                                  borderRadius: '8px',
                                  border: '1px solid #e0e0e0',
                                  bgcolor: 'background.paper',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                secondaryAction={
                                  <IconButton edge="end" color="error" size="small" onClick={() => handleQuitarPedido(p.idPedido)}>
                                    <RemoveIcon />
                                  </IconButton>
                                }
                              >
                                <div {...provided.dragHandleProps} style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                                  <DragIndicatorIcon color="action" fontSize="small" />
                                </div>
                                <ListItemAvatar sx={{ minWidth: '36px' }}>
                                  <Avatar sx={{ width: 24, height: 24, fontSize: '11px', bgcolor: 'primary.main', fontWeight: 'bold' }}>
                                    {index + 1}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                      {p.nroPedido || `Pedido #${p.idPedido}`}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ noWrap: true, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {p.nombreCliente} - {p.direccionPedido}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handleGuardarHojaRuta}
              disabled={!idDelivery || pedidosAsignados.length === 0}
              fullWidth
              sx={{ py: 1.2, fontWeight: 'bold', borderRadius: '8px' }}
            >
              Crear e Imprimir Ruta
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Alertas */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setNotification('')} severity="success" sx={{ width: '100%' }}>
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

export default DespachoPedidos;
