import React from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ProductoResultado {
  idProducto: number;
  codigo: string;
  nombreMercaderia: string;
  precio: number;
  stock: number;
  nombreImpuesto: string;
  origen: string;
}

interface SearchProductModalProps {
  open: boolean;
  onClose: () => void;
  productos: ProductoResultado[];
  onSelectProduct: (producto: ProductoResultado) => void;
}

const SearchProductModal: React.FC<SearchProductModalProps> = ({
  open,
  onClose,
  productos,
  onSelectProduct,
}) => {
  const handleRowClick = (producto: ProductoResultado) => {
    onSelectProduct(producto);
    onClose();
  };

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
          Búsqueda
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
      
      <DialogContent sx={{ p: 0 }}>
        {productos.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No se encontraron productos
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    backgroundColor: '#e3f2fd', 
                    fontWeight: 'bold',
                    borderBottom: '2px solid #90caf9'
                  }}>
                    Código
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#e3f2fd', 
                    fontWeight: 'bold',
                    borderBottom: '2px solid #90caf9'
                  }}>
                    Nombre del Producto
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#e3f2fd', 
                    fontWeight: 'bold',
                    borderBottom: '2px solid #90caf9'
                  }}>
                    Presentación
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    backgroundColor: '#e3f2fd', 
                    fontWeight: 'bold',
                    borderBottom: '2px solid #90caf9'
                  }}>
                    Precio
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    backgroundColor: '#e3f2fd', 
                    fontWeight: 'bold',
                    borderBottom: '2px solid #90caf9'
                  }}>
                    Stock
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productos.map((producto, index) => (
                  <TableRow
                    key={producto.idProducto || index}
                    onClick={() => handleRowClick(producto)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#c8e6c9',
                      },
                      '&:nth-of-type(even)': {
                        backgroundColor: '#f9f9f9',
                      },
                      '&:nth-of-type(even):hover': {
                        backgroundColor: '#c8e6c9',
                      },
                    }}
                  >
                    <TableCell>{producto.codigo}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {producto.nombreMercaderia}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {producto.origen === 'N' ? 'Nacional' : 'Importado'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {producto.nombreImpuesto}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        ₲{producto.precio?.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2"
                        color={producto.stock > 0 ? 'success.main' : 'error.main'}
                        fontWeight="medium"
                      >
                        {producto.stock}
                      </Typography>
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

export default SearchProductModal;
