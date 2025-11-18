import { useState, useEffect, useCallback } from 'react';
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
import SearchProductModal from '../components/SearchProductModal';
import type { ProductoResultado } from '../components/SearchProductModal';
import { useTerminal } from '../hooks/useTerminal';
import { pedidoService } from '../services/pedido.service';
import { reporteService } from '../services/reporte.service';
import type { DetallePedido, PedidoDia } from '../services/pedido.service'
import type { Cliente, FiltroPedidos } from '../types/pedido.types';
import type { DatosTicketPedido, ItemTicketPedido } from '../types/ticket.types';
import { ticketService } from '../services/ticket.service';

const Pedidos: React.FC = () => {
  // Estados principales
  const { idTerminalWeb } = useTerminal();
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [cliente, setCliente] = useState<Cliente>({
    nombre: '',
    direccion: '',
    telefono: '',
    documento: '',
    dv: '',
  });
  const [items, setItems] = useState<DetallePedido[]>([]);
  const [delivery, setDelivery] = useState('');
  const [tipoPago, setTipoPago] = useState('');
  const [nroPedido, setNroPedido] = useState('');
  
  // Estados para búsqueda de productos
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [openProductModal, setOpenProductModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoResultado | null>(null);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState<number>(1);
  
  // Estados para lista de pedidos del día
  const [pedidosDelDia, setPedidosDelDia] = useState<PedidoDia[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoDia | null>(null);
  const [filtros, setFiltros] = useState<FiltroPedidos>({
    fecha: new Date().toISOString().split('T')[0],
    cliente: '',
    tipoCobro: '',
    estadoCobranza: '',
  });

  // Modal de búsqueda de cliente
  const [openClienteModal, setOpenClienteModal] = useState(false);

  const consultarDetalle = useCallback(async () => {
    if (idTerminalWeb) {
      try {
        const data = await pedidoService.consultarDetallePedido(idTerminalWeb);
        console.log("Estos son los detalles de la consulta de detalle del pedido tmp", data);
        
        setItems(data);
      } catch (error) {
        console.error(error);
      }
    }
  }, [idTerminalWeb]);

  useEffect(() => {
    consultarDetalle();
  }, [consultarDetalle]);

  // Calcular totales
  const calcularTotales = () => {
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    return { total };
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
    setPedidoSeleccionado(null);
    setProductoSeleccionado(null);
    setCantidadSeleccionada(1);
  };

  const handleGuardar = async () => {
    if (!idTerminalWeb || !cliente.idCliente) {
      alert('Debe seleccionar un cliente y tener una terminal asignada.');
      return;
    }
    const pedido = {
      idUsuarioAlta: 1, // TODO: get from auth
      idTerminalWeb,
      idPedidoExistente: 0, // TODO: handle existing order
      idEstadoCobro: 1, // TODO: map from tipoPago
      idTipoCobro: 1, // TODO: map from tipoPago
      idCliente: cliente.idCliente,
      idDelivery: delivery === 'SI' ? 1 : 0, // TODO: map from delivery
      direccion: cliente.direccion || '',
    };
    try {
      await pedidoService.guardarPedido(pedido);
      alert('Pedido guardado correctamente');
      handleNuevo();
      handleBuscarPedidos();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el pedido');
    }
  };

  const handleImprimir = async () => {
    if (!pedidoSeleccionado) {
      alert('Seleccione un pedido del listado para imprimir.');
      return;
    }

    try {
      const reporte = await reporteService.obtenerDatosTicketPedido(
        pedidoSeleccionado.idPedido,
        pedidoSeleccionado.nro
      );

      if (!reporte?.cabecera) {
        alert('No se encontró información para el pedido seleccionado.');
        return;
      }

      const items: ItemTicketPedido[] = (reporte.items || []).map((item: any) => ({
        cantidad: Number(item.cantidad) || 0,
        mercaderia: item.mercaderia || '',
        precio: Number(item.precio) || 0,
        subtotal: Number(item.subtotal) || 0,
        codigo: item.codigo || ''
      }));

      const datosTicket: DatosTicketPedido = {
        numeroPedido: reporte.cabecera.nro ?? pedidoSeleccionado.nro,
        cliente: reporte.cabecera.nombreCliente || '',
        direccion: reporte.cabecera.direccion || '',
        celular: reporte.cabecera.celular || '',
        fechaHora: reporte.cabecera.fechaHora || new Date().toISOString(),
        delivery: reporte.cabecera.nombreDelivery || '',
        items,
        total: items.reduce((sum: number, item) => sum + item.subtotal, 0)
      };

      await ticketService.generarTicketPedido(datosTicket);
    } catch (error) {
      console.error('Error al generar ticket del pedido:', error);
      alert('No se pudo generar el ticket del pedido.');
    }
  };

  const handleFacturar = () => {
    // TODO: Implementar facturación de pedido
    console.log('Facturar pedido');
  };

  const handleBuscarProducto = () => {
    setOpenProductModal(true);
  };

  const handleSelectProduct = (producto: ProductoResultado) => {
    setProductoSeleccionado(producto);
    setCantidadSeleccionada(1);
  };

  const handleAgregarProducto = async () => {
    if (!idTerminalWeb || !productoSeleccionado) return;

    if (cantidadSeleccionada <= 0) {
      alert('La cantidad debe ser mayor a cero');
      return;
    }

    const data = {
      idTerminalWeb,
      idProducto: productoSeleccionado.idProducto,
      idStock: productoSeleccionado.idStock,
      cantidad: cantidadSeleccionada,
      precio: productoSeleccionado.precio,
    } as const;

    try {
      await pedidoService.agregarDetallePedido(data);
      setProductoSeleccionado(null);
      setCantidadSeleccionada(1);
      consultarDetalle();
    } catch (error) {
      console.error(error);
      alert('No se pudo agregar el producto al pedido');
    }
  };

  const handleEliminarItem = async (idDetPedidoTmp: number) => {
    if (!idTerminalWeb) {
      alert('No se puede eliminar sin una terminal asignada.');
      return;
    }
    try {
      await pedidoService.eliminarDetallePedido(idTerminalWeb, idDetPedidoTmp);
      consultarDetalle();
    } catch (error) {
      console.error(error);
    }
  };

  const handleBuscarPedidos = useCallback(async () => {
    if (idTerminalWeb) {
      try {
        const data = await pedidoService.consultarPedidosDia(idTerminalWeb);
        setPedidosDelDia(data);
        setPedidoSeleccionado((current) => {
          if (!current) return null;
          const stillExists = data.some(
            (pedido) =>
              pedido.idPedido === current.idPedido && pedido.nro === current.nro
          );
          return stillExists ? current : null;
        });
      } catch (error) {
        console.error(error);
      }
    }
  }, [idTerminalWeb]);

  useEffect(() => {
    handleBuscarPedidos();
  }, [handleBuscarPedidos]);

  const handleSeleccionarPedido = (pedido: PedidoDia) => {
    setPedidoSeleccionado(pedido);
  };

  // Handler para cuando se selecciona un cliente en el modal
  const handleClienteSelected = (clienteData: any) => {
    const nuevoCliente: Cliente = {
      idCliente: clienteData.idCliente,
      nombre: clienteData.nombreCliente,
      direccion: clienteData.direccion || '',
      telefono: clienteData.celular || '',
      documento: clienteData.ruc.split('-')[0] || '',
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
          disabled={!pedidoSeleccionado}
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
        <Grid size={6}>
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
                  label="Buscar producto (Alt+P)"
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
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                {productoSeleccionado ? (
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {productoSeleccionado.nombreMercaderia}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Código: {productoSeleccionado.codigo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Precio: {productoSeleccionado.precio.toLocaleString('es-PY')} Gs.
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        label="Cantidad"
                        type="number"
                        size="small"
                        value={cantidadSeleccionada}
                        onChange={(e) => setCantidadSeleccionada(Number(e.target.value) || 0)}
                        inputProps={{ min: 0.01, step: 1 }}
                        sx={{ width: 140 }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAgregarProducto}
                      >
                        Agregar
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Seleccione un producto para ver los detalles
                  </Typography>
                )}
              </Paper>
            </Box>

            {/* Tabla de Items */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
              <TableContainer>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nro</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell align="right">Unidades</TableCell>
                      <TableCell align="right">Precio</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.idDetPedidoTmp}>
                        <TableCell>{item.nro}</TableCell>
                        <TableCell>{item.nombreMercaderia}</TableCell>
                        <TableCell align="right">{item.cantidad}</TableCell>
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
                            onClick={() => handleEliminarItem(item.idDetPedidoTmp)}
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
                Datos del Cliente (Alt+C)
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
        <Grid size={6}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Pedidos del Día
            </Typography>
            {/* Lista de Pedidos con Scroll */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <TableContainer sx={{ maxHeight: '100%' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        Nro
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        Cliente
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        Tipo
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}
                      >
                        Fecha
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pedidosDelDia.length > 0 ? (
                      pedidosDelDia.map((pedido) => (
                        <TableRow
                          key={`${pedido.idPedido}-${pedido.nro}`}
                          hover
                          selected={pedidoSeleccionado?.idPedido === pedido.idPedido}
                          sx={{
                            cursor: 'pointer',
                            bgcolor:
                              pedidoSeleccionado?.idPedido === pedido.idPedido
                                ? 'action.selected'
                                : undefined
                          }}
                          onClick={() => handleSeleccionarPedido(pedido)}
                        >
                          <TableCell>{pedido.nro}</TableCell>
                          <TableCell>{pedido.nombreCliente}</TableCell>
                          <TableCell>{pedido.nombreTipo}</TableCell>
                          <TableCell align="right">
                            {new Date(pedido.fechaAlta).toLocaleString('es-PY')}
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
      {/* Modal de búsqueda de producto */}
      {idTerminalWeb && (
        <SearchProductModal
          open={openProductModal}
          onClose={() => setOpenProductModal(false)}
          onSelectProduct={handleSelectProduct}
          idTerminalWeb={idTerminalWeb}
          busqueda={terminoBusqueda}
        />
      )}
    </Box>
  );
};

export default Pedidos;
