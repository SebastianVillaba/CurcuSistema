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
  Autocomplete,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import type { ItemFactura, Cliente } from '../types/factura.types';
import type { Caja } from '../types/caja.types';
import { productoService } from '../services/producto.service';
import SearchProductModal from '../components/SearchProductModal';
import ClienteForm from '../components/ClienteForm';
import CajaSelectorModal from '../components/CajaSelectorModal';

const Facturacion: React.FC = () => {
  const [numeroFactura, setNumeroFactura] = useState('001-005-1102');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [condicion, setCondicion] = useState<'CONTADO' | 'CREDITO'>('CONTADO');
  const [items, setItems] = useState<ItemFactura[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para búsqueda
  const [clientesOptions, setClientesOptions] = useState<Cliente[]>([]);
  const [productosOptions, setProductosOptions] = useState<ItemFactura[]>([]);
  const [termino, setTermino] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [cantidadProducto, setCantidadProducto] = useState(1);
  
  // Dialog para agregar producto
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ItemFactura | null>(null);
  const [cantidad, setCantidad] = useState(1);
  
  // Modal de cliente
  const [openClienteForm, setOpenClienteForm] = useState(false);
  
  // Modal de caja
  const [openCajaSelector, setOpenCajaSelector] = useState(false);
  const [cajaSeleccionada, setCajaSeleccionada] = useState<Caja | null>(null);

  // Calcular totales
  const calcularTotales = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const descuentoTotal = items.reduce((sum, item) => sum + item.descuento, 0);
    const total = subtotal - descuentoTotal;
    return { subtotal, descuentoTotal, total };
  };

  const { subtotal, descuentoTotal, total } = calcularTotales();

  // Handlers para búsqueda de clientes (mock data temporal)
  const handleBuscarClientes = async (termino: string) => {
    if (termino.length < 2) return;
    // TODO: Conectar con el backend cuando esté listo
    const mockClientes: Cliente[] = [
      { idCliente: 1, nombre: 'Cliente Ejemplo 1', direccion: 'Calle 123', telefono: '123456', documento: '12345678' },
      { idCliente: 2, nombre: 'Cliente Ejemplo 2', direccion: 'Av. Principal 456', telefono: '654321', documento: '87654321' },
    ];
    setClientesOptions(mockClientes.filter(c => c.nombre.toLowerCase().includes(termino.toLowerCase())));
  };

  // Handlers para búsqueda de productos usando sp_consultaPrecioProducto
  const handleBuscarProductos = async (busqueda: string) => {
    if (!busqueda || busqueda.length < 1) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await productoService.consultarPrecioProducto(busqueda);
      
      if (results.length === 0) {
        setError('No se encontraron productos');
        setSearchResults([]);
      } else if (results.length === 1) {
        // Si solo hay 1 resultado, agregarlo directamente
        handleAgregarDesdeResultado(results[0]);
      } else {
        // Si hay múltiples resultados, mostrar el modal
        setSearchResults(results);
        setOpenSearchModal(true);
      }
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setError('Error al buscar productos');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Manejar búsqueda al presionar Enter y shortcut de cantidad
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      // Verificar si el término empieza con + para establecer cantidad
      if (termino.startsWith('+')) {
        const cantidad = parseFloat(termino.substring(1));
        if (!isNaN(cantidad) && cantidad > 0) {
          setCantidadProducto(cantidad);
          setTermino('');
          return;
        }
      }
      handleBuscarProductos(termino);
    }
  };

  // Agregar producto desde los resultados de búsqueda
  const handleAgregarDesdeResultado = (producto: any) => {
    const nuevoItem: ItemFactura = {
      idProducto: producto.idProducto,
      codigo: producto.codigo,
      nombreMercaderia: producto.nombreMercaderia,
      descripcion: producto.nombreMercaderia,
      origen: producto.origen === 'N' ? 'Nacional' : 'Importado',
      unidades: cantidadProducto,
      precio: producto.precio,
      precioUnitario: producto.precio,
      total: producto.precio * cantidadProducto,
      descuento: 0,
      stock: producto.stock,
      nombreImpuesto: producto.nombreImpuesto
    };

    setItems([...items, nuevoItem]);
    setTermino('');
    setSearchResults([]);
    setCantidadProducto(1); // Resetear cantidad a 1
  };

  // Agregar producto a la factura
  const handleAgregarProducto = () => {
    if (!selectedProduct) return;
    
    const precioUnit = selectedProduct.precioUnitario || selectedProduct.precio || 0;
    
    const nuevoItem: ItemFactura = {
      ...selectedProduct,
      unidades: cantidad,
      precioUnitario: precioUnit,
      total: precioUnit * cantidad,
    };
    
    setItems([...items, nuevoItem]);
    setOpenProductDialog(false);
    setSelectedProduct(null);
    setCantidad(1);
  };

  // Eliminar producto de la factura
  const handleEliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Actualizar cantidad de un item
  const handleActualizarCantidad = (index: number, nuevaCantidad: number) => {
    const nuevosItems = [...items];
    nuevosItems[index].unidades = nuevaCantidad;
    const precioUnit = nuevosItems[index].precioUnitario || nuevosItems[index].precio || 0;
    nuevosItems[index].total = nuevaCantidad * precioUnit;
    setItems(nuevosItems);
  };

  // Actualizar descuento de un item
  const handleActualizarDescuento = (index: number, nuevoDescuento: number) => {
    const nuevosItems = [...items];
    nuevosItems[index].descuento = nuevoDescuento;
    setItems(nuevosItems);
  };

  // Guardar factura
  const handleGuardarFactura = async () => {
    setError('');
    setSuccess('');

    // Validaciones
    if (!cliente) {
      setError('Debe seleccionar un cliente');
      return;
    }

    if (items.length === 0) {
      setError('Debe agregar al menos un producto');
      return;
    }

    // TODO: Implementar guardado real cuando el backend esté listo
    setSuccess('Factura guardada exitosamente');
    
    // Limpiar formulario
    setTimeout(() => {
      handleNuevaFactura();
    }, 2000);
  };

  // Nueva factura
  const handleNuevaFactura = () => {
    setCliente(null);
    setItems([]);
    setObservaciones('');
    setError('');
    setSuccess('');
    // Incrementar número de factura
    const partes = numeroFactura.split('-');
    const ultimoNumero = parseInt(partes[2]) + 1;
    setNumeroFactura(`${partes[0]}-${partes[1]}-${ultimoNumero.toString().padStart(4, '0')}`);
  };

  // Handler para cuando se selecciona un cliente en el modal
  const handleClienteSelected = (clienteData: any) => {
    const nuevoCliente: Cliente = {
      idCliente: clienteData.idPersona || 0,
      nombre: clienteData.nombre + (clienteData.apellido ? ' ' + clienteData.apellido : ''),
      direccion: clienteData.direccion || '',
      telefono: clienteData.celular || clienteData.telefono || '',
      documento: clienteData.ruc || '',
      dv: clienteData.dv || ''
    };
    setCliente(nuevoCliente);
    setSuccess('Cliente seleccionado correctamente');
  };

  // Handler para cuando se selecciona una caja
  const handleCajaSelected = (caja: Caja) => {
    setCajaSeleccionada(caja);
    setSuccess(`Caja ${caja.nombre} abierta correctamente`);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Paper sx={{ p: 2, mb: 2, width: '120vh' }}>
          <Grid container spacing={4}>
            <Grid item size={6}>
              <Stack spacing={1}>
                <div>
                  <TextField 
                    label="RUC"
                    size='small'
                    value={cliente?.documento || ''}
                    InputProps={{ readOnly: true }}
                    sx={{
                      width: '16vh'
                    }}
                  />
                  <TextField 
                    label="dv"
                    size='small'
                    value={cliente?.dv || ''}
                    InputProps={{ readOnly: true }}
                    sx={{
                      width: '8vh'
                    }}
                  />
                </div>
                <TextField
                  label="Nombre"
                  size="small"
                  value={cliente?.nombre || ''}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Direccion"
                  size='small'
                  value={cliente?.direccion || ''}
                  InputProps={{ readOnly: true }}
                />
              </Stack>
            </Grid>
            
            <Grid item size={3}>
              <Stack spacing={1}>
                <TextField
                    fullWidth
                    label="Fecha"
                    size="small"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <div style={{ display: 'flex', gap: '1vh' }}>
                  <Button 
                    variant='contained'
                    sx={{
                      width: '10vh'
                    }}
                    onClick={() => setOpenClienteForm(true)}
                    title="Buscar/Agregar Cliente"
                  >
                    <PersonSearchIcon />
                  </Button>
                  <Button 
                    variant='contained'
                    color={cajaSeleccionada ? 'success' : 'primary'}
                    sx={{
                      width: '10vh'
                    }}
                    onClick={() => setOpenCajaSelector(true)}
                    title="Seleccionar Caja"
                  >
                    <PointOfSaleIcon />
                  </Button>
                  <Button 
                    variant='contained'
                    sx={{
                      width: '10vh'
                    }}
                  >
                    <SearchIcon />
                  </Button>
                </div>
                
              </Stack>
            </Grid>
            <Grid item size={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Condición</InputLabel>
                <Select
                  value={condicion}
                  label="Condición"
                  onChange={(e) => setCondicion(e.target.value as 'CONTADO' | 'CREDITO')}
                >
                  <MenuItem value="CONTADO">Contado</MenuItem>
                  <MenuItem value="CENTRAL">Credito</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant='h2'>₲</Typography>
            <TextField
              size='medium'
              sx={{
                backgroundColor: "#2dfc61"
              }}
            />
          </div>
          <div>
            <TextField
              fullWidth
              label="Número de Factura"
              size="small"
              value={numeroFactura}
              onChange={(e) => setNumeroFactura(e.target.value)}
              sx={{
                mt: 2
              }}
            />
          </div>
        </Paper>
      </div>

      {/* Mensajes */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => {
        setSuccess('');
        setCliente(null);
      }}>{success}</Alert>}

      {/* Tabla de productos */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', mb: 2, gap: 1, alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              label="Cantidad/Kg"
              size="small"
              type="number"
              value={cantidadProducto}
              onChange={(e) => {
                const valor = parseFloat(e.target.value);
                setCantidadProducto(isNaN(valor) || valor <= 0 ? 1 : valor);
              }}
              sx={{ width: '120px' }}
              inputProps={{ min: 0.001, step: 0.001 }}
            />
          </Box>
          <TextField
            fullWidth
            label="Buscar producto (código, código de barra o nombre)"
            size="small"
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            placeholder="Ingrese nombre o código del producto"
            helperText="Tip: Escribe +1.5 y Enter para 1.5kg o +2 para 2 unidades"
          />
          <Button
            variant="contained"
            onClick={() => handleBuscarProductos(termino)}
            disabled={isSearching || !termino}
            startIcon={<SearchIcon />}
          >
            Buscar
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Descripción</TableCell>
                <TableCell>Origen</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Precio Unit.</TableCell>
                <TableCell align="right">Subtotal</TableCell>
                <TableCell align="right">Descuento</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.descripcion || item.nombreMercaderia}</TableCell>
                  <TableCell>{item.origen}</TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={item.unidades}
                      onChange={(e) => handleActualizarCantidad(index, parseFloat(e.target.value) || 0)}
                      sx={{ width: 80 }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </TableCell>
                  <TableCell align="right">₲{(item.precioUnitario || item.precio || 0).toLocaleString()}</TableCell>
                  <TableCell align="right">₲{item.total.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={item.descuento}
                      onChange={(e) => handleActualizarDescuento(index, parseFloat(e.target.value) || 0)}
                      sx={{ width: 80 }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </TableCell>
                  <TableCell align="right">₲{(item.total - item.descuento).toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => handleEliminarItem(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No hay productos agregados, ingresa el codigo o nombre de un producto para comenzar.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Totales y acciones */}
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">₲{subtotal.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Descuento:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right" color="error">-₲{descuentoTotal.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">Total:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" align="right" color="primary">₲{total.toLocaleString()}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={handleNuevaFactura}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleGuardarFactura}
                disabled={items.length === 0 || !cliente}
              >
                Guardar Factura
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Modal de búsqueda de productos */}
      <SearchProductModal
        open={openSearchModal}
        onClose={() => setOpenSearchModal(false)}
        productos={searchResults}
        onSelectProduct={handleAgregarDesdeResultado}
      />

      {/* Modal de cliente */}
      <ClienteForm
        open={openClienteForm}
        onClose={() => setOpenClienteForm(false)}
        onClienteSelected={handleClienteSelected}
      />

      {/* Modal de selección de caja */}
      <CajaSelectorModal
        open={openCajaSelector}
        onClose={() => setOpenCajaSelector(false)}
        onSelectCaja={handleCajaSelected}
      />

      {/* Dialog para agregar producto */}
      <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Producto</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={productosOptions}
            getOptionLabel={(option) => option.descripcion || option.nombreMercaderia || ''}
            value={selectedProduct}
            onChange={(_, newValue) => setSelectedProduct(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Buscar producto" margin="normal" fullWidth />
            )}
          />
          {selectedProduct && (
            <>
              <TextField
                label="Cantidad"
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(parseFloat(e.target.value))}
                fullWidth
                margin="normal"
              />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Precio unitario: ₲{((selectedProduct.precioUnitario || selectedProduct.precio || 0)).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                Stock disponible: {selectedProduct.stock}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Total: ₲{((selectedProduct.precioUnitario || selectedProduct.precio || 0) * cantidad).toLocaleString()}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProductDialog(false)}>Cancelar</Button>
          <Button onClick={handleAgregarProducto} variant="contained" color="primary" disabled={!selectedProduct}>
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Facturacion;
