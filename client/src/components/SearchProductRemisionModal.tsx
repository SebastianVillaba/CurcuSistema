import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    Box,
    TextField,
    Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { remisionService } from '../services/remision.service';

export interface ProductoRemisionResultado {
    idProducto: number;
    codigo: string;
    nombreMercaderia: string;
    precio: number;
    stock: number;
    idStock: number;
    // Agrega otros campos que devuelva sp_consultaStockParaRemision si son necesarios
}

interface SearchProductRemisionModalProps {
    open: boolean;
    onClose: () => void;
    idTerminalWeb: number;
    onSelectProduct: (producto: ProductoRemisionResultado) => void;
    busqueda?: string;
}

const SearchProductRemisionModal: React.FC<SearchProductRemisionModalProps> = ({
    open,
    onClose,
    idTerminalWeb,
    onSelectProduct,
    busqueda,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [productos, setProductos] = useState<ProductoRemisionResultado[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (term?: string) => {
        const query = term?.trim() ?? searchTerm?.trim();

        if (!query) {
            setProductos([]);
            setError('');
            return;
        }

        setIsSearching(true);
        setError('');

        try {
            const results = await remisionService.consultarStock(query, idTerminalWeb);

            if (results.length === 1) {
                onSelectProduct(results[0]);
                onClose();
            } else {
                setProductos(results);
                if (results.length === 0) {
                    setError('No se encontraron productos');
                }
            }
        } catch (error: any) {
            console.error('Error al buscar productos:', error);
            setError(error.message || 'Error al buscar productos');
            setProductos([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleRowClick = (producto: ProductoRemisionResultado) => {
        onSelectProduct(producto);
        onClose();
    };

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            const initialTerm = busqueda?.trim() ?? '';
            setSearchTerm(initialTerm);
            setProductos([]);
            setError('');

            if (initialTerm) {
                handleSearch(initialTerm);
            }
        }
    }, [open, busqueda]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
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
                    Búsqueda de Productos (Remisión)
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
                <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        label="Buscar producto"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ingrese código, código de barra o nombre del producto"
                        disabled={isSearching}
                    />
                    <IconButton
                        color="primary"
                        onClick={() => handleSearch()}
                        disabled={isSearching || !searchTerm.trim()}
                        size="small"
                    >
                        <SearchIcon />
                    </IconButton>
                </Box>

                {/* Error message */}
                {error && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {productos.length === 0 && !isSearching && searchTerm && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            No se encontraron productos. Intente con otro término de búsqueda.
                        </Typography>
                    </Box>
                )}

                {productos.length > 0 && (
                    <TableContainer component={Paper} elevation={0}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>Código</TableCell>
                                    <TableCell sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>Nombre del Producto</TableCell>
                                    <TableCell align="right" sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>Precio</TableCell>
                                    <TableCell align="right" sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>Stock</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {productos.map((producto, index) => (
                                    <TableRow
                                        key={producto.idProducto || index}
                                        onClick={() => handleRowClick(producto)}
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': { backgroundColor: '#c8e6c9' },
                                            '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' },
                                            '&:nth-of-type(even):hover': { backgroundColor: '#c8e6c9' },
                                        }}
                                    >
                                        <TableCell>{producto.codigo}</TableCell>
                                        <TableCell>{producto.nombreMercaderia}</TableCell>
                                        <TableCell align="right">₲{producto.precio?.toLocaleString()}</TableCell>
                                        <TableCell align="right" sx={{ color: producto.stock > 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                                            {producto.stock}
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

export default SearchProductRemisionModal;
