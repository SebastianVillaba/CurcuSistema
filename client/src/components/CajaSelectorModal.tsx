import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Collapse,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { Caja, MovimientoCaja } from '../types/caja.types';
import axios from 'axios';
import { reporteService } from '../services/reporte.service';
import { ticketService } from '../services/ticket.service';

interface CajaSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelectCaja: (caja: Caja) => void;
}

const CajaSelectorModal: React.FC<CajaSelectorModalProps> = ({
  open,
  onClose,
  onSelectCaja,
}) => {
  const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);
  const [expandedCaja, setExpandedCaja] = useState<number | null>(null);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [movimientos, setMovimientos] = useState<{ [key: number]: MovimientoCaja[] }>({});
  const [selectedMovimiento, setSelectedMovimiento] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [montoInicial, setMontoInicial] = useState<string>('');
  const [montoFinal, setMontoFinal] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Cargar cajas cuando se abre el modal
  useEffect(() => {
    if (open) {
      cargarCajas();
    }
  }, [open]);

  const cargarCajas = async () => {
    setLoading(true);
    try {
      const idUsuario = localStorage.getItem('idUsuario') || '1';
      const response = await axios.get(`${API_URL}/caja/consultar`, {
        params: { idUsuario }
      });

      if (response.data.success) {
        setCajas(response.data.result);
      }
    } catch (error) {
      console.error('Error al cargar cajas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarMovimientos = async (idCaja: number) => {
    try {
      const response = await axios.get(`${API_URL}/caja/movimientos`, {
        params: { idCaja }
      });

      if (response.data.success) {
        setMovimientos(prev => ({
          ...prev,
          [idCaja]: response.data.result
        }));
      }
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
    }
  };

  const handleSelectCaja = async (caja: Caja) => {
    const idCajaActual = localStorage.getItem('idCajaActual');

    // Si la caja está abierta (estadoCaja = true), verificar si es mi caja
    if (caja.estadoCaja === true) {
      const esMiCaja = idCajaActual && parseInt(idCajaActual) === caja.idCaja;
      if (!esMiCaja) {
        alert('Esta caja ya está abierta por otro usuario');
        return;
      }
    }

    if (expandedCaja === caja.idCaja) {
      setExpandedCaja(null);
    } else {
      setExpandedCaja(caja.idCaja);
      if (!movimientos[caja.idCaja]) {
        await cargarMovimientos(caja.idCaja);
      }
    }
    setSelectedCaja(caja);
    setSelectedMovimiento(null);
    setMontoInicial('');
    setMontoFinal('');
  };

  const handleAbrirCaja = async () => {
    if (!selectedCaja || !montoInicial) {
      alert('Por favor ingrese el monto inicial');
      return;
    }

    setLoadingAction(true);
    try {
      const idUsuario = localStorage.getItem('idUsuario') || '1';
      const response = await axios.post(`${API_URL}/caja/abrir`, {
        idCaja: selectedCaja.idCaja,
        idUsuario: parseInt(idUsuario),
        montoInicial: parseFloat(montoInicial)
      });

      if (response.data.success) {
        // Guardar el idMovimientoCaja que devuelve el SP
        const idMovimientoCaja = response.data.idMovimientoCaja;
        if (idMovimientoCaja) {
          localStorage.setItem('idMovimientoCaja', idMovimientoCaja.toString());
          localStorage.setItem('idCajaActual', selectedCaja.idCaja.toString());
        }

        alert('Caja abierta exitosamente');
        await cargarCajas();
        await cargarMovimientos(selectedCaja.idCaja);
        setMontoInicial('');

        // Cerrar el modal después de abrir la caja
        onSelectCaja(selectedCaja);
        handleCancel();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al abrir la caja');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCerrarCaja = async () => {
    if (!selectedCaja || !montoFinal) {
      alert('Por favor ingrese el monto final contado');
      return;
    }

    // Verificar que sea MI caja la que estoy cerrando
    const idMovimientoCaja = localStorage.getItem('idMovimientoCaja');
    const idCajaActual = localStorage.getItem('idCajaActual');

    if (!idMovimientoCaja || parseInt(idCajaActual || '0') !== selectedCaja.idCaja) {
      alert('Solo puedes cerrar la caja que tú abriste');
      return;
    }

    setLoadingAction(true);
    try {
      const idUsuario = localStorage.getItem('idUsuario') || '1';
      const response = await axios.post(`${API_URL}/caja/cerrar`, {
        idCaja: selectedCaja.idCaja,
        idMovimientoCaja: parseInt(idMovimientoCaja),
        idUsuarioCierre: parseInt(idUsuario),
        montoFinalContado: parseFloat(montoFinal)
      });

      if (response.data.success) {
        // Limpiar el localStorage después de cerrar la caja
        localStorage.removeItem('idMovimientoCaja');
        localStorage.removeItem('idCajaActual');

        alert('Caja cerrada exitosamente');
        await cargarCajas();
        await cargarMovimientos(selectedCaja.idCaja);
        setMontoFinal('');
        handleCancel();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cerrar la caja');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancel = () => {
    setSelectedCaja(null);
    setExpandedCaja(null);
    setSelectedMovimiento(null);
    setMontoInicial('');
    setMontoFinal('');
    onClose();
  };

  const handleSelectMovimiento = (idMovimientoCaja: number) => {
    setSelectedMovimiento(idMovimientoCaja);
  };



  const handleImprimirReporte = async () => {
    if (!selectedMovimiento) return;

    setLoadingAction(true);
    try {
      const data = await reporteService.obtenerDatosCierreCaja(selectedMovimiento);
      if (data.success) {
        ticketService.generarTicketCierreCaja(data);
      }
    } catch (error: any) {
      alert(error.message || 'Error al generar el reporte');
    } finally {
      setLoadingAction(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Abierto';
    return new Date(dateString).toLocaleString('es-PY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Gestión de Cajas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selecciona una caja para ver sus movimientos y gestionarla
        </Typography>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {cajas.map((caja) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={caja.idCaja}>
                  <Paper
                    elevation={selectedCaja?.idCaja === caja.idCaja ? 8 : 2}
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: caja.estadoCaja === true ? '#4caf50' : '#9e9e9e',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      border: selectedCaja?.idCaja === caja.idCaja ? '3px solid #fff' : 'none',
                      transform: selectedCaja?.idCaja === caja.idCaja ? 'scale(1.05)' : 'scale(1)',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: 6,
                      }
                    }}
                    onClick={() => handleSelectCaja(caja)}
                  >
                    {selectedCaja?.idCaja === caja.idCaja && (
                      <CheckCircleIcon
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          fontSize: 30,
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 120,
                      }}
                    >
                      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {caja.idCaja}
                      </Typography>
                      <Typography variant="h6" component="div" sx={{ mb: 0.5 }}>
                        {caja.nombreCaja}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 1,
                          px: 2,
                          py: 0.5,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 1,
                        }}
                      >
                        {caja.estadoCaja === true ? 'Abierta' : 'Cerrada'}
                      </Typography>
                      {expandedCaja === caja.idCaja && (
                        <Box sx={{ mt: 1 }}>
                          {expandedCaja === caja.idCaja ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Sección expandida con movimientos */}
            <Collapse in={expandedCaja !== null && selectedCaja !== null}>
              {selectedCaja && expandedCaja === selectedCaja.idCaja && (
                <Box sx={{ mt: 3 }}>
                  <Paper sx={{ p: 2 }}>
                    {/* Solo mostrar movimientos si es mi caja o está cerrada */}
                    {(() => {
                      const idCajaActual = localStorage.getItem('idCajaActual');
                      const esMiCaja = parseInt(idCajaActual || '0') === selectedCaja.idCaja;
                      const mostrarMovimientos = selectedCaja.estadoCaja === false || esMiCaja;

                      return mostrarMovimientos ? (
                        <>
                          <Typography variant="h6" gutterBottom>
                            Movimientos de {selectedCaja.nombreCaja}
                          </Typography>

                          {movimientos[selectedCaja.idCaja] && movimientos[selectedCaja.idCaja].length > 0 ? (
                            <TableContainer
                              sx={{
                                maxHeight: 400,
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                '& .MuiTableCell-root': {
                                  borderBottom: '1px solid #e0e0e0'
                                }
                              }}
                            >
                              <Table stickyHeader size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                      ID Movimiento
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                      Fecha Apertura
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                      Fecha Cierre
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                      Estado
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {movimientos[selectedCaja.idCaja].map((mov) => {
                                    const idMovimientoCajaActual = localStorage.getItem('idMovimientoCaja');
                                    const esMovimientoActual = idMovimientoCajaActual &&
                                      parseInt(idMovimientoCajaActual) === mov.idMovimientoCaja;
                                    const isSelected = selectedMovimiento === mov.idMovimientoCaja;

                                    return (
                                      <TableRow
                                        key={mov.idMovimientoCaja}
                                        onClick={() => handleSelectMovimiento(mov.idMovimientoCaja)}
                                        sx={{
                                          cursor: 'pointer',
                                          backgroundColor: esMovimientoActual
                                            ? '#e8f5e9'
                                            : isSelected
                                              ? '#f5f5f5'
                                              : 'transparent',
                                          '&:hover': {
                                            backgroundColor: esMovimientoActual
                                              ? '#c8e6c9'
                                              : '#f0f0f0'
                                          },
                                          transition: 'background-color 0.2s'
                                        }}
                                      >
                                        <TableCell>{mov.idMovimientoCaja}</TableCell>
                                        <TableCell>{formatDate(mov.fechaApertura)}</TableCell>
                                        <TableCell>{formatDate(mov.fechaCierre)}</TableCell>
                                        <TableCell>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              px: 1,
                                              py: 0.5,
                                              borderRadius: 1,
                                              backgroundColor: !mov.fechaCierre
                                                ? '#4caf50'
                                                : '#9e9e9e',
                                              color: 'white',
                                              fontWeight: 'bold'
                                            }}
                                          >
                                            {!mov.fechaCierre ? 'Abierto' : 'Cerrado'}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                              No hay movimientos registrados
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          Esta caja está siendo utilizada por otro usuario
                        </Typography>
                      );
                    })()}

                    {/* Controles de abrir/cerrar caja - Solo mostrar si es mi caja o está cerrada */}
                    {(() => {
                      const idCajaActual = localStorage.getItem('idCajaActual');
                      const esMiCaja = parseInt(idCajaActual || '0') === selectedCaja.idCaja;
                      const mostrarControles = selectedCaja.estadoCaja === false || esMiCaja;

                      return mostrarControles ? (
                        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: 'column' }}>
                          {selectedCaja.estadoCaja === false ? (
                            selectedMovimiento ? (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={handleImprimirReporte}
                                fullWidth
                              >
                                Imprimir Reporte
                              </Button>
                            ) : (
                              <>
                                <TextField
                                  label="Monto Inicial"
                                  type="number"
                                  value={montoInicial}
                                  onChange={(e) => setMontoInicial(e.target.value)}
                                  fullWidth
                                  size="small"
                                />
                                <Button
                                  variant="contained"
                                  color="success"
                                  onClick={handleAbrirCaja}
                                  disabled={loadingAction || !montoInicial}
                                  fullWidth
                                >
                                  {loadingAction ? <CircularProgress size={24} /> : 'Abrir Caja'}
                                </Button>
                              </>
                            )
                          ) : (() => {
                            // Verificar si el movimiento seleccionado es el actual
                            const idMovimientoCajaActual = localStorage.getItem('idMovimientoCaja');
                            const movimientoSeleccionado = selectedMovimiento
                              ? movimientos[selectedCaja.idCaja]?.find(m => m.idMovimientoCaja === selectedMovimiento)
                              : null;
                            const esMovimientoActual = idMovimientoCajaActual &&
                              movimientoSeleccionado &&
                              parseInt(idMovimientoCajaActual) === movimientoSeleccionado.idMovimientoCaja;
                            const esMovimientoCerrado = movimientoSeleccionado?.fechaCierre !== null;

                            // Si es el movimiento actual y está abierto, mostrar cerrar caja
                            if (esMovimientoActual && !esMovimientoCerrado) {
                              return (
                                <>
                                  <TextField
                                    label="Monto Final Contado"
                                    type="number"
                                    value={montoFinal}
                                    onChange={(e) => setMontoFinal(e.target.value)}
                                    fullWidth
                                    size="small"
                                  />
                                  <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleCerrarCaja}
                                    disabled={loadingAction || !montoFinal}
                                    fullWidth
                                  >
                                    {loadingAction ? <CircularProgress size={24} /> : 'Cerrar Caja'}
                                  </Button>
                                </>
                              );
                            }

                            // Si hay un movimiento seleccionado y está cerrado, mostrar imprimir reporte
                            if (selectedMovimiento && esMovimientoCerrado) {
                              return (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={handleImprimirReporte}
                                  fullWidth
                                >
                                  Imprimir Reporte
                                </Button>
                              );
                            }

                            // Si no hay movimiento seleccionado, mostrar mensaje
                            return (
                              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                Selecciona un movimiento para ver las opciones disponibles
                              </Typography>
                            );
                          })()}
                        </Box>
                      ) : null;
                    })()}
                  </Paper>
                </Box>
              )}
            </Collapse>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCancel} variant="outlined" color="inherit">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CajaSelectorModal;
