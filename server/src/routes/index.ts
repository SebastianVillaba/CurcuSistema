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
import pedidoRoutes from './pedido.routes';
import pedidoInternoRoutes from './pedidoInterno.routes';
import deliveryRoutes from './delivery.routes';
import precobranzaRoutes from './precobranza.routes';
import comprasRoutes from './compras.routes';
import planillasRoutes from './planillas.routes'
import sectorRoutes from './sector.routes';
import remisionRoutes from './remision.routes';
import ajustesRoutes from './ajustes.routes';
import impuestoRoutes from './impuesto.routes';
import auditoriaRoutes from './auditoria.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/persona', personaRoutes);
router.use('/producto', productoRoutes);
router.use('/caja', cajaRoutes);
router.use('/ubicaciones', ubicacionRoutes);
router.use('/venta', ventaRoutes);
router.use('/pedido', pedidoRoutes);
router.use('/reporte', reporteRoutes);
router.use('/terminal', terminalRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/precobranza', precobranzaRoutes);
router.use('/compras', comprasRoutes);
router.use('/remisiones', remisionRoutes);
router.use('/pedido-interno', pedidoInternoRoutes);
router.use('/planillas', planillasRoutes);
router.use('/sector', sectorRoutes);
router.use('/ajustes', ajustesRoutes);
router.use('/impuesto', impuestoRoutes);
router.use('/auditoria', auditoriaRoutes);

export default router;