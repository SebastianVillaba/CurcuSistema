import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
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
  CircularProgress,
} from '@mui/material';
import TextField from './UppercaseTextField';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { preventaService } from '../services/preventa.service';

interface PreventaPendiente {
  idPreventa: number;
  fechaAlta: string;
  idCliente: number;
  nombreCliente: string;
  ruc: string;
  totalVenta: number;
  vendedor: string;
}

interface RecargarPreventaModalProps {
  open: boolean;
  onClose: () => void;
  onPreventaSelected: (idPreventa: number) => void;
}

const RecargarPreventaModal: React.FC<RecargarPreventaModalProps> = ({
  open,
  onClose,
  onPreventaSelected,
}) => {
  const [preventaIdInput, setPreventaIdInput] = useState('');
  const [preventas, setPreventas] = useState<PreventaPendiente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const preventasRef = useRef<PreventaPendiente[]>([]);
  const selectedIndexRef = useRef<number>(-1);

  // Mantener referencias actualizadas para evitar closures obsoletos
  useEffect(() => {
    preventasRef.current = preventas;
  }, [preventas]);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  // Cargar preventas al abrir el modal
  const cargarPreventasPendientes = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await preventaService.obtenerPreventasPendientes();
      setPreventas(result || []);
      if (result && result.length > 0) {
        setSelectedIndex(0);
      } else {
        setSelectedIndex(-1);
      }
    } catch (err: any) {
      console.error('Error al cargar preventas:', err);
      setError('Error al obtener la lista de preventas pendientes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPreventaIdInput('');
      setError('');
      setSelectedIndex(-1);
      cargarPreventasPendientes();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Navegación por teclado
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentPreventas = preventasRef.current;
    
    // Si presiona Escape, cerrar
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    // Si presiona Enter y el foco está en el input ID, intentar cargar ese ID
    if (e.key === 'Enter' && preventaIdInput.trim() && e.target === inputRef.current) {
      e.preventDefault();
      const id = parseInt(preventaIdInput);
      if (!isNaN(id) && id > 0) {
        onPreventaSelected(id);
        onClose();
      } else {
        setError('Por favor, ingrese un ID de preventa válido.');
      }
      return;
    }

    if (currentPreventas.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < currentPreventas.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        const currentIndex = selectedIndexRef.current;
        if (currentIndex >= 0 && currentIndex < currentPreventas.length) {
          onPreventaSelected(currentPreventas[currentIndex].idPreventa);
          onClose();
        }
        break;
    }
  }, [onPreventaSelected, onClose, preventaIdInput]);

  const handleManualLoad = () => {
    const id = parseInt(preventaIdInput);
    if (!isNaN(id) && id > 0) {
      onPreventaSelected(id);
      onClose();
    } else {
      setError('Por favor, ingrese un ID de preventa válido.');
    }
  };

  const handleRowClick = (preventa: PreventaPendiente) => {
    onPreventaSelected(preventa.idPreventa);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '450px',
          maxHeight: '80vh',
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Recargar Preventa
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'primary.contrastText' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

        {/* Input para ID Directo */}
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            label="Código / ID de Preventa"
            placeholder="Ingrese el número de preventa (ej. 12)"
            size="small"
            value={preventaIdInput}
            onChange={(e) => setPreventaIdInput(e.target.value.replace(/\D/g, ''))}
            autoComplete="off"
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleManualLoad}
            startIcon={<SearchIcon />}
            disabled={!preventaIdInput.trim()}
          >
            Cargar
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
            Preventas Pendientes
          </Typography>
          <Button variant="text" size="small" onClick={cargarPreventasPendientes}>
            Actualizar Lista
          </Button>
        </Box>

        {/* Tabla de preventas pendientes */}
        <TableContainer component={Paper} variant="outlined" sx={{ flexGrow: 1, maxHeight: '300px', overflowY: 'auto' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nro. Preventa</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>RUC</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Monto Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cajero</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {preventas.map((prev, index) => (
                  <TableRow
                    key={prev.idPreventa}
                    hover
                    onClick={() => handleRowClick(prev)}
                    selected={index === selectedIndex}
                    sx={{
                      cursor: 'pointer',
                      '&.Mui-selected': {
                        bgcolor: 'action.selected',
                      },
                      '&.Mui-selected:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'bold' }}>#{prev.idPreventa}</TableCell>
                    <TableCell>{new Date(prev.fechaAlta).toLocaleString('es-PY')}</TableCell>
                    <TableCell>{prev.nombreCliente}</TableCell>
                    <TableCell>{prev.ruc}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      ₲{prev.totalVenta.toLocaleString('es-PY')}
                    </TableCell>
                    <TableCell>{prev.vendedor}</TableCell>
                  </TableRow>
                ))}
                {preventas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No hay preventas pendientes de facturación.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default RecargarPreventaModal;
