import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Paper,
} from '@mui/material';

interface PagoModalProps {
  open: boolean;
  totalVenta: number;
  onClose: () => void;
  onConfirm: () => void;
}

const PagoModal: React.FC<PagoModalProps> = ({
  open,
  totalVenta,
  onClose,
  onConfirm,
}) => {
  const [montoCliente, setMontoCliente] = useState<string>('');
  const [vuelto, setVuelto] = useState<number>(0);

  // Calcular el vuelto cuando cambia el monto del cliente
  useEffect(() => {
    const monto = parseFloat(montoCliente) || 0;
    const vueltoCalculado = monto - totalVenta;
    setVuelto(vueltoCalculado >= 0 ? vueltoCalculado : 0);
  }, [montoCliente, totalVenta]);

  // Resetear cuando se abre el modal
  useEffect(() => {
    if (open) {
      setMontoCliente('');
      setVuelto(0);
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm();
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-PY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" fontWeight="bold">
          Finalizar Venta
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {/* Monto del Cliente */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Monto del Cliente:
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={montoCliente}
              onChange={(e) => setMontoCliente(e.target.value)}
              placeholder="0.00"
              autoFocus
              InputProps={{
                sx: {
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }
              }}
              inputProps={{ min: 0 }}
              helperText="Ingrese el monto recibido del cliente (puede dejar en 0)"
            />
          </Box>

          {/* Total de la Venta */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Total de la Venta:
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: '#e3f2fd',
                textAlign: 'right'
              }}
            >
              <Typography variant="h4" fontWeight="bold" color="primary">
                {formatCurrency(totalVenta)}
              </Typography>
            </Paper>
          </Box>

          {/* Vuelto */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Vuelto:
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: '#fff9c4',
                textAlign: 'right'
              }}
            >
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {formatCurrency(vuelto)}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="success"
          size="large"
          fullWidth
          sx={{ py: 1.5 }}
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PagoModal;
