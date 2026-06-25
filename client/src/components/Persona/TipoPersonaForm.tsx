import {
    Divider,
    FormControlLabel,
    Stack,
    Typography,
    Checkbox,
    Box,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField as MuiTextField
} from '@mui/material';
import MapaCliente from '../MapaCliente';
import TextField from '../UppercaseTextField';
import { useState, useEffect } from 'react';
import type { Persona, GrupoCliente } from '../../types/persona.types';
import { personaService } from '../../services/persona.service';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';

/**
 * Props del componente TipoPersonaForm
 * Recibe los datos del formulario y la función para actualizarlos desde el componente padre
 */
interface TipoPersonaFormProps {
    formData: Persona;
    setFormData: React.Dispatch<React.SetStateAction<Persona>>;
}

/**
 * Componente que maneja los formularios específicos según el tipo de persona usando Tabs
 * - Persona Física: requiere apellido (se ingresa en el nombre completo), permite marcar como Personal
 * - Persona Jurídica: requiere nombre de fantasía, puede ser proveedor
 * - Cliente: requiere código (opcional, se autogenera si es 0)
 */
export const TipoPersonaForm = ({ formData, setFormData }: TipoPersonaFormProps) => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [gruposCliente, setGruposCliente] = useState<GrupoCliente[]>([]);
    const [googleMapsUrl, setGoogleMapsUrl] = useState('');

    useEffect(() => {
        if (formData.latitud !== undefined && formData.longitud !== undefined && formData.latitud !== null && formData.longitud !== null) {
            setGoogleMapsUrl(`https://www.google.com/maps?q=${formData.latitud},${formData.longitud}`);
        } else {
            setGoogleMapsUrl('');
        }
    }, [formData.idPersona]);

    const parseGoogleMapsUrl = (url: string) => {
        if (!url) return;
        
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
                setFormData(prev => ({
                    ...prev,
                    latitud: lat,
                    longitud: lng
                }));
            }
        }
    };

    useEffect(() => {
        const fetchGrupos = async () => {
            try {
                const data = await personaService.obtenerGruposCliente();
                setGruposCliente(data);
            } catch (error) {
                console.error('Error al cargar grupos de clientes:', error);
            }
        };
        fetchGrupos();
    }, []);

    // Sincronizar el tab activo cuando los datos cambian desde el exterior (ej. al seleccionar una persona)
    useEffect(() => {
        if (formData.tipoPersonaJur) {
            setActiveTab(1);
        } else {
            setActiveTab(0);
        }
    }, [formData.tipoPersonaJur, formData.tipoPersonaFis]);

    /**
     * Función helper para manejar cambios en los campos del formulario
     */
    const handleChange = (field: keyof Persona) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    /**
     * Función para manejar cambios en los checkboxes de tipo de persona
     */
    const handleCheckboxChange = (field: keyof Persona) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: event.target.checked,
        }));
    };

    /**
     * Manejador de cambio de pestañas
     */
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        
        // Al seleccionar Física o Jurídica se alternan de forma mutuamente excluyente
        if (newValue === 0) {
            setFormData(prev => ({
                ...prev,
                tipoPersonaFis: true,
                tipoPersonaJur: false,
                tipoProveedor: false,
                nombreFantasia: '',
            }));
        } else if (newValue === 1) {
            setFormData(prev => ({
                ...prev,
                tipoPersonaJur: true,
                tipoPersonaFis: false,
                tipoPersonal: false,
                tipoDelivery: false,
            }));
        }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Clasificación de Persona
            </Typography>

            {/* Pestañas (Tabs) de clasificación con indicadores visuales de activación */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="tabs tipo persona">
                    <Tab 
                        icon={<PersonIcon />} 
                        iconPosition="start" 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>Persona Física</span>
                                {formData.tipoPersonaFis && (
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main' }} />
                                )}
                            </Box>
                        } 
                    />
                    <Tab 
                        icon={<BusinessIcon />} 
                        iconPosition="start" 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>Persona Jurídica</span>
                                {formData.tipoPersonaJur && (
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main' }} />
                                )}
                            </Box>
                        } 
                    />
                    <Tab 
                        icon={<PeopleIcon />} 
                        iconPosition="start" 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>Cliente</span>
                                {formData.tipoPersonaCli && (
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main' }} />
                                )}
                            </Box>
                        } 
                    />
                </Tabs>
            </Box>

            {/* Panel 0: Persona Física / Personal */}
            {activeTab === 0 && (
                <Box sx={{ py: 1 }}>
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                        Datos de Persona Física
                    </Typography>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            label="Apellido"
                            value={formData.apellido  || ''}
                            onChange={handleChange('apellido')}
                            size="small"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.tipoPersonal || false}
                                    onChange={handleCheckboxChange('tipoPersonal')}
                                    size="small"
                                />
                            }
                            label="Es Personal (Empleado del Sistema)"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.tipoDelivery || false}
                                    onChange={handleCheckboxChange('tipoDelivery')}
                                    size="small"
                                />
                            }
                            label="Activar como Delivery"
                        />
                    </Stack>
                </Box>
            )}

            {/* Panel 1: Persona Jurídica / Proveedor */}
            {activeTab === 1 && (
                <Box sx={{ py: 1 }}>
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                        Datos de Persona Jurídica
                    </Typography>
                    <Stack spacing={2.5}>
                        <TextField
                            fullWidth
                            label="Nombre de Fantasía"
                            value={formData.nombreFantasia || ''}
                            onChange={handleChange('nombreFantasia')}
                            size="small"
                            required
                            error={formData.tipoPersonaJur && !formData.nombreFantasia}
                            helperText={formData.tipoPersonaJur && !formData.nombreFantasia ? 'Campo obligatorio para Persona Jurídica' : ''}
                        />

                        {/* Checkbox para marcar como Proveedor */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.tipoProveedor || false}
                                    onChange={handleCheckboxChange('tipoProveedor')}
                                    size="small"
                                />
                            }
                            label="Es Proveedor"
                        />

                        {/* Campos adicionales si es Proveedor */}
                        {formData.tipoProveedor && (
                            <Stack spacing={2} sx={{ pl: 4, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Datos de Proveedor
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Responsable del Proveedor"
                                    value={formData.responsableProveedor || ''}
                                    onChange={handleChange('responsableProveedor')}
                                    size="small"
                                />
                                <TextField
                                    fullWidth
                                    label="Timbrado"
                                    value={formData.timbrado || ''}
                                    onChange={handleChange('timbrado')}
                                    size="small"
                                />
                            </Stack>
                        )}
                    </Stack>
                </Box>
            )}

            {/* Panel 2: Cliente */}
            {activeTab === 2 && (
                <Box sx={{ py: 1 }}>
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                        Datos de Cliente
                    </Typography>
                    <Stack spacing={2.5}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.tipoPersonaCli || false}
                                    onChange={handleCheckboxChange('tipoPersonaCli')}
                                    size="small"
                                />
                            }
                            label="Registrar como Cliente"
                        />
                        
                        {formData.tipoPersonaCli && (
                            <Stack spacing={2} sx={{ pl: 4, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                                    Configuración de Cliente
                                </Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        label="Código de Cliente"
                                        value={formData.codigo || 0}
                                        onChange={handleChange('codigo')}
                                        size="small"
                                        type="number"
                                        sx={{ width: '200px' }}
                                        helperText="Dejar en 0 para auto-generar"
                                    />
                                    <FormControl size="small" sx={{ width: '200px' }}>
                                        <InputLabel id="grupo-cliente-label">Grupo Cliente</InputLabel>
                                        <Select
                                            labelId="grupo-cliente-label"
                                            id="grupo-cliente-select"
                                            value={formData.idGrupoCliente || 0}
                                            label="Grupo Cliente"
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    idGrupoCliente: e.target.value ? Number(e.target.value) : undefined
                                                }));
                                            }}
                                        >
                                            <MenuItem value={0}>
                                                <em>Ninguno</em>
                                            </MenuItem>
                                            {gruposCliente.map((grupo) => (
                                                <MenuItem key={grupo.idGrupoCliente} value={grupo.idGrupoCliente}>
                                                    {grupo.nombreGrupoCliente}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Stack>

                                {/* Geolocalización de Entrega */}
                                <Box sx={{ mt: 2, p: 2, border: '1px dashed #bbb', borderRadius: '8px', bgcolor: 'background.paper' }}>
                                    <Typography variant="subtitle2" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                                        Ubicación de Entrega (Geolocalización)
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                        <MuiTextField
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
                                        <MuiTextField
                                            fullWidth
                                            label="Latitud"
                                            value={formData.latitud !== undefined && formData.latitud !== null ? formData.latitud.toString() : ''}
                                            size="small"
                                            disabled
                                        />
                                        <MuiTextField
                                            fullWidth
                                            label="Longitud"
                                            value={formData.longitud !== undefined && formData.longitud !== null ? formData.longitud.toString() : ''}
                                            size="small"
                                            disabled
                                        />
                                    </Stack>
                                    <MapaCliente
                                        latitud={formData.latitud}
                                        longitud={formData.longitud}
                                        onChange={(lat, lng) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                latitud: lat,
                                                longitud: lng
                                            }));
                                            setGoogleMapsUrl(`https://www.google.com/maps?q=${lat},${lng}`);
                                        }}
                                    />
                                </Box>
                            </Stack>
                        )}
                    </Stack>
                </Box>
            )}

            <Divider sx={{ mt: 3, mb: 1 }} />

            {/* Mensaje de advertencia si no se selecciona ningún tipo */}
            {!formData.tipoPersonaFis && !formData.tipoPersonaJur && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    * Debe seleccionar al menos un tipo de persona (Física o Jurídica)
                </Typography>
            )}
        </Box>
    );
};