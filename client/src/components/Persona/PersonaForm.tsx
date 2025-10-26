import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  Stack,
  Container,
  Paper,
} from '@mui/material';
import type { Persona } from '../../types/persona.types';
import { TipoPersonaForm } from './tipoPersonaForm';

interface PersonaFormProps {
  formData: Persona;
  setFormData: React.Dispatch<React.SetStateAction<Persona>>;
}


const paises = [
  "PARAGUAY",
  "ARGENTINA",
  "BRASIL",
  "CHILE"
]
// Datos de ejemplo para los combobox
const departamentos = [
  'ALTO PARAGUAY',
  'BOQUERÓN',
  'PRESIDENTE HAYES',
  'CONCEPCIÓN',
  'SAN PEDRO',
  'CORDILLERA',
  'GUAIRÁ',
  'CAAGUAZÚ',
  'CAAZAPÁ',
  'ITAPÚA',
  'MISIONES',
  'PARAGUARÍ',
  'ALTO PARANÁ',
  'CENTRAL',
  'ÑEEMBUCÚ',
  'AMAMBAY',
  'CANINDEYÚ',
  'ASUNCIÓN',
];

const distritos = [
  '1RO.DE MARZO',
  'AREGUÁ',
  'CAPIATÁ',
  'FERNANDO DE LA MORA',
  'GUARAMBARÉ',
  'ITÁ',
  'ITAUGUÁ',
  'LAMBARÉ',
  'LIMPIO',
  'LUQUE',
  'MARIANO ROQUE ALONSO',
  'NUEVA ITALIA',
  'ÑEMBY',
  'SAN ANTONIO',
  'SAN LORENZO',
  'VILLA ELISA',
  'VILLETA',
  'YPACARAÍ',
];

const ciudades = [
  'ASUNCIÓN',
  'FERNANDO DE LA MORA',
  'LAMBARÉ',
  'LUQUE',
  'SAN LORENZO',
  'CAPIATÁ',
  'LIMPIO',
  'OBRAJE PINDOTY',
  'ENCARNACION'
];

const tiposDocumento = [
  'Cédula paraguaya',
  'RUC',
  'Pasaporte',
  'Otro',
];

export default function PersonaForm({ formData, setFormData }: PersonaFormProps): JSX.Element {
  const handleChange = (field: keyof Persona) => (
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
            label="ID"
            value={formData.idPersona || ''}
            disabled
            size="small"
            sx={{ width: '75px' }}
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

        {/* Fila 2: RUC, DV, Dirección */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="RUC"
            value={formData.ruc || ''}
            onChange={handleChange('ruc')}
            size="small"
            sx={{ width: '200px' }}
          />
          <TextField
            label="DV"
            value={formData.dv || ''}
            onChange={handleChange('dv')}
            size="small"
            sx={{ width: '100px' }}
          />
          <TextField
            fullWidth
            label="Dirección"
            value={formData.direccion || ''}
            onChange={handleChange('direccion')}
            size="small"
          />
        </Stack>

        {/* Fila 4: Tipo de documento, Departamento */}
        <Stack direction="row" spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo de documento</InputLabel>
            <Select
              value={formData.tipoDocumento || ''}
              onChange={handleChange('tipoDocumento')}
              label="Tipo de documento"
            >
              {tiposDocumento.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Departamento</InputLabel>
            <Select
              // value={formData.departamento || ''}
              // onChange={handleChange('departamento')}
              label="Departamento"
            >
              {departamentos.map((depto) => (
                <MenuItem key={depto} value={depto}>
                  {depto}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Fila 5: Distrito, Ciudad */}
        <Stack direction="row" spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Distrito</InputLabel>
            <Select
              //value={formData.distrito || ''}
              //onChange={handleChange('distrito')}
              label="Distrito"
            >
              {distritos.map((dist) => (
                <MenuItem key={dist} value={dist}>
                  {dist}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Ciudad</InputLabel>
            <Select
              value={formData.ciudad || ''}
              onChange={handleChange('ciudad')}
              label="Ciudad"
            >
              {ciudades.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Fila 6: Fecha Aniversario, Teléfonos */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Fecha Aniversario"
            type="date"
            value={formData.fechaNacimiento || ''}
            onChange={handleChange('fechaNacimiento')}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ width: '200px' }}
          />
          <TextField
            label="Teléfono"
            value={formData.telefono || ''}
            onChange={handleChange('telefono')}
            size="small"
            fullWidth
          />
        </Stack>

        {/* Fila 7: Celulares, Email */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Celular"
            value={formData.celular || ''}
            onChange={handleChange('celular')}
            size="small"
            fullWidth
          />
          <TextField
            fullWidth
            label="E-mail"
            type="email"
            value={formData.email || ''}
            onChange={handleChange('email')}
            size="small"
          />
        </Stack>
      </Stack>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, mt: 3 }}>
        <TipoPersonaForm formData={formData} setFormData={setFormData} />
      </Paper>
    </Box>
  );
}
