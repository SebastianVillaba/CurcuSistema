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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { comprasService } from '../services/compras.service';

interface ProveedorResultado {
    idProveedor: number;
    nombre: string;
    nombreFantasia: string;
    rucProveedor: string;
    responsable: string;
}

interface SearchProveedorModalProps {
    open: boolean;
    onClose: () => void;
    onProveedorSelected: (proveedor: ProveedorResultado) => void;
}

const SearchProveedorModal: React.FC<SearchProveedorModalProps> = ({
    open,
    onClose,
    onProveedorSelected,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [proveedores, setProveedores] = useState<ProveedorResultado[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    // Para buscar el proveedor
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setProveedores([]);
            setError('');
            return;
        }

        setIsSearching(true);
        setError('');

        try {
            const results = await comprasService.buscarProveedores();

            setProveedores(results);
            console.log(results);

            if (results.length === 0) {
                setError('No se encontraron proveedores');
            }
        } catch (error: any) {
            console.error('Error al buscar proveedores:', error);
            setError(error.message || 'Error al buscar proveedores');
            setProveedores([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleRowClick = (proveedor: ProveedorResultado) => {
        onProveedorSelected(proveedor);
        onClose();
    };

    // Reset state when modal opens
    React.useEffect(() => {
        if (open) {
            setSearchTerm('');
            setProveedores([]);
            setError('');
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
                    Búsqueda de Proveedores
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
                {/* Search bar */}
                <Box sx={{ mb: 2, display: 'flex', gap: 1, mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Buscar proveedor por nombre o RUC"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ingrese nombre o RUC"
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

                {/* Error message */}
                {error && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Lista de proveedores */}
                {proveedores.length > 0 && (
                    <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 350, border: '1px solid #eee' }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre Fantasia</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>RUC</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Responsable</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {proveedores.map((prov) => (
                                    <TableRow
                                        key={prov.idProveedor}
                                        onClick={() => handleRowClick(prov)}
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell>{prov.idProveedor}</TableCell>
                                        <TableCell>{prov.nombre}</TableCell>
                                         <TableCell>{prov.nombreFantasia}</TableCell>
                                        <TableCell>{prov.rucProveedor}</TableCell>
                                        <TableCell>{prov.responsable || '-'}</TableCell>
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

export default SearchProveedorModal;
