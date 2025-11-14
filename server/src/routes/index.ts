import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import personaRoutes from './persona.routes';
import productoRoutes from './producto.routes';
import ubicacionRoutes from './ubicacion.routes';
import ventaRoutes from './venta.routes';
import terminalRoutes from './terminal.routes'; // Importar rutas de terminal
import cajaRoutes from './caja.routes'; // Importar rutas de caja
import reporteRoutes from './reporte.routes'; // Importar rutas de reportes

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/persona', personaRoutes);
router.use('/producto', productoRoutes);
router.use('/ubicaciones', ubicacionRoutes);
router.use('/venta', ventaRoutes);
router.use('/terminal', terminalRoutes); // Registrar rutas de terminal
router.use('/caja', cajaRoutes); // Registrar rutas de caja
router.use('/reporte', reporteRoutes); // Registrar rutas de reportes

export default router;