import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import { useState, useEffect } from 'react';
import type { Producto, TipoProducto } from '../../types/producto.types';
import { productoService } from '../../services/producto.service';

interface ProductoFormProps {
  formData: Producto;
  setFormData: React.Dispatch<React.SetStateAction<Producto>>;
}

export default function ProductoForm({ formData, setFormData }: ProductoFormProps): JSX.Element {
  const [tiposProducto, setTiposProducto] = useState<TipoProducto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTiposProducto = async () => {
      setLoading(true);
      try {
        const tipos = await productoService.obtenerTiposProducto();
        setTiposProducto(tipos);
      } catch (error) {
        console.error('Error al cargar tipos de producto:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTiposProducto();
  }, []);

  const handleChange = (field: keyof Producto) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  return (
    <Box>
      <Typography variant="caption" color="error" sx={{ my: 2, display: 'block' }}>
        * Datos Obligatorios
      </Typography>
      <Stack spacing={2.5}>
        {/* Fila 1: ID y Nombre */}
        <Stack direction="column" spacing={2}>
          <TextField
            label="ID Producto"
            value={formData.idProducto || ''}
            disabled
            size="small"
            sx={{ width: '150px' }}
          />
          <TextField
            fullWidth
            label="Nombre"
            value={formData.nombre}
            onChange={handleChange('nombre')}
            required
            size="small"
            error={!formData.nombre}
            helperText={!formData.nombre ? 'Campo obligatorio' : ''}
          />
        </Stack>

        {/* Fila 2: Presentación y Código */}
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label="Presentación"
            value={formData.presentacion}
            onChange={handleChange('presentacion')}
            required
            size="small"
            error={!formData.presentacion}
            helperText={!formData.presentacion ? 'Campo obligatorio' : ''}
          />
          <TextField
            fullWidth
            label="Código"
            value={formData.codigo}
            onChange={handleChange('codigo')}
            required
            size="small"
            error={!formData.codigo}
            helperText={!formData.codigo ? 'Campo obligatorio' : ''}
          />
        </Stack>

        {/* Fila 3: Código de Barra */}
        <TextField
          fullWidth
          label="Código de Barra"
          value={formData.codigoBarra}
          onChange={handleChange('codigoBarra')}
          size="small"
        />

        {/* Fila 4: Precio y Costo */}
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label="Precio"
            type="number"
            value={formData.precio}
            onChange={handleChange('precio')}
            required
            size="small"
            error={formData.precio <= 0}
            helperText={formData.precio <= 0 ? 'Precio debe ser mayor a 0' : ''}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            fullWidth
            label="Costo"
            type="number"
            value={formData.costo}
            onChange={handleChange('costo')}
            required
            size="small"
            error={formData.costo <= 0}
            helperText={formData.costo <= 0 ? 'Costo debe ser mayor a 0' : ''}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Stack>

        {/* Fila 5: Tipo de Producto */}
        <FormControl fullWidth size="small">
          <InputLabel>Tipo de Producto</InputLabel>
          <Select
            value={formData.idTipoProducto || ''}
            onChange={handleChange('idTipoProducto')}
            label="Tipo de Producto"
            disabled={loading}
          >
            {tiposProducto.map((tipo) => (
              <MenuItem key={tipo.idTipoProducto} value={tipo.idTipoProducto}>
                {tipo.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
}
