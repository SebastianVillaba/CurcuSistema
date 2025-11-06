import { useState } from 'react';
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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Caja } from '../types/caja.types';

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

  // Mock data - esto se reemplazará con datos del backend
  const cajas: Caja[] = [
    { idCaja: 1, nombre: 'Caja 1', estado: 1, descripcion: 'Caja Principal' },
    { idCaja: 2, nombre: 'Caja 2', estado: 0, descripcion: 'Caja Secundaria' },
    { idCaja: 3, nombre: 'Caja 3', estado: 1, descripcion: 'Caja Express' },
    { idCaja: 4, nombre: 'Caja 4', estado: 0, descripcion: 'Caja VIP' },
    { idCaja: 5, nombre: 'Caja 5', estado: 1, descripcion: 'Caja Mostrador' },
  ];

  const handleSelectCaja = (caja: Caja) => {
    setSelectedCaja(caja);
  };

  const handleConfirm = () => {
    if (selectedCaja) {
      onSelectCaja(selectedCaja);
      setSelectedCaja(null);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedCaja(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Seleccionar Caja
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selecciona la caja que deseas abrir para trabajar
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {cajas.map((caja) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={caja.idCaja}>
              <Paper
                elevation={selectedCaja?.idCaja === caja.idCaja ? 8 : 2}
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  position: 'relative',
                  backgroundColor: caja.estado === 1 ? '#f44336' : '#4caf50',
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
                    {caja.nombre}
                  </Typography>
                  {caja.descripcion && (
                    <Typography variant="body2" sx={{ opacity: 0.9, textAlign: 'center' }}>
                      {caja.descripcion}
                    </Typography>
                  )}
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
                    {caja.estado === 1 ? 'Ocupada' : 'Libre'}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {selectedCaja && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: 'primary.light',
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            <Typography variant="body1" color="primary.contrastText">
              Has seleccionado: <strong>{selectedCaja.nombre}</strong>
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCancel} variant="outlined" color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={!selectedCaja}
        >
          Abrir Caja
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CajaSelectorModal;
