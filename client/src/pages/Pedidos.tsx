import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
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
import TextField from '../components/UppercaseTextField';
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
import RequirePermission from '../components/RequirePermission';
import { deliveryService } from '../services/delivery.service';
import type { TipoCobro } from '../services/pedido.service';
import ClearIcon from '@mui/icons-material/Clear';

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
  // Listas para los selects
  const [deliveryList, setDeliveryList] = useState<any[]>([]);
  const [tipoCobroList, setTipoCobroList] = useState<TipoCobro[]>([]);
  // Valores seleccionados
  const [deliverySeleccionado, setDeliverySeleccionado] = useState<number | ''>('');
  const [tipoCobroSeleccionado, setTipoCobroSeleccionado] = useState<number | ''>('');
  const [items, setItems] = useState<DetallePedido[]>([]);
  const [nroPedido, setNroPedido] = useState('');

  // Estados para búsqueda de productos
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [openProductModal, setOpenProductModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoResultado | null>(null);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState<number>(1);

  // Refs para manejo de foco
  const cantidadInputRef = useRef<HTMLInputElement>(null);
  const agregarButtonRef = useRef<HTMLButtonElement>(null);
  const busquedaProductoRef = useRef<HTMLInputElement>(null);
  // Refs para flujo de foco
  const deliverySelectRef = useRef<HTMLSelectElement>(null);
  const tipoCobroSelectRef = useRef<HTMLSelectElement>(null);
  const guardarButtonRef = useRef<HTMLButtonElement>(null);
  const nuevoButtonRef = useRef<HTMLButtonElement>(null);

  // Estados para lista de pedidos del día
  const [pedidosDelDia, setPedidosDelDia] = useState<PedidoDia[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoDia | null>(null);

  // Modal de búsqueda de cliente
  const [openClienteModal, setOpenClienteModal] = useState(false);

  // Consulta detalle del pedido (Para que se cargue al añadir un producto)
  const consultarDetalle = useCallback(async () => {
    if (idTerminalWeb) {
      try {
        const data = await pedidoService.consultarDetallePedido(idTerminalWeb);
        setItems(data);
      } catch (error) {
        console.error(error);
      }
    }
  }, [idTerminalWeb]);

  const consultarTipoCobro = useCallback(async () => {
    try {
      const result = await pedidoService.consultaTipoCobro();
      console.log(result);
      setTipoCobroList(result);
    } catch (error: any) {
      console.error(error);
    }
  }, []);

  const consultarDelivery = useCallback(async () => {
    try {
      const result = await deliveryService.getDeliveryActivo();
      setDeliveryList(result);
    } catch (error: any) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    consultarDetalle();
  }, [consultarDetalle]);

  useEffect(() => {
    consultarDelivery();
  }, [consultarDelivery]);

  useEffect(() => {
    consultarTipoCobro();
  }, [consultarTipoCobro])

  // Calcular totales
  const calcularTotales = () => {
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    return { total };
  };

  const totales = calcularTotales();

  // Handlers
  const handleNuevo = useCallback(() => {
    setNroPedido('');
    setCliente({
      nombre: '',
      direccion: '',
      telefono: '',
      documento: '',
      dv: '',
    });
    setItems([]);
    setDeliverySeleccionado('');
    setTipoCobroSeleccionado('');
    setTerminoBusqueda('');
    setPedidoSeleccionado(null);
    setProductoSeleccionado(null);
    setCantidadSeleccionada(1);
    // Mover foco al campo de búsqueda de productos
    setTimeout(() => busquedaProductoRef.current?.focus(), 100);
  }, []);

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


  // Funcion para guardar el pedido 
  const handleGuardar = useCallback(async () => {
    // Pregunto si es que tengo un cliente o una terminal asignados
    if (!idTerminalWeb || !cliente.idCliente) {
      alert('Debe seleccionar un cliente y tener una terminal asignada.');
      return;
    }
    const pedido = {
      idUsuarioAlta: 1, // TODO: get from auth
      idTerminalWeb,
      idPedidoExistente: 0, // TODO: handle existing order
      idEstadoCobro: 1, // TODO: map from tipoPago
      idTipoCobro: tipoCobroSeleccionado as number,
      idCliente: cliente.idCliente,
      idDelivery: deliverySeleccionado as number,
      direccion: cliente.direccion || '',
    };
    try {
      await pedidoService.guardarPedido(pedido);
      alert('Pedido guardado correctamente');
      handleNuevo();
      handleBuscarPedidos();
      // Mover foco al botón Nuevo
      setTimeout(() => nuevoButtonRef.current?.focus(), 100);
    } catch (error) {
      console.error(error);
      alert('Error al guardar el pedido');
    }
  }, [idTerminalWeb, cliente, tipoCobroSeleccionado, deliverySeleccionado, handleNuevo, handleBuscarPedidos]);

  // Atajos de teclado F1-F4
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'F1':
          event.preventDefault();
          setOpenProductModal(true);
          break;
        case 'F2':
          event.preventDefault();
          setOpenClienteModal(true);
          break;
        case 'F3':
          event.preventDefault();
          handleNuevo();
          break;
        case 'F4':
          event.preventDefault();
          handleGuardar();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNuevo, handleGuardar]);

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
    // Enfocar y seleccionar el campo de cantidad después de seleccionar un producto
    setTimeout(() => {
      if (cantidadInputRef.current) {
        cantidadInputRef.current.focus();
        cantidadInputRef.current.select();
      }
    }, 100);
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
      // Volver el foco al campo de búsqueda de productos
      setTimeout(() => {
        if (busquedaProductoRef.current) {
          busquedaProductoRef.current.focus();
        }
      }, 100);
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



  // Handler para cuando se selecciona un cliente en el modal
  const handleClienteSelected = (clienteData: any) => {
    const nuevoCliente: Cliente = {
      idCliente: clienteData.idCliente,
      nombre: clienteData.nombreCliente,
      direccion: clienteData.direccion || '',
      telefono: clienteData.celular || '',
      documento: clienteData.ruc || '',
      dv: clienteData.dv || '',
    };
    setCliente(nuevoCliente);
    // Mover foco al select de Delivery
    setTimeout(() => deliverySelectRef.current?.focus(), 100);
  };

  return (
    <RequirePermission permission="ACCESO_COMPRAS">
      <Box sx={{ height: 'calc(100vh - 120px)', p: 2 }}>
        {/* Botones de Acción */}
        <Stack direction="row" spacing={1} sx={{ height: '5vh', mb: 2 }} >
          <Button
            ref={nuevoButtonRef}
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={handleNuevo}
          >
            Nuevo (F3)
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
            ref={guardarButtonRef}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleGuardar}
          >
            Guardar (F4)
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
                    label="Buscar producto (F1)"
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleBuscarProducto();
                      }
                    }}
                    inputRef={busquedaProductoRef}
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
                    <>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1" fontWeight="bold" >
                            {productoSeleccionado.nombreMercaderia}
                          </Typography>
                          <ClearIcon onClick={() => setProductoSeleccionado(null)} sx={{ cursor: 'pointer' }} />
                        </Box>
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
                            inputRef={cantidadInputRef}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                agregarButtonRef.current?.focus();
                              }
                            }}
                          />
                          <Button
                            ref={agregarButtonRef}
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleAgregarProducto}
                          >
                            Agregar
                          </Button>
                        </Stack>
                      </Stack>
                    </>
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
                  Datos del Cliente (F2)
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
                            inputRef={deliverySelectRef}
                            value={deliverySeleccionado}
                            label="Delivery"
                            onChange={(e) => {
                              setDeliverySeleccionado(e.target.value as number);
                              // Mover foco al select de Tipo de Pago
                              setTimeout(() => tipoCobroSelectRef.current?.focus(), 100);
                            }}
                          >
                            {
                              deliveryList.map((item: any) => (
                                <MenuItem key={item.idDelivery} value={item.idDelivery}>
                                  {item.nombreDelivery}
                                </MenuItem>
                              ))
                            }
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={12}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Tipo de Pago</InputLabel>
                          <Select
                            inputRef={tipoCobroSelectRef}
                            value={tipoCobroSeleccionado}
                            label="Tipo de Pago"
                            onChange={(e) => {
                              setTipoCobroSeleccionado(e.target.value as number);
                              // Mover foco al botón Guardar
                              setTimeout(() => guardarButtonRef.current?.focus(), 100);
                            }}
                          >
                            {
                              tipoCobroList.map((item: TipoCobro) => (
                                <MenuItem key={item.idTipoCobro} value={item.idTipoCobro}>
                                  {item.nombreTipo}
                                </MenuItem>
                              ))
                            }
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
    </RequirePermission>
  );
};

export default Pedidos;
