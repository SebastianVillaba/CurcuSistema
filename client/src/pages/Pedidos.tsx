import { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Pedidos: React.FC = () => {
  const [fecha, setFecha] = useState('04-02-2025');
  const [tabValue, setTabValue] = useState(0);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // Datos mock para la tabla de pedidos
  const pedidosMock = [
    {
      fecha: '04-02-2025',
      nro: '1',
      pedido: 'HECA CURCUMA',
      cliente: 'Pendiente',
      ronda: 'Pendiente',
      tipo: '',
      inversion: '04-02-25 15:06',
      mesa: '',
      total: '14.000',
      delivery: ''
    },
    {
      fecha: '04-02-2025',
      nro: '2',
      pedido: 'HECA CURCUMA',
      cliente: 'Pendiente',
      ronda: 'Pendiente',
      tipo: '',
      inversion: '04-02-25 15:06',
      mesa: '',
      total: '14.000',
      delivery: ''
    },
    {
      fecha: '04-02-2025',
      nro: '3',
      pedido: 'DOC CHIARA',
      cliente: 'Pendiente',
      ronda: 'Pendiente',
      tipo: '',
      inversion: '04-02-25 15:06',
      mesa: '',
      total: '18.000',
      delivery: ''
    },
    {
      fecha: '04-02-2025',
      nro: '4',
      pedido: 'DAVID GUERRERO',
      cliente: 'Pendiente',
      ronda: 'NEGRAL',
      tipo: '',
      inversion: '04-02-25 00:00',
      mesa: '',
      total: '9.000',
      delivery: ''
    },
    {
      fecha: '04-02-2025',
      nro: '5',
      pedido: 'SALA 13',
      cliente: 'Pendiente',
      ronda: 'Pendiente',
      tipo: '',
      inversion: '04-02-25 08:05',
      mesa: '',
      total: '22.900',
      delivery: ''
    },
    {
      fecha: '04-02-2025',
      nro: '6',
      pedido: 'HAB 222',
      cliente: 'Pendiente',
      ronda: 'Pendiente',
      tipo: '',
      inversion: '04-02-25 08:05',
      mesa: '',
      total: '19.000',
      delivery: ''
    },
    {
      fecha: '04-02-2025',
      nro: '7',
      pedido: 'SALA 13',
      cliente: 'Pendiente',
      ronda: 'Pendiente',
      tipo: '',
      inversion: '04-02-25 08:05',
      mesa: '',
      total: '22.900',
      delivery: ''
    },
    {
      fecha: '04-02-2025',
      nro: '1',
      pedido: 'SABRINA ROJAS',
      cliente: 'Pendiente',
      ronda: 'Q GENERAL',
      tipo: '',
      inversion: '04-02-24 05:14',
      mesa: '',
      total: '23.000',
      delivery: ''
    },
  ];

  // Datos mock para el detalle del pedido seleccionado
  const detallePedidoMock = [
    { producto: 'Producto 1', descripcion: 'Descripción del producto 1', cantidad: '2', precio: '7.000', total: '14.000' },
    { producto: 'Producto 2', descripcion: 'Descripción del producto 2', cantidad: '1', precio: '18.000', total: '18.000' },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Encabezado con Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Nuevo" />
          <Tab label="Imprimir" />
          <Tab label="Guardar" />
          <Tab label="Entregado" />
          <Tab label="Facturar" />
          <Tab label="Facturar vendido" />
          <Tab label="Facturar Pendiente" />
          <Tab label="Salida de Cliente" />
          <Tab label="Imprimir pedidos del dia" />
          <Tab label="Eventos pedidos sin delivery" />
        </Tabs>
      </Paper>

      {/* Sección de búsqueda y filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ minWidth: '120px' }}>
            <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 'bold' }}>
              14.000
            </Typography>
          </Box>
          
          <TextField
            label="Fecha"
            size="small"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: '200px' }}
          />

          <Button
            variant="contained"
            color="primary"
            sx={{ height: '40px', minWidth: '120px' }}
          >
            A COBRAR
          </Button>

          <Button
            variant="contained"
            color="secondary"
            sx={{ height: '40px', minWidth: '120px' }}
          >
            LA RENDIDA
          </Button>

          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel>Pendiente</InputLabel>
            <Select
              value="pendiente"
              label="Pendiente"
            >
              <MenuItem value="pendiente">Pendiente</MenuItem>
              <MenuItem value="entregado">Entregado</MenuItem>
              <MenuItem value="facturado">Facturado</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{ height: '40px', minWidth: '120px' }}
          >
            Buscar
          </Button>
        </Box>
      </Paper>

      {/* Tabla de pedidos */}
      <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TableContainer sx={{ flexGrow: 1 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Pedido</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Ronda</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Inversión</TableCell>
                <TableCell>Mesa</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Delivery</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidosMock.map((pedido, index) => (
                <TableRow 
                  key={index}
                  hover
                  selected={selectedRow === index}
                  onClick={() => setSelectedRow(index)}
                  sx={{ 
                    cursor: 'pointer',
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                    }
                  }}
                >
                  <TableCell>{pedido.fecha}</TableCell>
                  <TableCell>{pedido.pedido}</TableCell>
                  <TableCell>{pedido.cliente}</TableCell>
                  <TableCell>{pedido.ronda}</TableCell>
                  <TableCell>{pedido.tipo}</TableCell>
                  <TableCell>{pedido.inversion}</TableCell>
                  <TableCell>{pedido.mesa}</TableCell>
                  <TableCell align="right">{pedido.total}</TableCell>
                  <TableCell>{pedido.delivery}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Panel inferior con detalles del pedido y formulario */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, height: '300px' }}>
        {/* Panel izquierdo - Lista de productos */}
        <Paper sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Producto</Typography>
          <Stack spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Descripción"
              InputProps={{ readOnly: true }}
            />
            <TextField
              fullWidth
              size="small"
              placeholder="Unidades"
              InputProps={{ readOnly: true }}
            />
            <TextField
              fullWidth
              size="small"
              placeholder="Precio"
              InputProps={{ readOnly: true }}
            />
            <TextField
              fullWidth
              size="small"
              placeholder="Total"
              InputProps={{ readOnly: true }}
            />
          </Stack>
        </Paper>

        {/* Panel central - Detalle del pedido */}
        <Paper sx={{ flex: 2, p: 2, overflow: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Detalle del Pedido</Typography>
          {selectedRow !== null && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detallePedidoMock.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.producto}</TableCell>
                      <TableCell>{item.descripcion}</TableCell>
                      <TableCell align="right">{item.cantidad}</TableCell>
                      <TableCell align="right">₲{item.precio}</TableCell>
                      <TableCell align="right">₲{item.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {selectedRow === null && (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              Seleccione un pedido para ver los detalles
            </Typography>
          )}
        </Paper>

        {/* Panel derecho - Formulario de cliente */}
        <Paper sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Nombre"
              size="small"
              defaultValue="1"
            />
            <TextField
              fullWidth
              label="Apellido"
              size="small"
              defaultValue="8611"
            />
            <TextField
              fullWidth
              label="Nombre"
              size="small"
              defaultValue="HECA CURCUMA"
            />
            <TextField
              fullWidth
              label="Dirección"
              size="small"
            />
            <TextField
              fullWidth
              label="Teléfono"
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Vendedor</InputLabel>
              <Select
                value=""
                label="Vendedor"
              >
                <MenuItem value="">Seleccionar</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Categoría</InputLabel>
              <Select
                value=""
                label="Categoría"
              >
                <MenuItem value="">Seleccionar</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Fecha"
              size="small"
              type="date"
              value="04-02-2025"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Dinero Cliente"
              size="small"
              type="number"
            />
          </Stack>
        </Paper>
      </Box>

      {/* Botones de acción inferiores */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((num) => (
            <Button
              key={num}
              variant="contained"
              color="success"
              sx={{ 
                minWidth: '60px',
                height: '50px',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            >
              {num}
            </Button>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Pedidos;
