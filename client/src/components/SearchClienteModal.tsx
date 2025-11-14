import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Alert,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { personaService } from '../services/persona.service';
import ClienteForm from './ClienteForm';

interface ClienteResultado {
  idCliente: number;
  nombreCliente: string;
  ruc: string;
  dv: string;
  direccion: string;
  celular: string;
}

interface Cliente {
  nombre: string;
  direccion: string;
  telefono: string;
  documento: string;
  dv: string;
}

interface SearchClienteModalProps {
  open: boolean;
  onClose: () => void;
  onClienteSelected: (cliente: ClienteResultado) => void;
}

const SearchClienteModal: React.FC<SearchClienteModalProps> = ({
  open,
  onClose,
  onClienteSelected,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState<ClienteResultado[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<ClienteResultado | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setClientes([]);
      setError('');
      return;
    }

    setIsSearching(true);
    setError('');
    
    try {
      const results = await personaService.consultaCliente(searchTerm.trim());
      setClientes(results);
      
      if (results.length === 0) {
        setError('No se encontraron clientes');
      }
    } catch (error: any) {
      console.error('Error al buscar clientes:', error);
      setError(error.message || 'Error al buscar clientes');
      setClientes([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRowClick = (cliente: ClienteResultado) => {
    setSelectedCliente(cliente);
    onClienteSelected(cliente);
    onClose(); // Cierra el modal al seleccionar
  };

  const handleClienteFormSuccess = () => {
    // Cuando se agrega un cliente exitosamente, cambiar a la pestaña de búsqueda
    setTabValue(0);
    // Opcional: limpiar búsqueda y recargar
    setSearchTerm('');
    setClientes([]);
    setSelectedCliente(null);
  };

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setSearchTerm('');
      setClientes([]);
      setError('');
      setSelectedCliente(null);
      setTabValue(0);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '600px',
          maxHeight: '80vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: '#f5f5f5', 
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.5
      }}>
        <Typography variant="h6" component="div">
          Gestión de Clientes
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Buscar Cliente" />
            <Tab label="Agregar Cliente" />
          </Tabs>
        </Box>

        {/* Tab 1: Buscar Cliente */}
        {tabValue === 0 && (
          <Box sx={{ p: 2 }}>
            {/* Search bar */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Buscar cliente por nombre"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ingrese el nombre del cliente"
                disabled={isSearching}
                autoFocus
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim()}
                startIcon={<SearchIcon />}
              >
                Buscar
              </Button>
            </Box>

            {/* Error message */}
            {error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Lista de clientes */}
            {clientes.length > 0 && (
              <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nombre del Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>RUC</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clientes.map((cliente) => (
                      <TableRow
                        key={cliente.idCliente}
                        onClick={() => handleRowClick(cliente)}
                        hover
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{cliente.idCliente}</TableCell>
                        <TableCell>{cliente.nombreCliente}</TableCell>
                        <TableCell>{cliente.ruc}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Tab 2: Agregar Cliente */}
        {tabValue === 1 && (
          <Box sx={{ p: 2 }}>
            <ClienteForm
              open={true} // El formulario está contenido, por lo que siempre está "abierto"
              onClose={() => setTabValue(0)} // Cambia de pestaña en lugar de cerrar
              onClienteSelected={(cliente) => {
                onClienteSelected({
                  idCliente: cliente.idPersona || 0,
                  nombreCliente: `${cliente.nombre} ${cliente.apellido || ''}`,
                  ruc: `${cliente.ruc}-${cliente.dv}`,
                  dv: cliente.dv,
                  direccion: cliente.direccion,
                  celular: cliente.celular || '',
                });
                onClose();
              }}
              onSuccess={handleClienteFormSuccess}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchClienteModal;