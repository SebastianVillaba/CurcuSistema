import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Typography,
} from '@mui/material';
import TextField from '../components/UppercaseTextField';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { personaService } from '../services/persona.service';
import { ubicacionService } from '../services/ubicacion.service';
import { distribucionService } from '../services/distribucion.service';
import MapaCliente from './MapaCliente';
import type { Departamento, Distrito, Ciudad } from '../types/ubicacion.types';
import type { GrupoCliente } from '../types/persona.types';

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
  porcentajeDescuento?: number;
  idGrupoCliente?: number;
  latitud?: number;
  longitud?: number;
}

interface ClienteFormProps {
  open: boolean;
  onClose: () => void;
  onClienteSelected: (cliente: ClienteData) => void;
  onSuccess?: () => void;
}

const paises = ['PARAGUAY', 'ARGENTINA', 'BRASIL', 'CHILE', 'URUGUAY', 'BOLIVIA'];
const tiposDocumento = [
  { id: 1, nombre: 'Cédula paraguaya' },
  { id: 2, nombre: 'RUC' },
];

const ClienteForm: React.FC<ClienteFormProps> = ({ open, onClose, onClienteSelected, onSuccess }) => {
  const [idPersona, setIdPersona] = useState<number | undefined>();
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
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
  const [porcentajeDescuento, setPorcentajeDescuento] = useState<number>(0);
  const [gruposCliente, setGruposCliente] = useState<GrupoCliente[]>([]);
  const [idGrupoCliente, setIdGrupoCliente] = useState<number>(1);

  // Estados para Geolocalización
  const [latitud, setLatitud] = useState<number | undefined>();
  const [longitud, setLongitud] = useState<number | undefined>();
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // TODO: Obtener idUsuario del contexto de autenticación
  const idUsuario = 1; // Temporal

  // Estados para ubicación
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [idDepartamento, setIdDepartamento] = useState<number | undefined>();
  const [idDistrito, setIdDistrito] = useState<number | undefined>();
  const [idCiudad, setIdCiudad] = useState<string | undefined>();

  // Cargar departamentos y grupos al abrir el modal
  useEffect(() => {
    if (open) {
      cargarDepartamentos();
      cargarGrupos();
    }
  }, [open]);

  const cargarGrupos = async () => {
    try {
      const data = await personaService.obtenerGruposCliente();
      setGruposCliente(data);
    } catch (error) {
      console.error('Error al cargar grupos de clientes:', error);
    }
  };


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

  const parseGoogleMapsUrl = (url: string) => {
    if (!url) return;
    
    // Expresiones regulares para extraer coordenadas de URLs de Google Maps
    const regexAt = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const regexQ = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const regexPlace = /\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/;
    const regexQuery = /[?&]query=(-?\d+\.\d+),(-?\d+\.\d+)/;

    let match = url.match(regexAt);
    if (!match) match = url.match(regexQ);
    if (!match) match = url.match(regexPlace);
    if (!match) match = url.match(regexQuery);

    if (match && match.length >= 3) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        setLatitud(lat);
        setLongitud(lng);
        setError('');
      }
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
      const resultado = await personaService.buscarClientePorRuc(ruc, idUsuario);

      if (resultado && resultado.length > 0) {
        const cliente = resultado[0];

        // Guardar el idCliente
        setIdPersona(cliente.idCliente);
        setClienteEncontrado(true);
        setPorcentajeDescuento(cliente.porcentajeDescuento || 0);

        // Llenar los campos con la información encontrada
        setNombre(cliente.nombre || '');
        setApellido(cliente.apellido || '');
        setDv(cliente.dv?.toString() || '');
        setDireccion(cliente.direccion || '');
        setTelefono(cliente.telefono || '');
        setCelular(cliente.celular || '');
        setEmail(cliente.email || '');

        // Geolocalización
        if (cliente.latitud) setLatitud(Number(cliente.latitud));
        if (cliente.longitud) setLongitud(Number(cliente.longitud));
        if (cliente.latitud && cliente.longitud) {
          setGoogleMapsUrl(`https://www.google.com/maps?q=${cliente.latitud},${cliente.longitud}`);
        } else {
          setGoogleMapsUrl('');
        }

        // Establecer ubicación
        if (cliente.idDepartamento) setIdDepartamento(cliente.idDepartamento);
        if (cliente.idDistrito) setIdDistrito(cliente.idDistrito);
        if (cliente.idCiudad) setIdCiudad(cliente.idCiudad.toString());

        if (cliente.fechaNacimiento) {
          const fecha = new Date(cliente.fechaNacimiento);
          setFechaNacimiento(fecha.toISOString().split('T')[0]);
        }

        // Seleccionar automáticamente el cliente encontrado
        const clienteData: ClienteData = {
          idPersona: cliente.idCliente,
          ruc: cliente.ruc || ruc || '',
          dv: cliente.dv?.toString() || dv || '',
          nombre: cliente.nombre || '',
          apellido: cliente.apellido || '',
          direccion: cliente.direccion || '',
          idDepartamento: cliente.idDepartamento,
          idDistrito: cliente.idDistrito,
          idCiudad: cliente.idCiudad?.toString(),
          telefono: cliente.telefono,
          celular: cliente.celular,
          email: cliente.email,
          fechaNacimiento: cliente.fechaNacimiento,
          porcentajeDescuento: cliente.porcentajeDescuento || 0,
          latitud: cliente.latitud ? Number(cliente.latitud) : undefined,
          longitud: cliente.longitud ? Number(cliente.longitud) : undefined,
        };

        onClienteSelected(clienteData);
        handleCancelar();
      } else {
        // No se encontró, permitir agregar nuevo cliente
        setClienteEncontrado(false);
        setLatitud(undefined);
        setLongitud(undefined);
        setGoogleMapsUrl('');
        setError('Cliente no encontrado. Complete los datos para agregarlo.');
      }
    } catch (err: any) {
      console.error('Error al buscar cliente:', err);
      setError('Error al buscar cliente por RUC');
      setClienteEncontrado(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    // Validaciones
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!idCiudad) {
      setError('Debe seleccionar una ciudad');
      return;
    }

    // Si el cliente ya fue encontrado, guardar geolocalización si cambió y seleccionarlo
    if (clienteEncontrado && idPersona) {
      if (latitud && longitud) {
        try {
          await distribucionService.actualizarGeolocalizacion(idPersona, latitud, longitud);
        } catch (err) {
          console.error('Error al guardar geolocalización de cliente existente:', err);
        }
      }

      const clienteData: ClienteData = {
        idPersona,
        'ruc': ruc || '',
        'dv': dv || '',
        nombre,
        'apellido': apellido || '',
        direccion,
        idDepartamento,
        idDistrito,
        idCiudad,
        telefono,
        celular,
        email,
        fechaNacimiento,
        porcentajeDescuento: porcentajeDescuento || 0,
        latitud,
        longitud,
      };

      onClienteSelected(clienteData);
      handleCancelar();
      return;
    }

    // Si no fue encontrado, agregar nuevo cliente
    setLoading(true);
    setError('');

    try {
      const nuevoCliente = await personaService.agregarClienteRapido({
        ruc,
        dv,
        nombre,
        apellido,
        direccion: direccion || undefined,
        fechaNacimiento: fechaNacimiento || undefined,
        celular: celular || undefined,
        email: email || undefined,
        idCiudad: parseInt(idCiudad),
        idUsuarioAlta: idUsuario,
        idTipoDocumento: tipoDocumento,
        idGrupoCliente: idGrupoCliente
      });

      // Si se definió geolocalización, guardarla
      if (latitud && longitud) {
        try {
          await distribucionService.actualizarGeolocalizacion(nuevoCliente.idCliente || nuevoCliente.idPersona, latitud, longitud);
        } catch (geoErr) {
          console.error('Error al guardar geolocalización:', geoErr);
        }
      }

      // Seleccionar el cliente recién creado
      const clienteData: ClienteData = {
        idPersona: nuevoCliente.idCliente,
        ruc: nuevoCliente.ruc,
        dv: nuevoCliente.dv,
        nombre: nombre,
        apellido: apellido,
        direccion: nuevoCliente.direccion,
        idDepartamento,
        idDistrito,
        idCiudad,
        telefono,
        celular,
        email,
        fechaNacimiento,
        porcentajeDescuento: nuevoCliente.porcentajeDescuento || 0,
        latitud,
        longitud,
      };

      onClienteSelected(clienteData);
      handleCancelar();
      onSuccess?.();
    } catch (err: any) {
      console.error('Error al agregar cliente:', err);
      setError(err.message || 'Error al agregar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    // Limpiar formulario
    setIdPersona(undefined);
    setClienteEncontrado(false);
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
    setPorcentajeDescuento(0);
    setIdGrupoCliente(1);
    setLatitud(undefined);
    setLongitud(undefined);
    setGoogleMapsUrl('');
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
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="grupo-cliente-label">Grupo Cliente</InputLabel>
              <Select
                labelId="grupo-cliente-label"
                value={idGrupoCliente}
                onChange={(e) => setIdGrupoCliente(Number(e.target.value))}
                label="Grupo Cliente"
              >
                {gruposCliente.map((grupo) => (
                  <MenuItem key={grupo.idGrupoCliente} value={grupo.idGrupoCliente}>
                    {grupo.nombreGrupoCliente}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Nombre y Apellido */}
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Nombre"
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

          {/* Geolocalización de Entrega */}
          <Box sx={{ mt: 1, p: 2, border: '1px dashed #bbb', borderRadius: '8px', bgcolor: 'background.paper' }}>
            <Typography variant="subtitle2" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
              Ubicación de Entrega (Geolocalización)
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Pegar Enlace de Google Maps"
                placeholder="Ej: https://www.google.com/maps?q=-27.34,-55.86"
                value={googleMapsUrl}
                onChange={(e) => {
                  setGoogleMapsUrl(e.target.value);
                  parseGoogleMapsUrl(e.target.value);
                }}
                size="small"
              />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Latitud"
                value={latitud !== undefined ? latitud.toString() : ''}
                size="small"
                disabled
              />
              <TextField
                fullWidth
                label="Longitud"
                value={longitud !== undefined ? longitud.toString() : ''}
                size="small"
                disabled
              />
            </Stack>
            <MapaCliente
              latitud={latitud}
              longitud={longitud}
              onChange={(lat, lng) => {
                setLatitud(lat);
                setLongitud(lng);
                setGoogleMapsUrl(`https://www.google.com/maps?q=${lat},${lng}`);
              }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelar} startIcon={<CancelIcon />}>
          Salir
        </Button>
        <Button onClick={handleGuardar} variant="contained" startIcon={<SaveIcon />} color="primary">
          {clienteEncontrado ? 'Añadir' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClienteForm;
