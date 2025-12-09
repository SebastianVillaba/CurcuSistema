import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
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
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { usuarioService } from '../services/usuario.service';
import type { Persona } from '../types/persona.types';

interface SearchPersonaModalProps {
    open: boolean;
    onClose: () => void;
    onPersonaSelected: (persona: Persona) => void;
}

const SearchPersonaModal: React.FC<SearchPersonaModalProps> = ({
    open,
    onClose,
    onPersonaSelected,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState<1 | 2>(1); // 1: Nombre, 2: RUC/Documento
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setPersonas([]);
            setError('');
            return;
        }

        setIsSearching(true);
        setError('');

        try {
            // Usamos el servicio de usuario para buscar personas con info extra (tieneUsuario)
            const results = await usuarioService.buscarPersonaParaUsuario(searchTerm.trim());
            setPersonas(results);

            if (results.length === 0) {
                setError('No se encontraron personas');
            }
        } catch (error: any) {
            console.error('Error al buscar personas:', error);
            setError(error.message || 'Error al buscar personas');
            setPersonas([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleRowClick = (persona: Persona) => {
        onPersonaSelected(persona);
        onClose();
    };

    // Reset state when modal opens
    React.useEffect(() => {
        if (open) {
            setSearchTerm('');
            setPersonas([]);
            setError('');
            setSearchBy(1);
        }
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    minHeight: '500px',
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
                    Buscar Persona
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

            <DialogContent sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            label="Buscar Persona"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nombre, Apellido o RUC"
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
                </Box>

                {error && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {personas.length > 0 && (
                    <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 350 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>RUC / Doc</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {personas.map((persona: any) => (
                                    <TableRow
                                        key={persona.idPersona}
                                        onClick={() => !persona.tieneUsuario && handleRowClick(persona)}
                                        hover={!persona.tieneUsuario}
                                        sx={{
                                            cursor: persona.tieneUsuario ? 'not-allowed' : 'pointer',
                                            opacity: persona.tieneUsuario ? 0.6 : 1,
                                            backgroundColor: persona.tieneUsuario ? '#f5f5f5' : 'inherit'
                                        }}
                                    >
                                        <TableCell>{persona.idPersona}</TableCell>
                                        <TableCell>{persona.nombreCompleto || `${persona.nombre} ${persona.apellido}`}</TableCell>
                                        <TableCell>{persona.ruc || persona.documento}</TableCell>
                                        <TableCell>{persona.email}</TableCell>
                                        <TableCell>
                                            {persona.tieneUsuario ? (
                                                <Typography variant="caption" color="error" fontWeight="bold">
                                                    YA TIENE USUARIO
                                                </Typography>
                                            ) : (
                                                <Typography variant="caption" color="success.main" fontWeight="bold">
                                                    DISPONIBLE
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SearchPersonaModal;
