import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { personaService } from '../services/persona.service';
import { ubicacionService } from '../services/ubicacion.service';
import type { Departamento, Distrito, Ciudad } from '../types/ubicacion.types';

interface ClienteData {
  idPersona?: number;
  ruc: string;
  dv: string;
  nombre: string;
  apellido?: string;
  direccion: string;
  idDepartamento?: number;
  idDistrito?: number;
  idCiudad?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  fechaNacimiento?: string;
}

interface ClienteFormProps {
  open: boolean;
  onClose: () => void;
  onClienteSelected: (cliente: ClienteData) => void;
}

const paises = ['PARAGUAY', 'ARGENTINA', 'BRASIL', 'CHILE', 'URUGUAY', 'BOLIVIA'];
const tiposDocumento = [
  { id: 1, nombre: 'Cédula paraguaya' },
  { id: 2, nombre: 'RUC' },
];

const ClienteForm: React.FC<ClienteFormProps> = ({ open, onClose, onClienteSelected }) => {
  const [ruc, setRuc] = useState('');
  const [dv, setDv] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [direccion, setDireccion] = useState('');
  const [pais, setPais] = useState('PARAGUAY');
  const [tipoDocumento, setTipoDocumento] = useState(2);
  const [telefono, setTelefono] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para ubicación
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [idDepartamento, setIdDepartamento] = useState<number | undefined>();
  const [idDistrito, setIdDistrito] = useState<number | undefined>();
  const [idCiudad, setIdCiudad] = useState<string | undefined>();

  // Cargar departamentos al abrir el modal
  useEffect(() => {
    if (open) {
      cargarDepartamentos();
    }
  }, [open]);

  // Cargar distritos cuando cambia el departamento
  useEffect(() => {
    if (idDepartamento) {
      cargarDistritos(idDepartamento);
    } else {
      setDistritos([]);
      setCiudades([]);
    }
  }, [idDepartamento]);

  // Cargar ciudades cuando cambia el distrito
  useEffect(() => {
    if (idDistrito) {
      cargarCiudades(idDistrito);
    } else {
      setCiudades([]);
    }
  }, [idDistrito]);

  const cargarDepartamentos = async () => {
    try {
      const data = await ubicacionService.obtenerDepartamentos();
      setDepartamentos(data);
      
      // Establecer Itapúa por defecto
      const itapua = data.find(d => d.nombre.toUpperCase().includes('ITAP'));
      if (itapua) {
        setIdDepartamento(itapua.idDepartamento);
      }
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
    }
  };

  const cargarDistritos = async (idDep: number) => {
    try {
      const data = await ubicacionService.obtenerDistritosPorDepartamento(idDep);
      setDistritos(data);
      
      // Establecer Encarnación por defecto
      const encarnacion = data.find(d => d.nombre.toUpperCase().includes('ENCARNA'));
      if (encarnacion) {
        setIdDistrito(encarnacion.idDistrito);
      }
    } catch (error) {
      console.error('Error al cargar distritos:', error);
    }
  };

  const cargarCiudades = async (idDist: number) => {
    try {
      const data = await ubicacionService.obtenerCiudadesPorDistrito(idDist);
      setCiudades(data);
      
      // Establecer Encarnación por defecto
      const encarnacion = data.find(c => c.nombreCiudad.toUpperCase().includes('ENCARNA'));
      if (encarnacion) {
        setIdCiudad(encarnacion.idCiudad.toString());
      }
    } catch (error) {
      console.error('Error al cargar ciudades:', error);
    }
  };

  const handleRucKeyPress = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && ruc.trim()) {
      await buscarClientePorRuc();
    }
  };

  const buscarClientePorRuc = async () => {
    if (!ruc.trim()) {
      setError('Ingrese un RUC válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const resultado = await personaService.consultarPersonaPorRuc(ruc);
      
      if (resultado && resultado.length > 0) {
        const cliente = resultado[0];
        
        // Llenar los campos con la información encontrada
        setNombre(cliente.nombre || '');
        setApellido(cliente.apellido || '');
        setDv(cliente.dv?.toString() || '');
        setDireccion(cliente.direccion || '');
        setTelefono(cliente.telefono || '');
        setCelular(cliente.celular || '');
        setEmail(cliente.email || '');
        
        // Establecer ubicación
        if (cliente.idDepartamento) setIdDepartamento(cliente.idDepartamento);
        if (cliente.idDistrito) setIdDistrito(cliente.idDistrito);
        if (cliente.idCiudad) setIdCiudad(cliente.idCiudad.toString());
        
        if (cliente.fechaNacimiento) {
          const fecha = new Date(cliente.fechaNacimiento);
          setFechaNacimiento(fecha.toISOString().split('T')[0]);
        }
      } else {
        setError('No se encontró ningún cliente con ese RUC');
      }
    } catch (err: any) {
      console.error('Error al buscar cliente:', err);
      setError('Error al buscar cliente por RUC');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = () => {
    // Validaciones
    if (!ruc.trim()) {
      setError('El RUC es obligatorio');
      return;
    }

    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    const clienteData: ClienteData = {
      ruc,
      dv,
      nombre,
      apellido,
      direccion,
      idDepartamento,
      idDistrito,
      idCiudad,
      telefono,
      celular,
      email,
      fechaNacimiento,
    };

    onClienteSelected(clienteData);
    handleCancelar();
  };

  const handleCancelar = () => {
    // Limpiar formulario
    setRuc('');
    setDv('');
    setNombre('');
    setApellido('');
    setDireccion('');
    setTelefono('');
    setCelular('');
    setEmail('');
    setFechaNacimiento('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancelar} maxWidth="md" fullWidth>
      <DialogTitle>Buscar Clientes</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        <Stack spacing={2} sx={{ mt: 2 }}>
          {/* RUC / Cédula */}
          <Stack direction="row" spacing={1}>
            <TextField
              label="RUC / Cédula"
              value={ruc}
              onChange={(e) => setRuc(e.target.value)}
              onKeyPress={handleRucKeyPress}
              size="small"
              sx={{ width: '200px' }}
              autoFocus
            />
            <TextField
              label="DV"
              value={dv}
              onChange={(e) => setDv(e.target.value)}
              size="small"
              sx={{ width: '80px' }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>País</InputLabel>
              <Select value={pais} onChange={(e) => setPais(e.target.value)} label="País">
                {paises.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Tipo de docu.</InputLabel>
              <Select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value as number)}
                label="Tipo de docu."
              >
                {tiposDocumento.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Nombre y Apellido */}
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Nombre y Apellido"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              size="small"
            />
          </Stack>

          {/* Dirección */}
          <TextField
            fullWidth
            label="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            size="small"
          />

          {/* Fecha Nacimiento y Celular */}
          <Stack direction="row" spacing={2}>
            <TextField
              label="Fecha Nacimiento"
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ width: '200px' }}
            />
            <TextField
              fullWidth
              label="Nro. Celular1"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              size="small"
            />
          </Stack>

          {/* Email */}
          <TextField
            fullWidth
            label="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
          />

          {/* Departamento */}
          <Autocomplete
            fullWidth
            size="small"
            options={departamentos}
            getOptionLabel={(option) => option.nombre}
            value={departamentos.find((d) => d.idDepartamento === idDepartamento) || null}
            onChange={(_, newValue) => {
              setIdDepartamento(newValue?.idDepartamento);
              setIdDistrito(undefined);
              setIdCiudad(undefined);
            }}
            renderInput={(params) => <TextField {...params} label="Departamento" />}
          />

          {/* Distrito */}
          <Autocomplete
            fullWidth
            size="small"
            options={distritos}
            getOptionLabel={(option) => option.nombre}
            value={distritos.find((d) => d.idDistrito === idDistrito) || null}
            onChange={(_, newValue) => {
              setIdDistrito(newValue?.idDistrito);
              setIdCiudad(undefined);
            }}
            disabled={!idDepartamento}
            renderInput={(params) => <TextField {...params} label="Distrito" />}
          />

          {/* Ciudad */}
          <Autocomplete
            fullWidth
            size="small"
            options={ciudades}
            getOptionLabel={(option) => option.nombreCiudad}
            value={ciudades.find((c) => c.idCiudad.toString() === idCiudad) || null}
            onChange={(_, newValue) => {
              setIdCiudad(newValue?.idCiudad?.toString());
            }}
            disabled={!idDistrito}
            renderInput={(params) => <TextField {...params} label="Ciudad" />}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelar} startIcon={<CancelIcon />}>
          Salir
        </Button>
        <Button onClick={handleGuardar} variant="contained" startIcon={<SaveIcon />} color="primary">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClienteForm;