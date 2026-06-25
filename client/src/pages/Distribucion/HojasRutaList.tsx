import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Alert,
  Snackbar,
  Grid
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { distribucionService } from '../../services/distribucion.service';

interface HojaRuta {
  idHojaRuta: number;
  nroHojaRuta: string;
  fechaRuta: string;
  estado: string; // 'Borrador', 'En Camino', 'Completado', 'Anulado'
  observacion?: string;
  idDelivery: number;
  nombreDelivery: string;
  cantidadPedidos: number;
}

interface DetallePedido {
  idDetHojaRuta: number;
  orden: number;
  nroPedido: string;
  nombreCliente: string;
  apellidoCliente: string;
  direccionPedido: string;
  total: number;
  celular?: string;
  telefono?: string;
  observacion?: string;
}

interface DetalleHojaRutaResponse extends HojaRuta {
  pedidos: DetallePedido[];
}

const HojasRutaList: React.FC = () => {
  const [fechaFiltro, setFechaFiltro] = useState<string>('');
  const [hojasRuta, setHojasRuta] = useState<HojaRuta[]>([]);
  const [selectedRuta, setSelectedRuta] = useState<DetalleHojaRutaResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(false);
  
  const idUsuario = 1; // Temporal

  useEffect(() => {
    cargarHojasRuta();
  }, [fechaFiltro]);

  const cargarHojasRuta = async () => {
    setLoading(true);
    try {
      const res = await distribucionService.getHojasRuta(fechaFiltro || undefined);
      if (res.success) {
        setHojasRuta(res.result);
      }
    } catch (err: any) {
      setError('Error al cargar las Hojas de Ruta.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalles = async (idHojaRuta: number) => {
    try {
      const res = await distribucionService.getDetalleHojaRuta(idHojaRuta);
      if (res.success) {
        setSelectedRuta(res.result);
        setDetailOpen(true);
      }
    } catch (err: any) {
      setError('Error al cargar los detalles de la Hoja de Ruta.');
    }
  };

  const handleImprimir = (idHojaRuta: number) => {
    distribucionService.imprimirHojaRuta(idHojaRuta);
    setNotification('Abriendo PDF en una nueva pestaña...');
  };

  const handleAnular = async (idHojaRuta: number) => {
    if (window.confirm('¿Está seguro de que desea anular esta Hoja de Ruta? Todos los pedidos vinculados volverán a estar pendientes de despacho.')) {
      try {
        const res = await distribucionService.anularHojaRuta(idHojaRuta, idUsuario);
        if (res.success) {
          setNotification('Hoja de Ruta anulada exitosamente.');
          cargarHojasRuta();
        }
      } catch (err: any) {
        setError('Error al anular la Hoja de Ruta.');
      }
    }
  };

  const getStatusChip = (estado: string) => {
    let color: 'default' | 'primary' | 'success' | 'error' | 'warning' = 'default';
    switch (estado) {
      case 'Borrador':
        color = 'warning';
        break;
      case 'En Camino':
        color = 'primary';
        break;
      case 'Completado':
        color = 'success';
        break;
      case 'Anulado':
        color = 'error';
        break;
    }
    return <Chip label={estado} color={color} size="small" sx={{ fontWeight: 'bold' }} />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Listado de Hojas de Ruta
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Consulte el historial de despachos, imprima las planillas físicas con código QR o anule rutas creadas.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', mb: 4 }}>
        {/* Filtros */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            label="Filtrar por Fecha"
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ width: '200px' }}
          />
          {fechaFiltro && (
            <Button size="small" variant="text" onClick={() => setFechaFiltro('')}>
              Limpiar Filtro
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="primary" onClick={cargarHojasRuta}>
            <SearchIcon />
          </IconButton>
        </Stack>

        {/* Tabla de Hojas de Ruta */}
        <TableContainer sx={{ maxHeight: '450px' }}>
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Nro. Planilla</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Repartidor</TableCell>
                <TableCell sx={{ fontWeight: 'bold', align: 'center' }}>Pedidos</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Cargando hojas de ruta...
                  </TableCell>
                </TableRow>
              ) : hojasRuta.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No se encontraron Hojas de Ruta para el criterio de búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                hojasRuta.map((hr) => (
                  <TableRow key={hr.idHojaRuta} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{hr.nroHojaRuta}</TableCell>
                    <TableCell>{new Date(hr.fechaRuta).toLocaleDateString('es-PY')}</TableCell>
                    <TableCell>{hr.nombreDelivery}</TableCell>
                    <TableCell align="center">
                      <Chip label={hr.cantidadPedidos} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{getStatusChip(hr.estado)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton color="info" size="small" onClick={() => handleVerDetalles(hr.idHojaRuta)}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleImprimir(hr.idHojaRuta)}
                          disabled={hr.estado === 'Anulado'}
                        >
                          <PrintIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleAnular(hr.idHojaRuta)}
                          disabled={hr.estado === 'Anulado'}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal de Detalle */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        {selectedRuta && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
              Planilla de Entregas: {selectedRuta.nroHojaRuta}
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" display="block" color="text.secondary">Repartidor</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedRuta.nombreDelivery}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" display="block" color="text.secondary">Fecha de Ruta</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {new Date(selectedRuta.fechaRuta).toLocaleDateString('es-PY')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" display="block" color="text.secondary">Estado</Typography>
                  <Box sx={{ mt: 0.5 }}>{getStatusChip(selectedRuta.estado)}</Box>
                </Grid>
                {selectedRuta.observacion && (
                  <Grid size={12}>
                    <Typography variant="caption" display="block" color="text.secondary">Observaciones</Typography>
                    <Typography variant="body2">{selectedRuta.observacion}</Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }} color="primary">
                Detalle de Paradas de Entrega ({selectedRuta.pedidos.length})
              </Typography>

              <List dense>
                {selectedRuta.pedidos.map((p, idx) => (
                  <React.Fragment key={p.idDetHojaRuta}>
                    <ListItem sx={{ py: 1.5 }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                        <Box sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}>
                          {p.orden}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {p.nroPedido || `Pedido #${p.idPedido}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cliente: {p.nombreCliente}{p.apellidoCliente ? ' ' + p.apellidoCliente : ''}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            Dirección: {p.direccionPedido}
                          </Typography>
                          {p.celular && (
                            <Typography variant="caption" display="block" color="text.primary">
                              Cel: {p.celular}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {Number(p.totalPedido || p.total || 0).toLocaleString('es-PY')} ₲
                          </Typography>
                        </Box>
                      </Stack>
                    </ListItem>
                    {idx < selectedRuta.pedidos.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDetailOpen(false)}>Cerrar</Button>
              <Button
                onClick={() => handleImprimir(selectedRuta.idHojaRuta)}
                variant="contained"
                startIcon={<PrintIcon />}
                disabled={selectedRuta.estado === 'Anulado'}
              >
                Imprimir PDF
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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

export default HojasRutaList;
