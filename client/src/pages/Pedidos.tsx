import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SearchIcon from '@mui/icons-material/Search';
import SearchClienteModal from '../components/SearchClienteModal';
import type { ItemPedido, Cliente, Pedido, FiltroPedidos } from '../types/pedido.types';

const Pedidos: React.FC = () => {
  // Estados principales
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [cliente, setCliente] = useState<Cliente>({
    nombre: '',
    direccion: '',
    telefono: '',
    documento: '',
    dv: '',
  });
  const [items, setItems] = useState<ItemPedido[]>([]);
  const [delivery, setDelivery] = useState('');
  const [tipoPago, setTipoPago] = useState('');
  const [nroPedido, setNroPedido] = useState('');
  
  // Estados para búsqueda de productos
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  
  // Estados para lista de pedidos del día
  const [pedidosDelDia, setPedidosDelDia] = useState<Pedido[]>([]);
  const [filtros, setFiltros] = useState<FiltroPedidos>({
    fecha: new Date().toISOString().split('T')[0],
    cliente: '',
    tipoCobro: '',
    estadoCobranza: '',
  });

  // Modal de búsqueda de cliente
  const [openClienteModal, setOpenClienteModal] = useState(false);

  // Calcular totales
  const calcularTotales = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const descuentoTotal = items.reduce((sum, item) => sum + item.descuento, 0);
    const total = subtotal - descuentoTotal;
    return { subtotal, descuentoTotal, total };
  };

  const totales = calcularTotales();

  // Atajo de teclado Alt+C para abrir modal de cliente
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        setOpenClienteModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleNuevo = () => {
    setNroPedido('');
    setCliente({
      nombre: '',
      direccion: '',
      telefono: '',
      documento: '',
      dv: '',
    });
    setItems([]);
    setDelivery('');
    setTipoPago('');
    setTerminoBusqueda('');
  };

  const handleGuardar = () => {
    // TODO: Implementar guardado de pedido
    console.log('Guardar pedido');
  };

  const handleImprimir = () => {
    // TODO: Implementar impresión
    console.log('Imprimir pedido');
  };

  const handleFacturar = () => {
    // TODO: Implementar facturación de pedido
    console.log('Facturar pedido');
  };

  const handleBuscarProducto = () => {
    // TODO: Implementar búsqueda de productos
    console.log('Buscar producto:', terminoBusqueda);
  };

  const handleEliminarItem = (index: number) => {
    const nuevosItems = items.filter((_, i) => i !== index);
    setItems(nuevosItems);
  };

  const handleBuscarPedidos = () => {
    // TODO: Implementar búsqueda de pedidos
    console.log('Buscar pedidos con filtros:', filtros);
  };

  const handleSeleccionarPedido = (pedido: Pedido) => {
    // TODO: Cargar pedido seleccionado
    console.log('Pedido seleccionado:', pedido);
  };

  // Handler para cuando se selecciona un cliente en el modal
  const handleClienteSelected = (clienteData: any) => {
    // Convertir los datos del cliente al formato esperado
    const nuevoCliente: Cliente = {
      nombre: clienteData.nombreCliente,
      direccion: clienteData.direccion || '',
      telefono: clienteData.celular || '',
      documento: clienteData.ruc.split('-')[0] || '', // Extraer RUC sin DV
      dv: clienteData.dv || '',
    };
    setCliente(nuevoCliente);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', p: 2 }}>
      {/* Botones de Acción */}
      <Stack direction="row" spacing={1} sx={{ height: '5vh', mb: 2 }} >
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={handleNuevo}
        >
          Nuevo
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PrintIcon />}
          onClick={handleImprimir}
        >
          Imprimir
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleGuardar}
        >
          Guardar
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<ReceiptIcon />}
          onClick={handleFacturar}
        >
          Facturar Pedido
        </Button>
      </Stack>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Lado Izquierdo - Formulario de Pedido */}
        <Grid size={4}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Búsqueda de Productos */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Productos
              </Typography>
              {/* Stack de busqueda de producto */}
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Buscar producto"
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleBuscarProducto();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleBuscarProducto}
                  startIcon={<SearchIcon />}
                >
                  Buscar
                </Button>
              </Stack>

              {/* Detalle del Producto Seleccionado */}
              <Paper variant="outlined" sx={{ p: 1, minHeight: 80, bgcolor: '#f5f5f5' }}>
                <Typography variant="body2" color="text.secondary">
                  Seleccione un producto para ver los detalles
                </Typography>
              </Paper>
            </Box>

            {/* Tabla de Items */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
              <TableContainer>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Descripción</TableCell>
                      <TableCell align="right">Unidades</TableCell>
                      <TableCell align="right">Precio</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.descripcion}</TableCell>
                        <TableCell align="right">{item.unidades}</TableCell>
                        <TableCell align="right">
                          {item.precioUnitario?.toLocaleString('es-PY')}
                        </TableCell>
                        <TableCell align="right">
                          {item.subtotal.toLocaleString('es-PY')}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleEliminarItem(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Formulario del Cliente */}
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Datos del Cliente
              </Typography>
              {/* Formulario del cliente */}
              <Grid container spacing={2}>
                <Grid size={6}> {/* Lado izquierdo */}
                  <Grid container spacing={1}> {/* Grid para el lado izquierdo */}
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="RUC"
                        value={cliente.documento}
                        onChange={(e) =>
                          setCliente({ ...cliente, documento: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid size={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="DV"
                        value={cliente.dv}
                        onChange={(e) => setCliente({ ...cliente, dv: e.target.value })}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Nombre"
                        value={cliente.nombre}
                        onChange={(e) =>
                          setCliente({ ...cliente, nombre: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Dirección"
                        value={cliente.direccion}
                        onChange={(e) =>
                          setCliente({ ...cliente, direccion: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid size={8}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Celular"
                        value={cliente.telefono}
                        onChange={(e) =>
                          setCliente({ ...cliente, telefono: e.target.value })
                        }
                      />
                    </Grid>

                  </Grid>
                </Grid>
                <Grid size={6}> {/* Lado derecho */}
                  <Grid container spacing={1}>
                    <Grid size={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Delivery</InputLabel>
                        <Select
                          value={delivery}
                          label="Delivery"
                          onChange={(e) => setDelivery(e.target.value)}
                        >
                          <MenuItem value="">Seleccione...</MenuItem>
                          <MenuItem value="SI">Sí</MenuItem>
                          <MenuItem value="NO">No</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Tipo de Pago</InputLabel>
                        <Select
                          value={tipoPago}
                          label="Tipo de Pago"
                          onChange={(e) => setTipoPago(e.target.value)}
                        >
                          <MenuItem value="">Seleccione...</MenuItem>
                          <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                          <MenuItem value="TARJETA">Tarjeta</MenuItem>
                          <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                          <MenuItem value="CREDITO">Crédito</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={10}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Fecha"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Total */}
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Typography variant="h5" color="error" sx={{ fontWeight: 'bold' }}>
                  Total: {totales.total.toLocaleString('es-PY')} Gs.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Lado Derecho - Lista de Pedidos del Día */}
        <Grid size={8}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Pedidos del Día
            </Typography>

            {/* Filtros */}
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1}>
                <Grid size={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Fecha"
                    value={filtros.fecha}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fecha: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 1 }}
                  />
                </Grid>
                <Grid size={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Buscar cliente"
                    value={filtros.cliente}
                    onChange={(e) =>
                      setFiltros({ ...filtros, cliente: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de Cobro</InputLabel>
                    <Select
                      value={filtros.tipoCobro}
                      label="Tipo de Cobro"
                      onChange={(e) =>
                        setFiltros({ ...filtros, tipoCobro: e.target.value })
                      }
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                      <MenuItem value="TARJETA">Tarjeta</MenuItem>
                      <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                      <MenuItem value="CREDITO">Crédito</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado de Cobranza</InputLabel>
                    <Select
                      value={filtros.estadoCobranza}
                      label="Estado de Cobranza"
                      onChange={(e) =>
                        setFiltros({ ...filtros, estadoCobranza: e.target.value })
                      }
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                      <MenuItem value="PAGADO">Pagado</MenuItem>
                      <MenuItem value="PARCIAL">Parcial</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleBuscarPedidos}
                    startIcon={<SearchIcon />}
                  >
                    Buscar
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Lista de Pedidos con Scroll */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <TableContainer sx={{ maxHeight: '100%' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        Fecha
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        Pedido
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        Cliente
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        Estado
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}
                      >
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pedidosDelDia.length > 0 ? (
                      pedidosDelDia.map((pedido, index) => (
                        <TableRow
                          key={index}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleSeleccionarPedido(pedido)}
                        >
                          <TableCell>
                            {new Date(pedido.fecha).toLocaleDateString('es-PY')}
                          </TableCell>
                          <TableCell>{pedido.nroPedido}</TableCell>
                          <TableCell>{pedido.cliente.nombre}</TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                backgroundColor:
                                  pedido.estadoCobranza === 'PAGADO'
                                    ? '#4caf50'
                                    : pedido.estadoCobranza === 'PARCIAL'
                                    ? '#ff9800'
                                    : '#f44336',
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            >
                              {pedido.estadoCobranza}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {pedido.total.toLocaleString('es-PY')}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No hay pedidos para mostrar
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Modal de búsqueda de cliente */}
      <SearchClienteModal
        open={openClienteModal}
        onClose={() => setOpenClienteModal(false)}
        onClienteSelected={handleClienteSelected}
      />
    </Box>
  );
};

export default Pedidos;
